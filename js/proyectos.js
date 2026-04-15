// ═══════════════════════════════════
//  proyectos.js — MÓDULO DE PROYECTOS
//  Maneja la visualización, creación, edición y eliminación
//  de proyectos. Los proyectos son el contenedor principal;
//  agrupan actividades e hitos.
// ═══════════════════════════════════

/**
 * Renderiza la grid de tarjetas de proyectos.
 * Cada tarjeta muestra: nombre, descripción, fechas,
 * cantidad de actividades y barra de progreso.
 */
function renderProyectos() {
  const list = document.getElementById('projects-list');

  // Estado vacío: ningún proyecto creado aún
  if (!store.proyectos.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No hay proyectos creados aún.</div></div>';
    return;
  }

  // Genera el HTML de cada tarjeta de proyecto
  list.innerHTML = store.proyectos.map(p => {
    const acts = store.actividades.filter(a => a.proyectoId == p.id);   // Actividades de este proyecto
    const done = acts.filter(a => a.estado === 'Terminada').length;      // Cuántas están terminadas
    const pct  = acts.length ? Math.round(done / acts.length * 100) : 0; // % de completitud

    return `
    <div class="project-card" id="pcard-${p.id}">
      <!-- Botones de editar y eliminar, en la esquina superior derecha -->
      <div class="project-card-actions">
        <button class="icon-btn" onclick="editProyecto(${p.id}); event.stopPropagation()">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn danger" onclick="deleteProyecto(${p.id}); event.stopPropagation()">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
      <!-- Información principal del proyecto -->
      <div class="project-card-title">${p.nombre}</div>
      <div class="project-card-desc">${p.desc || 'Sin descripción'}</div>
      <div class="project-card-dates">Inicio: ${p.inicio} &nbsp; Fin: ${p.fin}</div>
      <!-- Resumen de actividades y porcentaje completado -->
      <div style="font-size:12px;color:var(--text-muted);margin-top:10px">${acts.length} actividades · ${pct}% completado</div>
      <!-- Barra de progreso visual del proyecto -->
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

/**
 * Abre el modal de creación de proyecto nuevo.
 * Limpia el formulario y ajusta el título y texto del botón.
 */
function openNewProyecto() {
  resetForm('p-nombre', 'p-desc', 'p-inicio', 'p-fin');    // Limpia todos los campos
  document.getElementById('p-edit-id').value = '';           // Asegura que no haya ID de edición
  document.getElementById('modal-proyecto-title').textContent  = 'Nuevo Proyecto';
  document.getElementById('btn-save-proyecto').textContent     = 'Crear Proyecto';
  openModal('modal-proyecto');
}

/**
 * Guarda un proyecto nuevo o actualiza uno existente.
 * Lee los valores del formulario, valida los obligatorios
 * y actualiza el store según si es creación o edición.
 */
function saveProyecto() {
  const nombre  = document.getElementById('p-nombre').value.trim();
  const desc    = document.getElementById('p-desc').value.trim();
  const inicio  = document.getElementById('p-inicio').value;
  const fin     = document.getElementById('p-fin').value;
  const editId  = document.getElementById('p-edit-id').value;   // Vacío si es nuevo, tiene ID si es edición

  // Valida campos obligatorios: nombre, fecha inicio y fecha fin
  if (!nombre || !inicio || !fin) { toast('Completa los campos obligatorios', 'error'); return; }

  if (editId) {
    // ── Edición: actualiza el proyecto existente en el store ──
    const p = store.proyectos.find(p => p.id == editId);
    if (p) { p.nombre = nombre; p.desc = desc; p.inicio = inicio; p.fin = fin; }
    toast('Proyecto actualizado ✓');
    animateCard('pcard-' + editId);   // Flash de feedback visual en la tarjeta editada
  } else {
    // ── Creación: agrega un nuevo proyecto al store ──
    store.proyectos.push({ id: nextId.p++, nombre, desc, inicio, fin });
    toast('Proyecto creado ✓');
  }

  closeModal('modal-proyecto');
  renderProyectos();      // Re-renderiza la grid
  populateSelects();      // Actualiza los selects de proyectos en toda la app
}

/**
 * Abre el modal en modo edición con los datos del proyecto precargados.
 * @param {number} id - ID del proyecto a editar
 */
function editProyecto(id) {
  const p = store.proyectos.find(p => p.id == id);
  if (!p) return;

  // Precarga los valores actuales del proyecto en el formulario
  document.getElementById('p-nombre').value   = p.nombre;
  document.getElementById('p-desc').value     = p.desc;
  document.getElementById('p-inicio').value   = p.inicio;
  document.getElementById('p-fin').value      = p.fin;
  document.getElementById('p-edit-id').value  = p.id;   // Marca el ID para saveProyecto()

  document.getElementById('modal-proyecto-title').textContent = 'Editar Proyecto';
  document.getElementById('btn-save-proyecto').textContent    = 'Guardar Cambios';
  openModal('modal-proyecto');
}

/**
 * Elimina un proyecto y todos sus datos asociados
 * (actividades e hitos que pertenezcan a ese proyecto).
 * Solicita confirmación antes de eliminar.
 * @param {number} id - ID del proyecto a eliminar
 */
function deleteProyecto(id) {
  confirmDelete('Se eliminará el proyecto y todas sus actividades e hitos asociados.', () => {
    store.proyectos   = store.proyectos.filter(p => p.id != id);           // Elimina el proyecto
    store.actividades = store.actividades.filter(a => a.proyectoId != id); // Elimina actividades asociadas
    store.hitos       = store.hitos.filter(h => h.proyectoId != id);       // Elimina hitos asociados
    toast('Proyecto eliminado');
    renderProyectos();
    populateSelects();
  });
}