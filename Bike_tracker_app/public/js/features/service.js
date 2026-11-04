/* SERVICE page (/service)
   Service records, service interval, and the service countdown calculations. */

function latestServiceOdo(){
  if(data.services.length===0) return 0;
  const sorted = [...data.services].sort((a,b)=> b.date.localeCompare(a.date) || b.odometer-a.odometer);
  return sorted[0].odometer;
}

function nextServiceOdo(){
  return latestServiceOdo() + data.settings.intervalKm;
}

function serviceProgress(){
  const cur = latestOdometer();
  const start = latestServiceOdo();
  const end = nextServiceOdo();
  const pct = Math.min(100, Math.max(0, ((cur-start)/(end-start))*100));
  return {pct, remaining: Math.max(0, end-cur)};
}

// ---- Service ----
let editingServiceId = null;

function serviceTabHTML(){
  const editing = editingServiceId ? data.services.find(s=>s.id===editingServiceId) : null;
  return `
    <div class="panel">
      <h2>🔧 ${editing ? 'Edit Service Record' : 'Log a Service'}</h2>
      <div class="field-row">
        <div class="field">
          <label>Date</label>
          <input type="date" id="svc-date" value="${editing ? editing.date : todayISO()}">
        </div>
        <div class="field">
          <label>Odometer (km)</label>
          <input type="number" id="svc-odo" placeholder="e.g. 15704" value="${editing ? editing.odometer : ''}">
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Cost (₹)</label>
          <input type="number" step="0.01" id="svc-cost" placeholder="e.g. 1200" value="${editing ? editing.cost : ''}">
        </div>
        <div class="field">
          <label>Note</label>
          <input type="text" id="svc-note" placeholder="e.g. Oil + filter change" value="${editing ? (editing.note||'') : ''}">
        </div>
      </div>
      <button class="btn" onclick="submitService()">${editing ? 'Update Service Record' : 'Save Service Record'}</button>
      ${editing ? `<button class="btn secondary" onclick="cancelEditService()">Cancel Edit</button>` : ''}
    </div>
    <div class="panel">
      <h2>⏱ Interval Setting</h2>
      <div class="field full">
        <label>Service Interval (km)</label>
        <input type="number" id="svc-interval" value="${data.settings.intervalKm}">
      </div>
      <button class="btn secondary" onclick="submitInterval()">Update Interval</button>
      <div class="hint">Next service will be due at ${fmt(nextServiceOdo())} km, based on the most recent service record.</div>
    </div>
    <div class="panel">
      <h2>History</h2>
      ${serviceTableHTML()}
    </div>
  `;
}

function serviceTableHTML(){
  const services = [...data.services].sort((a,b)=>b.date.localeCompare(a.date));
  if(services.length===0) return `<div class="empty">No service records yet.</div>`;
  return `<table>
    <tr><th>Date</th><th>Odo</th><th>Cost</th><th>Note</th><th></th></tr>
    ${services.map(s=>`
      <tr>
        <td>${dLabel(s.date)}</td>
        <td>${fmt(s.odometer)}</td>
        <td>${fmtMoney(s.cost)}</td>
        <td>${s.note||'—'}</td>
        <td class="row-actions">
          <button class="icon-btn" onclick="editService('${s.id}')">✎</button>
          <button class="icon-btn" onclick="deleteService('${s.id}')">✕</button>
        </td>
      </tr>`).join('')}
  </table>`;
}

function editService(id){
  editingServiceId = id;
  renderTab();
}

function cancelEditService(){
  editingServiceId = null;
  renderTab();
}

async function submitService(){
  const date = document.getElementById('svc-date').value;
  const odo = Number(document.getElementById('svc-odo').value);
  const cost = Number(document.getElementById('svc-cost').value) || 0;
  const note = document.getElementById('svc-note').value;
  if(!date || !odo){ alert('Enter date and odometer'); return; }
  const curOdo = latestOdometer();
  const lowOdoWarning = odo < curOdo;
  if(editingServiceId){
    const idx = data.services.findIndex(s=>s.id===editingServiceId);
    if(idx !== -1){
      data.services[idx] = { ...data.services[idx], date, odometer:odo, cost, note };
    }
    editingServiceId = null;
  } else {
    data.services.push({id:'svc'+Date.now(), date, odometer:odo, cost, note});
  }
  await saveData();
  render();
  activeTab='service'; renderTab();
  if(lowOdoWarning){
    alert(`Saved. Note: ${fmt(odo)} km is lower than your bike's current odometer (${fmt(curOdo)} km) — double-check this isn't a typo.`);
  }
}

async function submitInterval(){
  const interval = Number(document.getElementById('svc-interval').value);
  if(!interval){ alert('Enter a valid interval'); return; }
  data.settings.intervalKm = interval;
  await saveData();
  render();
  activeTab='service'; renderTab();
}

async function deleteService(id){
  data.services = data.services.filter(s=>s.id!==id);
  if(editingServiceId === id) editingServiceId = null;
  await saveData();
  render();
  activeTab='service'; renderTab();
}
