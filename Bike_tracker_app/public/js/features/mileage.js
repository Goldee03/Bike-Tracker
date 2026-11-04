/* MILEAGE page (/mileage)
   Km per litre between refuels, trend chart and table. */

function mileageBetweenRefills(){
  const refills = [...data.refills].sort((a,b)=>a.odometer-b.odometer);
  const results = [];
  for(let i=1;i<refills.length;i++){
    const distKm = refills[i].odometer - refills[i-1].odometer;
    const liters = Number(refills[i-1].liters)||0;
    if(liters>0){
      results.push({date:refills[i-1].date, kmpl:(distKm/liters).toFixed(1), distKm, liters});
    }
  }
  return results;
}

function renderMileageChart(){
  destroyChart('mileage-chart');
  const ctx = document.getElementById('mileage-chart');
  if(!ctx || typeof Chart==='undefined') return;
  const results = mileageBetweenRefills();
  if(results.length===0) return;
  charts['mileage-chart'] = new Chart(ctx, {
    type:'line',
    data:{labels: results.map(r=>dLabel(r.date)), datasets:[{
      label:'km/l', data:results.map(r=>Number(r.kmpl)),
      borderColor:'#6FCF97', backgroundColor:'rgba(111,207,151,0.15)',
      fill:true, tension:0.3, pointBackgroundColor:'#6FCF97', pointRadius:4
    }]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}, tooltip:{callbacks:{label:c=>c.parsed.y+' km/l'}}},
      scales:{
        x:{ticks:{color:'#8B9199', font:{size:10}}, grid:{display:false}},
        y:{ticks:{color:'#8B9199'}, grid:{color:'#2C3136'}}
      }
    }
  });
}

// ---- Mileage ----
function mileageTabHTML(){
  const results = mileageBetweenRefills();
  return `
    <div class="panel">
      <h2>📈 Mileage Trend</h2>
      ${results.length===0 ? `<div class="empty">Need at least 2 refuels to calculate km/l.</div>` : `<div class="chart-box"><canvas id="mileage-chart"></canvas></div>`}
    </div>
    <div class="panel">
      <h2>📊 Fuel Mileage</h2>
      ${results.length===0 ? `<div class="empty">Need at least 2 refuels to calculate km/l.</div>` : `
      <table>
        <tr><th>Fuel Bought On</th><th>Distance Covered</th><th>Liters</th><th>km/l</th></tr>
        ${[...results].reverse().map(r=>`<tr><td>${dLabel(r.date)}</td><td>${fmt(r.distKm)} km</td><td>${r.liters.toFixed(2)} L</td><td>${r.kmpl}</td></tr>`).join('')}
      </table>`}
      <div class="hint">Distance ridden until the next refuel, divided by the liters bought at this refuel — i.e. how far that tank of fuel actually took you.</div>
    </div>
  `;
}
