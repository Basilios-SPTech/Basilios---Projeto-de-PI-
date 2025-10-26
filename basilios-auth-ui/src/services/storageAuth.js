// src/services/storageAuth.js
const KEY = 'auth_token'

// cache em memória pra evitar re-decodificar a cada render
let _cachedToken = null
let _cachedClaims = null
let _cachedRoles = null
const _subs = new Set()

function base64UrlToString(b64url) {
  // lida com base64url (JWT) sem estourar com padding
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  const s = b64 + pad;
  try {
    return decodeURIComponent(
      atob(s).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch {
    // fallback
    return atob(s);
  }
}

function decodeJwt(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payloadStr = base64UrlToString(parts[1])
    return JSON.parse(payloadStr)
  } catch {
    return null
  }
}

function normalizeRoleName(r) {
  if (!r) return null
  let up = String(r).trim().toUpperCase()
  // aceita ADMIN / CLIENTE sem prefixo
  if (!up.startsWith('ROLE_') && /^(ADMIN|CLIENTE)$/.test(up)) {
    up = `ROLE_${up}`
  }
  return up
}

function extractRolesFromClaims(claims) {
  // Aceita vários formatos comuns:
  // - claims.roles: ["ROLE_ADMIN", "ROLE_CLIENTE"] ou ["ADMIN", "CLIENTE"]
  // - claims.authorities: idem, ou [{authority:"ROLE_ADMIN"}]
  // - claims.scope: "ROLE_ADMIN ROLE_CLIENTE" ou "ADMIN CLIENTE"
  // - Keycloak: realm_access.roles / resource_access[app].roles
  const bag = new Set()

  const pushMany = (arr) => {
    (arr || []).forEach(r => {
      if (r && typeof r === 'object' && r.authority) {
        const nr = normalizeRoleName(r.authority)
        if (nr) bag.add(nr)
      } else {
        const nr = normalizeRoleName(r)
        if (nr) bag.add(nr)
      }
    })
  }

  if (Array.isArray(claims?.roles)) pushMany(claims.roles)
  if (Array.isArray(claims?.authorities)) pushMany(claims.authorities)

  if (typeof claims?.scope === 'string') {
    pushMany(claims.scope.split(/\s+/))
  }

  if (claims?.realm_access?.roles) pushMany(claims.realm_access.roles)
  if (claims?.resource_access && typeof claims.resource_access === 'object') {
    Object.values(claims.resource_access).forEach(v => v?.roles && pushMany(v.roles))
  }

  return Array.from(bag)
}

function isExpired(claims) {
  // exp em segundos desde epoch
  if (!claims?.exp) return false
  const nowSec = Math.floor(Date.now() / 1000)
  return claims.exp <= nowSec
}

function recomputeCaches(token) {
  _cachedToken = token || null
  _cachedClaims = token ? decodeJwt(token) : null
  _cachedRoles = _cachedClaims ? extractRolesFromClaims(_cachedClaims) : []
}

function notify() {
  _subs.forEach(fn => {
    try { fn(getSnapshot()) } catch {}
  })
}

function getSnapshot() {
  return {
    token: _cachedToken,
    claims: _cachedClaims,
    roles: _cachedRoles,
    isAuthenticated: !!_cachedToken && !_cachedClaims ? true : !!_cachedToken && !isExpired(_cachedClaims),
  }
}

// init cache
recomputeCaches(getTokenRaw())

function getTokenRaw() {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export const authStorage = {
  // token cru (string)
  getToken() {
    return _cachedToken
  },

  // grava/limpa e reprocessa claims/roles
  setToken(token) {
    try {
      if (token) localStorage.setItem(KEY, token)
      else localStorage.removeItem(KEY)
    } catch {}
    recomputeCaches(token)
    notify()
  },

  clear() {
    try { localStorage.removeItem(KEY) } catch {}
    recomputeCaches(null)
    notify()
  },

  // estado derivado
  getClaims() {
    return _cachedClaims
  },

  getRoles() {
    return Array.from(_cachedRoles || [])
  },

  hasRole(...required) {
    const want = required.map(normalizeRoleName).filter(Boolean)
    if (!want.length) return true
    const have = new Set(this.getRoles())
    return want.every(r => have.has(r))
  },

  isAdmin() {
    return this.hasRole('ROLE_ADMIN')
  },

  isAuthenticated() {
    if (!_cachedToken) return false
    // se houver exp, respeita; se não houver, considera autenticado (depende do backend)
    return !_cachedClaims ? true : !isExpired(_cachedClaims)
  },

  // observer simples para reagir a login/logout em qualquer parte da app
  subscribe(cb) {
    _subs.add(cb)
    // emit snapshot inicial
    try { cb(getSnapshot()) } catch {}
    return () => _subs.delete(cb)
  },
}
