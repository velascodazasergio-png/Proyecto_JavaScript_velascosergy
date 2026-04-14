// ═══════════════════════════════════
//  DATA STORE
// ═══════════════════════════════════
let store = {
  proyectos: [
    { id: 1, nombre: 'Campusbuild', desc: 'cualquiera', inicio: '2026-04-10', fin: '2026-04-14' }
  ],
  actividades: [
    { id: 1, nombre: 'Acctividad 1', proyectoId: 1, responsableId: '123456789', inicio: '2026-04-10', duracion: 3, estado: 'Terminada' }
  ],
  hitos: [
    { id: 1, nombre: 'Hito 1', desc: 'Nuevo Hito', proyectoId: 1, estado: 'Cumplido' }
  ],
  recursos: [
    { id: '123456789', nombre: 'Responsable 1', nacimiento: '', sangre: '', arl: 'SURA', genero: '', salario: 3000, rol: 'Ingeniero' }
  ]
};

let currentPage = 'dashboard';
let calYear  = 2026;
let calMonth = 3; // April (0-indexed)
let confirmCallback = null;
let nextId = { p: 2, a: 2, h: 2 };

// ═══════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════
function getProyectoNombre(id) {
  const p = store.proyectos.find(p => p.id == id);
  return p ? p.nombre : 'Sin proyecto';
}

function getRecursoNombre(id) {
  const r = store.recursos.find(r => r.id == id);
  return r ? r.nombre : 'Sin responsable';
}

function estadoBadge(estado) {
  const map = {
    'Pendiente': 'badge-yellow',
    'En Proceso': 'badge-blue',
    'Terminada':  'badge-green',
    'Cumplido':   'badge-green'
  };
  return `<span class="badge ${map[estado] || 'badge-orange'}">${estado}</span>`;
}

function resetForm(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = '';
    else if (el.tagName === 'SELECT') el.selectedIndex = 0;
  });
}

function animateCard(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'background 0.4s, transform 0.3s';
  el.style.background  = 'var(--orange-light)';
  el.style.transform   = 'scale(1.01)';
  setTimeout(() => {
    el.style.background = '';
    el.style.transform  = '';
  }, 600);
}

// ═══════════════════════════════════
//  POPULATE SELECT DROPDOWNS
// ═══════════════════════════════════
function populateSelects() {
  const proyOpts = store.proyectos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
  const recOpts  = store.recursos.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('');

  ['a-proyecto', 'h-proyecto'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<option value="">Seleccionar proyecto</option>' + proyOpts;
  });

  const ar = document.getElementById('a-responsable');
  if (ar) ar.innerHTML = '<option value="">Seleccionar recurso</option>' + recOpts;

  const af = document.getElementById('act-filter');
  if (af) af.innerHTML = '<option value="">Todos</option>' + proyOpts;

  const cf = document.getElementById('cal-project-filter');
  if (cf) cf.innerHTML = '<option value="">Todos</option>' + proyOpts;
}