// ═══════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════
function renderDashboard() {
  const totalP = store.proyectos.length;
  const totalA = store.actividades.length;
  const doneA  = store.actividades.filter(a => a.estado === 'Terminada').length;
  const totalH = store.hitos.length;
  const doneH  = store.hitos.filter(h => h.estado === 'Cumplido').length;
  const totalR = store.recursos.length;

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:#fff3ec">📋</div>
      <div class="stat-label">Proyectos</div>
      <div class="stat-value">${totalP}</div>
      <div class="stat-sub">activos</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#dcfce7">✅</div>
      <div class="stat-label">Actividades</div>
      <div class="stat-value">${totalA}</div>
      <div class="stat-sub">${doneA} terminadas</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#dbeafe">🚩</div>
      <div class="stat-label">Hitos</div>
      <div class="stat-value">${totalH}</div>
      <div class="stat-sub">${doneH} cumplidos</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#fef3c7">👤</div>
      <div class="stat-label">Recursos</div>
      <div class="stat-value">${totalR}</div>
      <div class="stat-sub">disponibles</div>
    </div>`;

  document.getElementById('dash-projects').innerHTML = store.proyectos.slice(0, 5).map(p => {
    const acts = store.actividades.filter(a => a.proyectoId == p.id);
    const pct  = acts.length
      ? Math.round(acts.filter(a => a.estado === 'Terminada').length / acts.length * 100)
      : 0;
    return `<div class="dash-item">
      <span>${p.nombre}</span>
      <span style="color:var(--orange);font-weight:500">${pct}%</span>
    </div>`;
  }).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:8px 0">Sin proyectos aún</div>';

  document.getElementById('dash-activities').innerHTML = store.actividades.slice(-5).reverse().map(a =>
    `<div class="dash-item"><span>${a.nombre}</span>${estadoBadge(a.estado)}</div>`
  ).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:8px 0">Sin actividades aún</div>';
}