/* SPENDING page (/spending)
   Spending totals, by category, by month, and their charts. */

// ---- Spending ----
function allSpendRecords(){
  const list = [];
  data.refills.forEach(r=> list.push({date:r.date, category:'Fuel', amount:Number(r.cost)||0, note:`${r.liters} L`}));
  data.services.forEach(s=> list.push({date:s.date, category:'Service', amount:Number(s.cost)||0, note:s.note||''}));
  data.expenses.forEach(e=> list.push({date:e.date, category:e.category, amount:Number(e.amount)||0, note:e.note||''}));
  return list;
}
function totalSpend(list){
  list = list || allSpendRecords();
  return list.reduce((a,b)=>a+Number(b.amount||0),0);
}
function spendInMonth(prefix){
  return totalSpend(allSpendRecords().filter(r=>r.date.startsWith(prefix)));
}
function categoryTotals(){
  const totals = {Fuel:0, Service:0};
  allSpendRecords().forEach(r=>{
    const key = (r.category==='Fuel'||r.category==='Service') ? r.category : 'Other';
    totals[key] = (totals[key]||0) + Number(r.amount||0);
  });
  return totals;
}
function costPerKm(){
  const dist = totalDistanceAll();
  const spend = totalSpend();
  return dist>0 ? spend/dist : 0;
}
function monthlySpendTable(){
  const map = {};
  allSpendRecords().forEach(r=>{
    const m = r.date.slice(0,7);
    map[m] = (map[m]||0) + Number(r.amount||0);
  });
  return Object.entries(map).sort((a,b)=>b[0].localeCompare(a[0]));
}
function monthlySpendByCategory(){
  const map = {}; // month -> {Fuel, Service, Other}
  allSpendRecords().forEach(r=>{
    const m = r.date.slice(0,7);
    const key = (r.category==='Fuel'||r.category==='Service') ? r.category : 'Other';
    if(!map[m]) map[m] = {Fuel:0, Service:0, Other:0};
    map[m][key] += Number(r.amount||0);
  });
  const months = Object.keys(map).sort();
  return {months, map};
}

function renderSpendingCharts(){
  destroyChart('cat-chart');
  destroyChart('month-spend-chart');
  const catCtx = document.getElementById('cat-chart');
  if(catCtx && typeof Chart!=='undefined'){
    const cats = categoryTotals();
    const labels = Object.keys(cats).filter(k=>cats[k]>0);
    const values = labels.map(k=>cats[k]);
    charts['cat-chart'] = new Chart(catCtx, {
      type:'doughnut',
      data:{labels, datasets:[{
        data:values,
        backgroundColor:['#F2A93C','#6FCF97','#7EA6E0','#E4572E','#B191E0','#EDC94C','#E091C7','#8B9199'],
        borderColor:'#1C2024', borderWidth:2
      }]},
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{position:'bottom', labels:{color:'#EDEDED', font:{size:11}, padding:12}},
          tooltip:{callbacks:{label:c=>c.label+': '+fmtMoney(c.parsed)}}}
      }
    });
  }
  const monthCtx = document.getElementById('month-spend-chart');
  if(monthCtx && typeof Chart!=='undefined'){
    const {months, map} = monthlySpendByCategory();
    const recent = months.slice(-12);
    charts['month-spend-chart'] = new Chart(monthCtx, {
      type:'bar',
      data:{
        labels: recent.map(monthLabel),
        datasets:[
          {label:'Fuel', data: recent.map(m=>map[m].Fuel), backgroundColor:'#F2A93C', borderRadius:3, maxBarThickness:36},
          {label:'Service', data: recent.map(m=>map[m].Service), backgroundColor:'#6FCF97', borderRadius:3, maxBarThickness:36},
          {label:'Other', data: recent.map(m=>map[m].Other), backgroundColor:'#7EA6E0', borderRadius:3, maxBarThickness:36}
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{
          legend:{position:'bottom', labels:{color:'#EDEDED', font:{size:11}, padding:12}},
          tooltip:{callbacks:{label:c=>c.dataset.label+': '+fmtMoney(c.parsed.y)}}
        },
        scales:{
          x:{stacked:true, ticks:{color:'#8B9199', font:{size:10}}, grid:{display:false}},
          y:{stacked:true, ticks:{color:'#8B9199'}, grid:{color:'#2C3136'}, beginAtZero:true}
        }
      }
    });
  }
}

// ---- Spending overview ----
function spendingTabHTML(){
  const cats = categoryTotals();
  const max = Math.max(...Object.values(cats), 1);
  const {months, map} = monthlySpendByCategory();
  const monthlyRows = [...months].reverse();
  const dist = totalDistanceAll();

  return `
    <div class="panel">
      <div class="big-stat">
        <div class="value">${fmtMoney(totalSpend())}</div>
        <div class="label">Total Spent — Lifetime</div>
      </div>
      <div class="hint" style="text-align:center;">Across ${fmt(dist)} km ridden — that's ₹${costPerKm().toFixed(2)} per km.</div>
    </div>

    <div class="panel">
      <h2>📊 By Category</h2>
      <div class="chart-box"><canvas id="cat-chart"></canvas></div>
      <div style="margin-top:16px;">
        ${Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>`
          <div class="bar-row">
            <div class="bar-head"><span class="cat">${cat}</span><span class="amt">${fmtMoney(amt)}</span></div>
            <div class="bar-track"><div class="bar-fill ${cat==='Fuel'?'fuel':cat==='Service'?'service':'other'}" style="width:${(amt/max)*100}%"></div></div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="panel">
      <h2>📅 Monthly Spend</h2>
      <div class="chart-box"><canvas id="month-spend-chart"></canvas></div>
      ${monthlyRows.length===0 ? `<div class="empty">No spending logged yet.</div>` : `
      <table style="margin-top:14px;">
        <tr><th>Month</th><th>Fuel</th><th>Service</th><th>Other</th><th>Total</th></tr>
        ${monthlyRows.map(m=>{
          const row = map[m];
          const total = row.Fuel + row.Service + row.Other;
          return `<tr>
            <td>${monthLabel(m)}</td>
            <td>${fmtMoney(row.Fuel)}</td>
            <td>${fmtMoney(row.Service)}</td>
            <td>${fmtMoney(row.Other)}</td>
            <td style="color:var(--amber); font-weight:600;">${fmtMoney(total)}</td>
          </tr>`;
        }).join('')}
      </table>`}
    </div>
  `;
}
