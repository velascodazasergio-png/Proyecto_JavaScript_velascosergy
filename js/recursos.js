// ═══════════════════════════════════
//  recursos.js — MÓDULO DE RECURSOS HUMANOS
//  Gestiona el personal disponible para asignar
//  como responsables en actividades.
//  Cada recurso tiene: ID (cédula), nombre, fecha de nacimiento,
//  tipo de sangre, ARL, género, salario y rol.
// ═══════════════════════════════════

/**
 * Renderiza la tabla de recursos humanos.
 * Muestra ID, nombre, rol, ARL, salario y botones de acción.
 */
function renderRecursos() {
  const tbody = document.getElementById('resources-table');

  // Estado vacío: ningún recurso creado aún
  if (!store.recursos.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">👤</div><div class="empty-state-text">No hay recursos creados aún.</div></div></td></tr>';
    return;
  }

  // Genera una fila <tr> por cada recurso
  tbody.innerHTML = store.recursos.map(r => `
    <tr id="rrow-${r.id}">
      <!-- ID del recurso (cédula) en monospace para mejor legibilidad -->
      <td><span style="font-family:monospace;font-size:12px">${r.id}</span></td>
      <!-- Nombre destacado con font-weight -->
      <td style="font-weight:500">${r.nombre}</td>
      <td>${r.rol}</td>
      <!-- ARL: muestra '—' si no tiene -->
      <td>${r.arl || '—'}</td>
      <!-- Salario formateado con separadores de miles -->
      <td>$${Number(r.salario).toLocaleString()}</td>
      <!-- Botones de editar y eliminar -->
      <td style="display:flex;gap:6px">
        <button class="icon-btn" onclick="editRecurso('${r.id}')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn danger" onclick="deleteRecurso('${r.id}')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

/**
 * Abre el modal de creación de recurso nuevo.
 * Desbloquea el campo de ID (editable en creación)
 * y limpia todos los campos.
 */
function openNewRecurso() {
  const idEl = document.getElementById('r-id');
  if (idEl) idEl.readOnly = false;   // ID editable al crear (es la cédula)

  resetForm('r-id', 'r-nombre', 'r-nacimiento', 'r-sangre', 'r-arl', 'r-genero', 'r-rol');
  document.getElementById('r-salario').value    = 0;    // Salario inicial en 0
  document.getElementById('r-edit-id').value    = '';   // Sin ID → modo creación
  document.getElementById('modal-recurso-title').textContent = 'Nuevo Recurso';
  document.getElementById('btn-save-recurso').textContent    = 'Crear Recurso';
  openModal('modal-recurso');
}

/**
 * Guarda un recurso nuevo o actualiza uno existente.
 * En creación: valida que el ID no esté duplicado.
 * En edición: el ID es de solo lectura (no se puede cambiar la cédula).
 */
function saveRecurso() {
  const id         = document.getElementById('r-id').value.trim();
  const nombre     = document.getElementById('r-nombre').value.trim();
  const nacimiento = document.getElementById('r-nacimiento').value;
  const sangre     = document.getElementById('r-sangre').value;
  const arl        = document.getElementById('r-arl').value.trim();
  const genero     = document.getElementById('r-genero').value;
  const salario    = parseFloat(document.getElementById('r-salario').value) || 0;
  const rol        = document.getElementById('r-rol').value;
  const editId     = document.getElementById('r-edit-id').value;   // Vacío si es nuevo

  // Valida campos obligatorios: ID (cédula), nombre y rol
  if (!id || !nombre || !rol) { toast('Completa los campos obligatorios', 'error'); return; }

  if (editId) {
    // ── Edición: actualiza los datos del recurso (sin cambiar el ID) ──
    const r = store.recursos.find(r => r.id == editId);
    if (r) Object.assign(r, { nombre, nacimiento, sangre, arl, genero, salario, rol });
    toast('Recurso actualizado ✓');
  } else {
    // ── Creación: verifica que el ID (cédula) no exista ya ──
    if (store.recursos.find(r => r.id === id)) { toast('Ya existe un recurso con esa ID', 'error'); return; }
    store.recursos.push({ id, nombre, nacimiento, sangre, arl, genero, salario, rol });
    toast('Recurso creado ✓');
  }

  closeModal('modal-recurso');
  resetForm('r-id', 'r-nombre', 'r-nacimiento', 'r-sangre', 'r-arl', 'r-genero', 'r-salario', 'r-rol', 'r-edit-id');
  renderRecursos();
  populateSelects();   // Actualiza el select de responsables en actividades
}

/**
 * Abre el modal en modo edición con los datos del recurso precargados.
 * Bloquea el campo de ID (la cédula no se puede cambiar en edición).
 * @param {string} id - ID (cédula) del recurso a editar
 */
function editRecurso(id) {
  const r = store.recursos.find(r => r.id == id);
  if (!r) return;

  // Bloquea el campo ID en modo edición para evitar cambiar la cédula
  const idEl = document.getElementById('r-id');
  if (idEl) idEl.readOnly = true;

  // Precarga todos los campos del formulario
  document.getElementById('r-id').value         = r.id;
  document.getElementById('r-nombre').value     = r.nombre;
  document.getElementById('r-nacimiento').value = r.nacimiento;
  document.getElementById('r-sangre').value     = r.sangre;
  document.getElementById('r-arl').value        = r.arl;
  document.getElementById('r-genero').value     = r.genero;
  document.getElementById('r-salario').value    = r.salario;
  document.getElementById('r-rol').value        = r.rol;
  document.getElementById('r-edit-id').value    = r.id;   // Marca el ID para saveRecurso()

  document.getElementById('modal-recurso-title').textContent = 'Editar Recurso';
  document.getElementById('btn-save-recurso').textContent    = 'Guardar Cambios';
  openModal('modal-recurso');
}

/**
 * Elimina un recurso del store.
 * También limpia el responsableId en actividades que lo referenciaban.
 * Solicita confirmación antes de eliminar.
 * @param {string} id - ID (cédula) del recurso a eliminar
 */
function deleteRecurso(id) {
  confirmDelete('¿Seguro que deseas eliminar este recurso?', () => {
    store.recursos = store.recursos.filter(r => r.id != id);

    // Limpia las referencias al recurso eliminado en actividades
    store.actividades.forEach(a => { if (a.responsableId == id) a.responsableId = ''; });

    toast('Recurso eliminado');
    renderRecursos();
    populateSelects();
  });
}