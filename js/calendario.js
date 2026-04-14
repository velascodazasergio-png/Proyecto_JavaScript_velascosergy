// ═══════════════════════════════════
//  CALENDARIO
// ═══════════════════════════════════
const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

function changeMonth(delta) {
  calMonth += delta;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
}

function renderCalendar() {
  document.getElementById('cal-month-label').textContent = `${MONTHS_ES[calMonth]} ${calYear}`;
  const filterP = document.getElementById('cal-project-filter').value;

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today       = new Date();

  let acts = store.actividades;
  if (filterP) acts = acts.filter(a => a.proyectoId == filterP);

  // Build event map: day → [ activities ]
  const eventMap = {};
  acts.forEach(a => {
    const start = new Date(a.inicio + 'T00:00:00');
    for (let d = 0; d < a.duracion; d++) {
      const day = new Date(start);
      day.setDate(day.getDate() + d);
      if (day.getFullYear() === calYear && day.getMonth() === calMonth) {
        const dn = day.getDate();
        if (!eventMap[dn]) eventMap[dn] = [];
        eventMap[dn].push(a);
      }
    }
  });

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="cal-day" style="background:var(--bg);opacity:0.5"></div>';
  }

  const statusClass = { 'Pendiente': 'pendiente', 'En Proceso': 'en-proceso', 'Terminada': 'terminada' };

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = (
      today.getFullYear() === calYear &&
      today.getMonth()    === calMonth &&
      today.getDate()     === d
    );
    const events = eventMap[d] || [];

    let eventsHtml = events.slice(0, 3).map(a =>
      `<div class="cal-event ${statusClass[a.estado] || ''}" title="${a.nombre} — ${a.estado}">${a.nombre}</div>`
    ).join('');
    if (events.length > 3) {
      eventsHtml += `<div style="font-size:11px;color:var(--text-muted);padding:1px 4px">+${events.length - 3} más</div>`;
    }

    html += `
    <div class="cal-day">
      <div class="cal-day-num${isToday ? ' today' : ''}">${d}</div>
      ${eventsHtml}
    </div>`;
  }

  document.getElementById('cal-days').innerHTML = html;
}