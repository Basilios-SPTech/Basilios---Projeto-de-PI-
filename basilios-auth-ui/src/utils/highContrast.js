// Importa estilos do widget + regras de alto contraste
import '../styles/hc-toggle.css';
import '../styles/high-contrast.css';

// Config pública opcional (defina em window.HC_TOGGLE_CONFIG no index.html se quiser)
const cfg = window.HC_TOGGLE_CONFIG || {};
const side = (cfg.side === 'left') ? 'left' : 'right';
const baseOffset = Number(cfg.baseOffset || 120);

function getInitialEnabled() {
  const stored = localStorage.getItem('hc-enabled');
  if (stored !== null) return stored === 'true';
  // fallback: respeita prefers-contrast: more
  const prefersMore = window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches;
  return !!prefersMore;
}

function apply(enabled) {
  const root = document.documentElement;
  const body = document.body;
  if (enabled) {
    root.dataset.hc = '1';
    body.classList.add('hc');
  } else {
    root.dataset.hc = '0';
    body.classList.remove('hc');
  }
  localStorage.setItem('hc-enabled', String(enabled));
  const label = document.getElementById('hc-current');
  if (label) label.textContent = enabled ? 'Ativo' : 'Desligado';
}

function mountToggle() {
  const host = document.createElement('div');
  host.id = 'hc-toggle';
  host.className = 'hc-toggle';
  host.style.bottom = baseOffset + 'px';
  if (side === 'left') {
    host.style.insetInlineStart = '24px';
    host.style.insetInlineEnd = 'auto';
  }

  host.innerHTML = `
    <button class="hc-btn" id="hc-btn" aria-haspopup="true" aria-expanded="false" aria-label="Alto contraste">
      <img src="/icons8-contraste-100.png" alt="" aria-hidden="true" />
    </button>
    <div class="hc-pop" id="hc-pop" role="menu" aria-label="Opções de alto contraste">
      <div class="hc-item" role="menuitem" tabindex="0" data-act="on">Ativar alto contraste</div>
      <div class="hc-item" role="menuitem" tabindex="0" data-act="off">Desligar alto contraste</div>
      <div class="hc-sep"></div>
      <div class="hc-item" role="menuitem" tabindex="0" data-act="status">Status: <strong id="hc-current"></strong></div>
    </div>
  `;
  document.body.appendChild(host);

  const btn = host.querySelector('#hc-btn');
  const pop = host.querySelector('#hc-pop');

  let hoverTimer;
  const open = () => { pop.classList.add('open'); btn.setAttribute('aria-expanded','true'); };
  const close = () => { pop.classList.remove('open'); btn.setAttribute('aria-expanded','false'); };

  btn.addEventListener('mouseenter', open);
  btn.addEventListener('focus', open);
  btn.addEventListener('mouseleave', () => hoverTimer = setTimeout(close, 150));
  pop.addEventListener('mouseenter', () => clearTimeout(hoverTimer));
  pop.addEventListener('mouseleave', () => hoverTimer = setTimeout(close, 150));
  btn.addEventListener('click', () => pop.classList.toggle('open'));

  pop.addEventListener('click', (e) => {
    const item = e.target.closest('.hc-item');
    if (!item) return;
    const act = item.dataset.act;
    if (act === 'on') apply(true);
    if (act === 'off') apply(false);
  });

  pop.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); btn.focus(); }
    if (e.key === 'Enter' || e.key === ' ') {
      const el = document.activeElement;
      if (el && el.classList.contains('hc-item')) el.click();
    }
  });
}

(function init() {
  const enabled = getInitialEnabled();
  // aplica imediatamente pra evitar "flash" em branco
  if (enabled) {
    document.documentElement.dataset.hc = '1';
    document.addEventListener('DOMContentLoaded', () => document.body.classList.add('hc'), { once: true });
  } else {
    document.documentElement.dataset.hc = '0';
  }
  document.addEventListener('DOMContentLoaded', () => {
    apply(enabled);
    mountToggle();
  }, { once: true });
})();
