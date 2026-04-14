// ═══════════════════════════════════
//  INIT — se ejecuta al cargar la página
// ═══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initModalOverlayClose();
  populateSelects();
  navigate('dashboard');
});