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
