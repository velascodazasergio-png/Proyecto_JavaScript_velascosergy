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
