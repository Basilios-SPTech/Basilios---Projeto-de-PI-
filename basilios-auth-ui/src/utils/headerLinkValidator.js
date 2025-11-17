/**
 * Verifica se as seções passadas existem na página.
 * Procura tanto por ordem (index) quanto por nome via data-section="Nome".
 * Loga warnings no console se faltarem.
 * @param {string[]} expectedNames
 * @returns {boolean} true se tudo certo
 */
export function validateSectionsPresence(expectedNames = []) {
  const problems = [];
  expectedNames.forEach((name, idx) => {
    const byIndex = document.querySelectorAll("section[data-section]")[idx];
    const byName  = document.querySelector(`section[data-section="${name}"]`);
    if (!byIndex && !byName) {
      problems.push(`Seção "${name}" não encontrada (índice ${idx}).`);
    }
  });
  if (problems.length) {
    console.warn("[Header Validation] Seções faltando:", problems);
  }
  return problems.length === 0;
}

/**
 * Verifica se os hrefs (âncoras #id) existem no DOM.
 * Ignora rotas absolutas/externas (sem #).
 * @param {string[]} hrefs
 * @returns {boolean} true se tudo certo
 */
export function validateSidebarHrefs(hrefs = []) {
  const problems = [];
  hrefs.forEach((href) => {
    if (!href?.startsWith("#")) return; // se for rota/URL externa, ignora
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) problems.push(`Âncora "${href}" não encontrada no DOM.`);
  });
  if (problems.length) {
    console.warn("[Sidebar Validation] Âncoras faltando:", problems);
  }
  return problems.length === 0;
}
