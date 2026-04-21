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
