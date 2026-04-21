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
