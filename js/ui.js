// ═══════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════
function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));

  const navItems = document.querySelectorAll('.nav-item');
  const pages    = ['dashboard','proyectos','actividades','hitos','recursos','calendario'];
  const idx      = pages.indexOf(page);
  if (idx >= 0) navItems[idx].classList.add('active');

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const labels = {
    dashboard:   'Dashboard',
    proyectos:   'Proyectos',
    actividades: 'Actividades',
    hitos:       'Hitos',
    recursos:    'Recursos',
    calendario:  'Calendario'
  };
  document.getElementById('topbar').textContent = labels[page] || page;
  currentPage = page;

  if (page === 'dashboard')   renderDashboard();
  else if (page === 'proyectos')   renderProyectos();
  else if (page === 'actividades') renderActividades();
  else if (page === 'hitos')       renderHitos();
  else if (page === 'recursos')    renderRecursos();
  else if (page === 'calendario')  renderCalendar();
}

// ═══════════════════════════════════
//  MODAL
// ═══════════════════════════════════
function openModal(id) {
  populateSelects();
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function initModalOverlayClose() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) closeModal(this.id);
    });
  });
}

// ═══════════════════════════════════
//  TOAST
// ═══════════════════════════════════
function toast(msg, type = 'success') {
  const tc = document.getElementById('toast-container');
  const t  = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = (type === 'success' ? '✓ ' : '✕ ') + msg;
  tc.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ═══════════════════════════════════
//  CONFIRM DELETE DIALOG
// ═══════════════════════════════════
function confirmDelete(msg, cb) {
  document.getElementById('confirm-msg').textContent = msg;
  confirmCallback = cb;
  document.getElementById('confirm-ok-btn').onclick = () => {
    cb();
    closeModal('modal-confirm');
  };
  openModal('modal-confirm');
}