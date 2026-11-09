/* DASHBOARD page (/dashboard)
   Odometer banner, stat cards, custom date range, 14-day chart, service countdown, last refill, gaps. */

function firstOfMonthISO(){
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-01`;
}

function rangeStats(from, to){
  const dates = sortedDates().filter(d=> d>=from && d<=to);
  let total=0, days=0;
  dates.forEach(d=>{
    const dist = distanceForDate(d);
    if(dist!=null){ total+=dist; days++; }
  });
  return {total, days, avg: days? total/days : 0};
}

function spendInRange(from, to){
  return totalSpend(allSpendRecords().filter(r=> r.date>=from && r.date<=to));
}

function litersInRange(from, to){
  return data.refills
    .filter(r=> r.date>=from && r.date<=to)
    .reduce((sum,r)=> sum + (Number(r.liters)||0), 0);
}

let rangeFrom = firstOfMonthISO();
let rangeTo = todayISO();

function updateRange(){
  const f = document.getElementById('range-from').value;
  const t = document.getElementById('range-to').value;
  if(f) rangeFrom = f;
  if(t) rangeTo = t;
  render();
}

function setRangePreset(preset){
  const today = todayISO();
  if(preset==='month'){
    rangeFrom = firstOfMonthISO(); rangeTo = today;
  } else if(preset==='7d'){
    const d = new Date(); d.setDate(d.getDate()-6);
    rangeFrom = d.toISOString().slice(0,10); rangeTo = today;
  } else if(preset==='30d'){
    const d = new Date(); d.setDate(d.getDate()-29);
    rangeFrom = d.toISOString().slice(0,10); rangeTo = today;
  } else if(preset==='all'){
    const dates = sortedDates();
    rangeFrom = dates[0] || today; rangeTo = today;
  }
  render();
}

function odometerWheels(num){
  const str = String(Math.round(num));
  return `<div class="odo-row">${str.split('').map(d=>`<div class="odo-digit">${d}</div>`).join('')}</div>`;
}

function renderDistChart(){
  destroyChart('dist-chart');
  const ctx = document.getElementById('dist-chart');
  if(!ctx || typeof Chart==='undefined') return;
  const dates = sortedDates().slice(-14);
  const labels = dates.map(d=>dLabel(d));
  const values = dates.map(d=> distanceForDate(d) ?? 0);
  charts['dist-chart'] = new Chart(ctx, {
    type:'bar',
    data:{labels, datasets:[{label:'km', data:values, backgroundColor:'#F2A93C', borderRadius:4, maxBarThickness:28}]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}, tooltip:{callbacks:{label:c=>c.parsed.y+' km'}}},
      scales:{
        x:{ticks:{color:'#8B9199', font:{size:10}}, grid:{display:false}},
        y:{ticks:{color:'#8B9199'}, grid:{color:'#2C3136'}, beginAtZero:true}
      }
    }
  });
}

function dashboardHTML(){
  const lastSvc = latestService();
  const cur = latestOdometer();
  const tDist = todayDistance();
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${pad2(now.getMonth()+1)}`;
  const mStats = monthStats(monthPrefix);
  const svc = serviceProgress();
  const lastRefill = [...data.refills].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const gaps = findGaps();
  const lifetimeSpend = totalSpend();
  const monthSpend = spendInMonth(monthPrefix);
  const perKm = costPerKm();
  const rStats = rangeStats(rangeFrom, rangeTo);
  const rSpend = spendInRange(rangeFrom, rangeTo);
  const rLiters = litersInRange(rangeFrom, rangeTo);
  const rKmpl = rLiters > 0 ? (rStats.total / rLiters) : null;
  return `
    <div class="dash-grid">
    <div class="cluster dash-cluster">
      ${odometerWheels(cur)}
      <div class="odo-label">Current Odometer (km)</div>
    </div>

    <div class="stat-grid dash-stats">
      <div class="stat-card">
        <div class="label">Today</div>
        <div class="value">${tDist!=null ? fmt(tDist)+' km' : '—'}</div>
        <div class="sub">${tDist!=null ? 'logged' : 'not logged yet'}</div>
      </div>
      <div class="stat-card">
        <div class="label">This Month</div>
        <div class="value">${fmt(mStats.total)} km</div>
        <div class="sub">${mStats.days} day${mStats.days!==1?'s':''} logged</div>
      </div>
      <div class="stat-card">
        <div class="label">Daily Avg</div>
        <div class="value">${mStats.avg.toFixed(1)}</div>
        <div class="sub">km/day this month</div>
      </div>
    </div>

    <div class="stat-grid dash-stats">
      <div class="stat-card money">
        <div class="label">Total Spend</div>
        <div class="value">${fmtMoney(lifetimeSpend)}</div>
        <div class="sub">lifetime, all categories</div>
      </div>
      <div class="stat-card money">
        <div class="label">This Month</div>
        <div class="value">${fmtMoney(monthSpend)}</div>
        <div class="sub">spent so far</div>
      </div>
      <div class="stat-card money">
        <div class="label">Cost / km</div>
        <div class="value">₹${perKm.toFixed(2)}</div>
        <div class="sub">lifetime average</div>
      </div>
    </div>

    <div class="panel dash-range">
      <h2>📅 Custom Date Range</h2>
      <div class="field-row">
        <div class="field">
          <label>From</label>
          <input type="date" id="range-from" value="${rangeFrom}" onchange="updateRange()">
        </div>
        <div class="field">
          <label>To</label>
          <input type="date" id="range-to" value="${rangeTo}" onchange="updateRange()">
        </div>
      </div>
      <div class="export-row" style="flex-direction:row; gap:6px; margin-top:2px;">
        <button class="btn secondary" style="margin-top:0; font-size:12px; padding:8px 10px;" onclick="setRangePreset('7d')">Last 7 Days</button>
        <button class="btn secondary" style="margin-top:0; font-size:12px; padding:8px 10px;" onclick="setRangePreset('30d')">Last 30 Days</button>
        <button class="btn secondary" style="margin-top:0; font-size:12px; padding:8px 10px;" onclick="setRangePreset('month')">This Month</button>
        <button class="btn secondary" style="margin-top:0; font-size:12px; padding:8px 10px;" onclick="setRangePreset('all')">All Time</button>
      </div>
      <div class="stat-grid" style="margin-top:14px; grid-template-columns:repeat(2,1fr);">
        <div class="stat-card">
          <div class="label">Distance</div>
          <div class="value">${fmt(rStats.total)} km</div>
          <div class="sub">${rStats.days} day${rStats.days!==1?'s':''} logged</div>
        </div>
        <div class="stat-card">
          <div class="label">Daily Avg</div>
          <div class="value">${rStats.avg.toFixed(1)}</div>
          <div class="sub">km/day in range</div>
        </div>
        <div class="stat-card money">
          <div class="label">Spend</div>
          <div class="value">${fmtMoney(rSpend)}</div>
          <div class="sub">in this range</div>
        </div>
        <div class="stat-card">
          <div class="label">Mileage</div>
          <div class="value">${rKmpl!=null ? rKmpl.toFixed(1) : '—'}</div>
          <div class="sub">${rLiters>0 ? rLiters.toFixed(2)+' L bought' : 'no fuel logged'}</div>
        </div>
      </div>
    </div>

    <div class="panel dash-chart">
      <h2>📈 Last 14 Days — Distance</h2>
      <div class="chart-box"><canvas id="dist-chart"></canvas></div>
    </div>

    <div class="panel dash-service">
      <h2>🔧 Service Countdown</h2>
      <div class="svc-big">${fmt(svc.remaining)}<small>km to next service</small></div>
      <div style="display:flex; justify-content:space-between; gap:12px; font-size:13px; color:var(--muted); line-height:1.6;">
        <div>
          <div>Last service: ${fmt(latestServiceOdo())} km</div>
          <div>${lastSvc ? `${fmtDateLong(lastSvc.date)} · ${daysAgoLabel(lastSvc.date)}` : 'No service recorded yet'}</div>
        </div>
        <div style="text-align:right;">
          <div>Next service: ${fmt(nextServiceOdo())} km</div>
        </div>
      </div>
      <div class="service-bar"><div class="service-fill" style="width:${svc.pct}%"></div></div>
      <div class="hint ${svc.remaining<200?'warn':''}">${fmt(svc.remaining)} km remaining until next service${svc.remaining<200?' — due soon!':''}</div>
    </div>

    ${lastRefill ? `
    <div class="panel dash-refill">
      <h2>⛽ Last Refill</h2>
      <div style="font-size:13px; color:var(--muted); line-height:1.8;">
        ${dLabel(lastRefill.date)} — ${lastRefill.liters} L for ${fmtMoney(lastRefill.cost)} (₹${(lastRefill.cost/lastRefill.liters).toFixed(2)}/L) at ${fmt(lastRefill.odometer)} km
      </div>
    </div>` : ''}

    ${gaps.length ? `
    <div class="panel dash-gaps" style="border-color:var(--red);">
      <h2 style="color:var(--red);">⚠️ Untracked Gaps</h2>
      ${gaps.map(g=>`<div class="hint warn">${dLabel(g.from)} evening (${fmt(g.curEve)}) doesn't match ${dLabel(g.to)} morning (${fmt(g.nextMorn)}) — ${fmt(g.nextMorn-g.curEve)} km unlogged.</div>`).join('')}
    </div>` : ''}
    </div>
    `;
}
