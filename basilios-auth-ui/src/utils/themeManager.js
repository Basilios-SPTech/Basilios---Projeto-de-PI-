/**
 * themeManager.js
 * Gerencia 3 temas: light | dark | high-contrast
 * Persiste a escolha em localStorage("app-theme").
 * Aplica data-theme="..." no <html> para que o CSS ative as variáveis certas.
 */

const STORAGE_KEY = 'app-theme';
const VALID = ['light', 'dark', 'high-contrast'];

function get() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return VALID.includes(stored) ? stored : 'light';
}

function set(theme) {
  if (!VALID.includes(theme)) return;
  localStorage.setItem(STORAGE_KEY, theme);
  apply(theme);
}

function apply(theme) {
  const root = document.documentElement;
  // remove classes anteriores
  root.classList.remove('dark', 'hc');
  root.removeAttribute('data-hc');
  document.body.classList.remove('hc', 'dark-mode');

  root.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    root.classList.add('dark');
    document.body.classList.add('dark-mode');
  } else if (theme === 'high-contrast') {
    root.classList.add('hc');
    root.dataset.hc = '1';
    document.body.classList.add('hc');
  } else {
    root.dataset.hc = '0';
  }
}

/** Aplica o tema salvo imediatamente (chamado no carregamento) */
function init() {
  const theme = get();
  apply(theme);
}

// roda no import
init();

export const themeManager = { get, set, VALID };
