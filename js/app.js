// ═══════════════════════════════════════
//   campusbuild.js
//   Lógica principal de la aplicación
// ═══════════════════════════════════════

// ── Estado global ──
const state = {
  proyectos: [],
  actividades: {
    pendientes: 0,
    proceso: 0,
    terminadas: 0
  },
  hitos: {
    total: 0,
    completados: 0
  },
  usuarios: [],
  recursos: 0
};


// ═══════════════════════════════════════
//   NAVEGACIÓN ENTRE PÁGINAS
// ═══════════════════════════════════════

function showPage(pageId, btn) {
  // Ocultar todas las páginas
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });

  // Quitar active de todos los nav-items
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
  });

  // Mostrar la página seleccionada
  document.getElementById('page-' + pageId).classList.add('active');

  // Marcar el botón de nav como activo
  if (btn) {
    btn.classList.add('active');
  }

  // Actualizar el topbar
  const labels = {
    dashboard:   'Dashboard',
    proyectos:   'Proyectos',
    actividades: 'Actividades',
    hitos:       'Hitos',
    recursos:    'Recursos',
    calendario:  'Calendario'
  };
  document.getElementById('topbarPage').textContent = labels[pageId] || pageId;

  // Acciones especiales por página
  if (pageId === 'calendario') {
    renderCalendario();
  }
}


// ═══════════════════════════════════════
//   MODAL NUEVO PROYECTO
// ═══════════════════════════════════════

function openModal() {
  document.getElementById('modalBackdrop').classList.add('open');
  document.getElementById('fNombre').focus();
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalBackdrop')) {
    closeModal();
  }
}


// ═══════════════════════════════════════
//   CREAR PROYECTO
// ═══════════════════════════════════════

function crearProyecto() {
  const nombre   = document.getElementById('fNombre').value.trim();
  const desc     = document.getElementById('fDesc').value.trim();
  const inicio   = document.getElementById('fInicio').value;
  const fin      = document.getElementById('fFin').value;
  const estado   = document.getElementById('fEstado').value;
  const progreso = parseInt(document.getElementById('fProgreso').value) || 0;

  // Validaciones
  if (!nombre) {
    document.getElementById('fNombre').focus();
    showToast('⚠ El nombre del proyecto es obligatorio');
    return;
  }

  if (!inicio || !fin) {
    showToast('⚠ Las fechas de inicio y fin son obligatorias');
    return;
  }

  if (new Date(fin) < new Date(inicio)) {
    showToast('⚠ La fecha de fin no puede ser anterior al inicio');
    return;
  }

  const proyecto = {
    id:       Date.now(),
    nombre,
    desc:     desc || 'Sin descripción',
    inicio,
    fin,
    estado,
    progreso: Math.min(100, Math.max(0, progreso))
  };

  state.proyectos.push(proyecto);

  closeModal();
  limpiarModal();
  actualizarUI();

  showToast('✓ Proyecto "' + nombre + '" creado correctamente');
}

function limpiarModal() {
  document.getElementById('fNombre').value   = '';
  document.getElementById('fDesc').value     = '';
  document.getElementById('fInicio').value   = '';
  document.getElementById('fFin').value      = '';
  document.getElementById('fEstado').value   = 'activo';
  document.getElementById('fProgreso').value = '0';
}


// ═══════════════════════════════════════
//   ACTUALIZAR TODA LA UI
// ═══════════════════════════════════════

function actualizarUI() {
  const totalAct = state.actividades.pendientes
                 + state.actividades.proceso
                 + state.actividades.terminadas;
  const maxAct   = totalAct || 1; // evita división por cero

  // ── Stats ──
  document.getElementById('statProyectos').textContent   = state.proyectos.length;
  document.getElementById('statActividades').textContent = totalAct;
  document.getElementById('statHitos').textContent       = state.hitos.total;
  document.getElementById('statRecursos').textContent    = state.usuarios.length;

  // ── Conteo usuarios ──
  document.getElementById('usuariosCount').textContent   = state.usuarios.length;

  // ── Barras de actividades ──
  const pctPend = Math.round((state.actividades.pendientes / maxAct) * 100);
  const pctProc = Math.round((state.actividades.proceso    / maxAct) * 100);
  const pctTerm = Math.round((state.actividades.terminadas / maxAct) * 100);

  document.getElementById('actPendientes').textContent = state.actividades.pendientes;
  document.getElementById('actProceso').textContent    = state.actividades.proceso;
  document.getElementById('actTerminadas').textContent = state.actividades.terminadas;

  document.getElementById('barPendientes').style.width = pctPend + '%';
  document.getElementById('barProceso').style.width    = pctProc + '%';
  document.getElementById('barTerminadas').style.width = pctTerm + '%';

  // ── Progreso de hitos ──
  const hPct = state.hitos.total > 0
    ? Math.round((state.hitos.completados / state.hitos.total) * 100)
    : 0;

  document.getElementById('hitosCompletados').textContent = state.hitos.completados;
  document.getElementById('hitosDesc').textContent        = `de ${state.hitos.total} hitos completados`;
  document.getElementById('hitoBar').style.width          = hPct + '%';
  document.getElementById('hitosHint').textContent        = state.hitos.total === 0
    ? 'No hay hitos definidos aún.'
    : hPct + '% completado';

  // ── Listas ──
  renderUsuarios();
  renderRecentProyectos();
  renderProyectosGrid();
}


// ═══════════════════════════════════════
//   RENDER: USUARIOS
// ═══════════════════════════════════════

function renderUsuarios() {
  const wrap = document.getElementById('usuariosList');

  if (state.usuarios.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><p>Sin usuarios registrados aún</p></div>`;
    return;
  }

  wrap.innerHTML = state.usuarios.map(u => `
    <div style="
      display:flex; align-items:center; gap:12px;
      padding:10px 0; border-bottom:1px solid var(--border-lite)
    ">
      <div style="
        width:34px; height:34px; border-radius:50%;
        background:var(--orange-bg); color:var(--orange);
        display:flex; align-items:center; justify-content:center;
        font-size:0.75rem; font-weight:700; flex-shrink:0;
      ">${u.nombre.charAt(0).toUpperCase()}</div>
      <div>
        <p style="font-size:0.83rem;font-weight:600;color:var(--text)">${u.nombre}</p>
        <p style="font-size:0.7rem;color:var(--text-muted)">${u.rol}</p>
      </div>
    </div>
  `).join('');
}


// ═══════════════════════════════════════
//   RENDER: PROYECTOS RECIENTES
// ═══════════════════════════════════════

function renderRecentProyectos() {
  const wrap     = document.getElementById('recentProyectos');
  const recientes = [...state.proyectos].reverse().slice(0, 5);

  if (recientes.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <p>No hay proyectos. <span class="link-crear" onclick="openModal()">Crear uno</span></p>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <table class="proyectos-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Estado</th>
          <th>Progreso</th>
          <th>Fecha Fin</th>
        </tr>
      </thead>
      <tbody id="recentTbody"></tbody>
    </table>`;

  const tbody = document.getElementById('recentTbody');

  recientes.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="proyecto-name">
          ${p.nombre}
          <small>${p.desc.substring(0, 50)}${p.desc.length > 50 ? '…' : ''}</small>
        </div>
      </td>
      <td><span class="badge-status ${p.estado}">${cap(p.estado)}</span></td>
      <td>
        <div class="progress-mini-wrap">
          <div class="progress-mini">
            <div class="progress-mini-fill" style="width:${p.progreso}%"></div>
          </div>
          <span class="progress-pct">${p.progreso}%</span>
        </div>
      </td>
      <td style="color:var(--text-dim);font-size:0.76rem">${formatDate(p.fin)}</td>
    `;
    tbody.appendChild(tr);
  });
}


// ═══════════════════════════════════════
//   RENDER: GRID DE PROYECTOS
// ═══════════════════════════════════════

function renderProyectosGrid() {
  const grid = document.getElementById('proyectosGrid');

  if (state.proyectos.length === 0) {
    grid.innerHTML = `
      <div class="empty-state card" style="padding:40px; grid-column:1/-1">
        <p>Aún no tienes proyectos.</p>
        <p><span class="link-crear" onclick="openModal()">Crea tu primer proyecto</span></p>
      </div>`;
    return;
  }

  grid.innerHTML = '';

  state.proyectos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'proyecto-card';
    card.innerHTML = `
      <div class="proyecto-card-top">
        <div><h3>${p.nombre}</h3></div>
        <span class="badge-status ${p.estado}">${cap(p.estado)}</span>
      </div>
      <p class="desc">${p.desc}</p>
      <div class="progress-mini-wrap" style="margin-bottom:12px">
        <div class="progress-mini">
          <div class="progress-mini-fill" style="width:${p.progreso}%"></div>
        </div>
        <span class="progress-pct">${p.progreso}%</span>
      </div>
      <div class="proyecto-card-meta">
        <div class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${formatDate(p.inicio)}
        </div>
        <div class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          ${formatDate(p.fin)}
        </div>
      </div>`;
    grid.appendChild(card);
  });
}


// ═══════════════════════════════════════
//   RENDER: CALENDARIO
// ═══════════════════════════════════════

function renderCalendario() {
  const body      = document.getElementById('calendarBody');
  const now       = new Date();
  const year      = now.getFullYear();
  const month     = now.getMonth();
  const monthName = now.toLocaleString('es', { month: 'long', year: 'numeric' });
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today     = now.getDate();

  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  let html = `
    <div style="
      text-align:center; font-weight:700; font-size:1rem;
      margin-bottom:18px; text-transform:capitalize; color:var(--text)
    ">${monthName}</div>
    <div style="
      display:grid; grid-template-columns:repeat(7,1fr);
      gap:4px; margin-bottom:8px
    ">
      ${dias.map(d => `
        <div style="
          text-align:center; font-size:0.65rem; font-weight:700;
          color:var(--text-muted); text-transform:uppercase; padding:4px
        ">${d}</div>
      `).join('')}
    </div>
    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px">`;

  // Celdas vacías antes del primer día
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < offset; i++) {
    html += `<div></div>`;
  }

  // Días del mes
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today;
    html += `
      <div style="
        text-align:center; padding:8px 4px; border-radius:7px;
        font-size:0.82rem;
        font-weight:${isToday ? '700' : '400'};
        background:${isToday ? 'var(--orange)' : 'transparent'};
        color:${isToday ? '#fff' : 'var(--text-dim)'};
        cursor:pointer;
        transition:background 0.15s;
      "
      onmouseover="if(!${isToday}) this.style.background='var(--surface2)'"
      onmouseout="if(!${isToday}) this.style.background='transparent'"
      >${d}</div>`;
  }

  html += `</div>`;
  body.innerHTML = html;
}


// ═══════════════════════════════════════
//   UTILIDADES
// ═══════════════════════════════════════

function formatDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}


// ═══════════════════════════════════════
//   EVENTOS GLOBALES
// ═══════════════════════════════════════

// ESC cierra el modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});


// ═══════════════════════════════════════
//   INICIALIZACIÓN
// ═══════════════════════════════════════
actualizarUI();