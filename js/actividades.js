// ═══════════════════════════════════
//  actividades.js — MÓDULO DE ACTIVIDADES
//  Maneja la lista de tareas asignadas a proyectos.
//  Cada actividad tiene: nombre, proyecto, responsable,
//  fecha de inicio, duración en días y estado.
// ═══════════════════════════════════

/**
 * Renderiza la lista de actividades con filtros aplicados.
 * Filtra por proyecto y/o estado según los selects del encabezado.
 */
function renderActividades() {
  const filterP = document.getElementById('act-filter').value;        // ID del proyecto seleccionado (o '' para todos)
  const filterS = document.getElementById('act-filter-status').value; // Estado seleccionado (o '' para todos)

  // Aplica filtros sobre el array de actividades del store
  let acts = store.actividades;
  if (filterP) acts = acts.filter(a => a.proyectoId == filterP);   // Filtra por proyecto
  if (filterS) acts = acts.filter(a => a.estado === filterS);       // Filtra por estado

  const list = document.getElementById('activities-list');

  // Estado vacío: sin actividades que coincidan con los filtros
  if (!acts.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">No hay actividades para mostrar.</div></div>';
    return;
  }

  // Genera el HTML de cada fila de actividad
  list.innerHTML = acts.map(a => `
    <div class="activity-item" id="aitem-${a.id}">
      <div class="activity-left">
        <!-- Nombre de la actividad + badge de estado en línea -->
        <div class="activity-name">${a.nombre} ${estadoBadge(a.estado)}</div>
        <!-- Metadatos: proyecto, responsable, inicio, duración -->
        <div class="activity-meta">
          Proyecto: ${getProyectoNombre(a.proyectoId)} &nbsp;·&nbsp;
          Responsable: ${getRecursoNombre(a.responsableId)} &nbsp;·&nbsp;
          Inicio: ${a.inicio} &nbsp;·&nbsp; Duración: ${a.duracion} día${a.duracion != 1 ? 's' : ''}
        </div>
      </div>
      <!-- Botones de editar y eliminar -->
      <div class="activity-actions">
        <button class="icon-btn" onclick="editActividad(${a.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn danger" onclick="deleteActividad(${a.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>`).join('');
}

/**
 * Abre el modal de creación de actividad nueva.
 * Limpia el formulario y configura el modal para creación.
 */
function openNewActividad() {
  resetForm('a-nombre', 'a-proyecto', 'a-responsable', 'a-inicio');   // Limpia campos de texto y selects
  document.getElementById('a-duracion').value  = 1;                    // Duración mínima: 1 día
  document.getElementById('a-estado').selectedIndex = 0;               // Estado inicial: Pendiente
  document.getElementById('a-edit-id').value   = '';                   // Sin ID → modo creación
  document.getElementById('modal-actividad-title').textContent = 'Nueva Actividad';
  document.getElementById('btn-save-actividad').textContent    = 'Crear Actividad';
  openModal('modal-actividad');
}

/**
 * Guarda una actividad nueva o actualiza una existente.
 * Lee los campos del formulario, valida y actualiza el store.
 */
function saveActividad() {
  const nombre        = document.getElementById('a-nombre').value.trim();
  const proyectoId    = document.getElementById('a-proyecto').value;
  const responsableId = document.getElementById('a-responsable').value;
  const inicio        = document.getElementById('a-inicio').value;
  const duracion      = parseInt(document.getElementById('a-duracion').value) || 1;  // Mínimo 1 día
  const estado        = document.getElementById('a-estado').value;
  const editId        = document.getElementById('a-edit-id').value;   // Vacío si es nueva

  // Valida campos obligatorios
  if (!nombre || !proyectoId || !inicio) { toast('Completa los campos obligatorios', 'error'); return; }

  if (editId) {
    // ── Edición: actualiza la actividad existente ──
    const a = store.actividades.find(a => a.id == editId);
    if (a) Object.assign(a, { nombre, proyectoId: +proyectoId, responsableId, inicio, duracion, estado });
    toast('Actividad actualizada ✓');
    animateCard('aitem-' + editId);   // Flash en la fila editada
  } else {
    // ── Creación: agrega nueva actividad al store ──
    store.actividades.push({ id: nextId.a++, nombre, proyectoId: +proyectoId, responsableId, inicio, duracion, estado });
    toast('Actividad creada ✓');
  }

  closeModal('modal-actividad');
  resetForm('a-nombre', 'a-proyecto', 'a-responsable', 'a-inicio', 'a-duracion', 'a-estado', 'a-edit-id');
  renderActividades();   // Re-renderiza la lista
}

/**
 * Abre el modal en modo edición con los datos de la actividad precargados.
 * @param {number} id - ID de la actividad a editar
 */
function editActividad(id) {
  const a = store.actividades.find(a => a.id == id);
  if (!a) return;
  populateSelects();   // Actualiza los selects antes de precargr valores

  // Precarga los valores actuales en el formulario
  document.getElementById('a-nombre').value       = a.nombre;
  document.getElementById('a-proyecto').value     = a.proyectoId;
  document.getElementById('a-responsable').value  = a.responsableId;
  document.getElementById('a-inicio').value       = a.inicio;
  document.getElementById('a-duracion').value     = a.duracion;
  document.getElementById('a-estado').value       = a.estado;
  document.getElementById('a-edit-id').value      = a.id;   // Marca el ID para saveActividad()

  document.getElementById('modal-actividad-title').textContent = 'Editar Actividad';
  document.getElementById('btn-save-actividad').textContent    = 'Guardar Cambios';
  openModal('modal-actividad');
}

/**
 * Elimina una actividad del store.
 * Solicita confirmación antes de eliminar.
 * @param {number} id - ID de la actividad a eliminar
 */
function deleteActividad(id) {
  confirmDelete('¿Seguro que deseas eliminar esta actividad?', () => {
    store.actividades = store.actividades.filter(a => a.id != id);
    toast('Actividad eliminada');
    renderActividades();
  });
}