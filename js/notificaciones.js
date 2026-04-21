// ═══════════════════════════════════════════════════════════
//  notificaciones.js — SISTEMA DE NOTIFICACIONES
//  Se integra con actividades.js y hitos.js existentes.
//  Carga DESPUÉS de todos los demás scripts.
// ═══════════════════════════════════════════════════════════

const LS_NOTIF = 'cb_notificaciones';

// ── Leer / Guardar ──────────────────────────────────────────
function notifGetAll() {
  try { return JSON.parse(localStorage.getItem(LS_NOTIF)) || []; }
  catch { return []; }
}
function notifSave(list) {
  localStorage.setItem(LS_NOTIF, JSON.stringify(list));
}

// ── Crear notificación ──────────────────────────────────────
function notifCrear(tipo, mensaje) {
  const list = notifGetAll();
  list.unshift({
    id:      Date.now(),
    tipo,
    mensaje,
    leida:   false,
    fecha:   new Date().toISOString()
  });
  notifSave(list);
  notifActualizarBadge();
  notifRenderLista();
  notifToast(tipo, mensaje);
}

// ── Badge contador ──────────────────────────────────────────
function notifActualizarBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  const cnt = notifGetAll().filter(n => !n.leida).length;
  badge.textContent = cnt > 99 ? '99+' : cnt;
  badge.style.display = cnt > 0 ? 'flex' : 'none';
}

// ── Marcar leída / no leída ─────────────────────────────────
function notifToggle(id) {
  const list = notifGetAll();
  const n = list.find(x => x.id === id);
  if (n) { n.leida = !n.leida; notifSave(list); notifActualizarBadge(); notifRenderLista(); }
}

// ── Eliminar ────────────────────────────────────────────────
function notifEliminar(id) {
  notifSave(notifGetAll().filter(x => x.id !== id));
  notifActualizarBadge();
  notifRenderLista();
}

// ── Marcar todas leídas ─────────────────────────────────────
function notifMarcarTodas() {
  notifSave(notifGetAll().map(n => ({ ...n, leida: true })));
  notifActualizarBadge();
  notifRenderLista();
}

// ── Meta por tipo ───────────────────────────────────────────
function notifMeta(tipo) {
  return {
    asignada:   { icon: '👤', color: '#3b82f6', label: 'Asignación'  },
    completada: { icon: '✅', color: '#22c55e', label: 'Completada'  },
    hito:       { icon: '🏆', color: '#f59e0b', label: 'Hito'        },
  }[tipo] || { icon: '🔔', color: '#8aaed4', label: 'Aviso' };
}

// ── Render lista ────────────────────────────────────────────
function notifRenderLista() {
  const lista = document.getElementById('notif-lista');
  if (!lista) return;
  const all = notifGetAll();

  if (!all.length) {
    lista.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:32px 16px;color:#64748b;gap:8px;font-size:.85rem;">
        <span style="font-size:2rem;opacity:.3">🔔</span>
        <p>Sin notificaciones</p>
      </div>`;
    return;
  }

  lista.innerHTML = all.map(n => {
    const m    = notifMeta(n.tipo);
    const d    = new Date(n.fecha);
    const hora = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    const dia  = d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
    return `
      <div class="notif-item ${n.leida ? '' : 'notif-unread'}">
        <span class="notif-ico" style="background:${m.color}22;color:${m.color}">${m.icon}</span>
        <div class="notif-body">
          <span class="notif-lbl" style="color:${m.color}">${m.label}</span>
          <p class="notif-msg">${n.mensaje}</p>
          <span class="notif-time">${dia} · ${hora}</span>
        </div>
        <div class="notif-acts">
          <button onclick="notifToggle(${n.id})" title="${n.leida ? 'No leída' : 'Leída'}"
            style="background:none;border:none;cursor:pointer;color:#60a5fa;font-size:.8rem;padding:2px 5px;border-radius:4px;">
            ${n.leida ? '◯' : '●'}
          </button>
          <button onclick="notifEliminar(${n.id})" title="Eliminar"
            style="background:none;border:none;cursor:pointer;color:#f87171;font-size:.8rem;padding:2px 5px;border-radius:4px;">
            ✕
          </button>
        </div>
      </div>`;
  }).join('');
}

// ── Toast reutilizando el container existente de ui.js ──────
function notifToast(tipo, mensaje) {
  const m  = notifMeta(tipo);
  const tc = document.getElementById('toast-container');
  if (!tc) return;
  const t = document.createElement('div');
  t.className = 'toast success';
  t.textContent = m.icon + ' ' + mensaje;
  tc.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ── Toggle panel ────────────────────────────────────────────
function notifTogglePanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const abierto = panel.classList.toggle('notif-open');
  if (abierto) notifRenderLista();
}

// ── Inyectar campanita en topbar ────────────────────────────
function notifInyectar() {
  const topbar = document.getElementById('topbar');
  if (!topbar || document.getElementById('notif-bell')) return;

  // Guardar el texto actual del título
  const tituloActual = topbar.textContent.trim() || 'Dashboard';

  // Reconstruir el topbar con un <span> de título + botón campanita
  // Así navigate() puede actualizar solo el span sin borrar la campanita
  topbar.innerHTML = `
    <span id="topbar-title">${tituloActual}</span>
    <button id="notif-bell" onclick="notifTogglePanel()" title="Notificaciones" aria-label="Notificaciones">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span id="notif-badge" style="display:none">0</span>
    </button>`;

  // ── Patch navigate() ──
  // El navigate() original hace topbar.textContent = label, lo que borra innerHTML.
  // Lo reemplazamos para que solo actualice el <span> del título.
  const _origNavigate = window.navigate;
  window.navigate = function (page) {
    const labels = {
      dashboard:'Dashboard', proyectos:'Proyectos', actividades:'Actividades',
      hitos:'Hitos', recursos:'Recursos', calendario:'Calendario'
    };

    // Ejecutar toda la lógica original EXCEPTO la línea que toca el topbar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const navItems = document.querySelectorAll('.nav-item');
    const pages    = ['dashboard','proyectos','actividades','hitos','recursos','calendario'];
    const idx      = pages.indexOf(page);
    if (idx >= 0) navItems[idx].classList.add('active');
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');

    // Actualizar solo el <span> del título, dejando la campanita intacta
    const span = document.getElementById('topbar-title');
    if (span) span.textContent = labels[page] || page;

    currentPage = page;
    if (page === 'dashboard')        renderDashboard();
    else if (page === 'proyectos')   renderProyectos();
    else if (page === 'actividades') renderActividades();
    else if (page === 'hitos')       renderHitos();
    else if (page === 'recursos')    renderRecursos();
    else if (page === 'calendario')  renderCalendar();

    notifActualizarBadge();
  };

  // ── Panel dropdown ──
  if (!document.getElementById('notif-panel')) {
    const panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.innerHTML = `
      <div class="notif-head">
        <span>🔔 Notificaciones</span>
        <button onclick="notifMarcarTodas()" class="notif-btn-todas">Marcar leídas</button>
      </div>
      <div id="notif-lista"></div>`;
    document.body.appendChild(panel);

    document.addEventListener('click', e => {
      const p = document.getElementById('notif-panel');
      const b = document.getElementById('notif-bell');
      if (p && p.classList.contains('notif-open') && b &&
          !p.contains(e.target) && !b.contains(e.target)) {
        p.classList.remove('notif-open');
      }
    });
  }

  // ── Estilos ──
  if (!document.getElementById('notif-styles')) {
    const s = document.createElement('style');
    s.id = 'notif-styles';
    s.textContent = `
      #topbar {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px;
      }
      #topbar-title { flex: 1; }

      #notif-bell {
        position: relative;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.13);
        border-radius: 9px;
        width: 38px; height: 38px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: inherit; flex-shrink: 0;
        transition: background .2s, transform .15s;
      }
      #notif-bell:hover { background: rgba(59,130,246,.25); transform: scale(1.08); }

      #notif-badge {
        position: absolute; top: -5px; right: -5px;
        background: #ef4444; color: #fff;
        font-size: 9px; font-weight: 700;
        min-width: 17px; height: 17px; border-radius: 999px;
        display: flex; align-items: center; justify-content: center;
        padding: 0 3px; border: 2px solid #0f172a;
        pointer-events: none;
        animation: notifPulse 1.8s ease-in-out infinite;
      }
      @keyframes notifPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }

      #notif-panel {
        position: fixed;
        top: 62px; right: 16px;
        width: 310px; max-height: 430px;
        background: #111827;
        border: 1px solid rgba(59,130,246,.22);
        border-radius: 14px;
        z-index: 99999;
        display: flex; flex-direction: column;
        box-shadow: 0 12px 40px rgba(0,0,0,.6);
        opacity: 0; pointer-events: none;
        transform: translateY(-8px) scale(.97);
        transition: opacity .2s ease, transform .2s ease;
        overflow: hidden;
      }
      #notif-panel.notif-open {
        opacity: 1; pointer-events: all;
        transform: translateY(0) scale(1);
      }

      .notif-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 14px 10px;
        font-size: .88rem; font-weight: 700; color: #f1f5f9;
        border-bottom: 1px solid rgba(255,255,255,.07);
        background: rgba(59,130,246,.08); flex-shrink: 0;
      }
      .notif-btn-todas {
        font-size: .63rem; color: #60a5fa; background: none;
        border: none; cursor: pointer; padding: 2px 7px;
        border-radius: 4px; transition: background .15s;
      }
      .notif-btn-todas:hover { background: rgba(96,165,250,.14); }

      #notif-lista { overflow-y: auto; flex: 1; }
      #notif-lista::-webkit-scrollbar { width: 4px; }
      #notif-lista::-webkit-scrollbar-thumb { background: rgba(59,130,246,.3); border-radius: 2px; }

      .notif-item {
        display: flex; align-items: flex-start; gap: 9px;
        padding: 10px 13px;
        border-bottom: 1px solid rgba(255,255,255,.05);
        position: relative; transition: background .15s;
      }
      .notif-item:last-child { border-bottom: none; }
      .notif-item:hover { background: rgba(255,255,255,.04); }
      .notif-item.notif-unread { background: rgba(59,130,246,.09); }
      .notif-item.notif-unread::before {
        content:''; position:absolute; left:0; top:0; bottom:0;
        width:3px; background:#3b82f6; border-radius:0 2px 2px 0;
      }
      .notif-ico {
        width:30px; height:30px; border-radius:7px; flex-shrink:0;
        display:flex; align-items:center; justify-content:center; font-size:.9rem; margin-top:1px;
      }
      .notif-body { flex:1; min-width:0; }
      .notif-lbl { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block; }
      .notif-msg { font-size:.78rem; color:#cbd5e1; margin:2px 0 3px; line-height:1.4;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .notif-time { font-size:.62rem; color:#64748b; }
      .notif-acts { display:flex; flex-direction:column; gap:2px; flex-shrink:0; }

      @media(max-width:600px){
        #notif-panel { right:6px; left:6px; width:auto; top:56px; }
      }
    `;
    document.head.appendChild(s);
  }

  notifActualizarBadge();
  notifRenderLista();
}

// ═══════════════════════════════════════════════════════════
//  PARCHES: interceptar saveActividad y saveHito
//  para generar notificaciones automáticamente
// ═══════════════════════════════════════════════════════════
function notifPatch() {

  // ── Patch saveActividad ──
  const _origSaveActividad = window.saveActividad;
  window.saveActividad = function () {
    const editId        = document.getElementById('a-edit-id').value;
    const nuevoEstado   = document.getElementById('a-estado').value;
    const nombre        = document.getElementById('a-nombre').value.trim();
    const responsableId = document.getElementById('a-responsable').value;
    const proyectoId    = parseInt(document.getElementById('a-proyecto').value);

    // Guardar estado anterior si es edición
    let estadoAntes = null;
    let responsableAntes = null;
    if (editId) {
      const act = store.actividades.find(a => a.id == editId);
      if (act) { estadoAntes = act.estado; responsableAntes = act.responsableId; }
    }

    // Ejecutar lógica original
    _origSaveActividad();

    // Generar notificaciones según qué cambió
    if (!editId) {
      // Nueva actividad con responsable
      if (responsableId) {
        notifCrear('asignada', `"${nombre}" asignada a ${getRecursoNombre(responsableId)}`);
      }
    } else {
      // Editando: ¿cambió el responsable?
      if (responsableId && responsableId !== responsableAntes) {
        notifCrear('asignada', `"${nombre}" reasignada a ${getRecursoNombre(responsableId)}`);
      }
      // ¿Cambió a Terminada?
      if (nuevoEstado === 'Terminada' && estadoAntes !== 'Terminada') {
        notifCrear('completada', `La actividad "${nombre}" ha sido terminada.`);
        // Chequear si todas las actividades del proyecto están terminadas → hito automático
        const actsProyecto = store.actividades.filter(a => a.proyectoId == proyectoId);
        const todasOk = actsProyecto.length > 0 && actsProyecto.every(a => a.estado === 'Terminada');
        if (todasOk) {
          store.hitos
            .filter(h => h.proyectoId == proyectoId && h.estado !== 'Cumplido')
            .forEach(h => notifCrear('hito', `Hito alcanzado: "${h.nombre}"`));
        }
      }
    }
  };

  // ── Patch saveHito ──
  const _origSaveHito = window.saveHito;
  window.saveHito = function () {
    const editId      = document.getElementById('h-edit-id').value;
    const nuevoEstado = document.getElementById('h-estado').value;
    const nombre      = document.getElementById('h-nombre').value.trim();
    let estadoAntes   = null;
    if (editId) {
      const h = store.hitos.find(h => h.id == editId);
      if (h) estadoAntes = h.estado;
    }

    _origSaveHito();

    if (editId && nuevoEstado === 'Cumplido' && estadoAntes !== 'Cumplido') {
      notifCrear('hito', `Hito alcanzado: "${nombre}"`);
    }
  };
}

// ── Init ────────────────────────────────────────────────────
(function () {
  function init() {
    notifInyectar();
    notifPatch();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();