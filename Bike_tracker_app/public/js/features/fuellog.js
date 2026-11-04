/* FUEL LOG page (/fuellog)
   Refuel form, refuel history, edit and delete refuel. */

// ---- Refuel ----
let editingRefuelId = null;

function refuelTabHTML(){
  const editing = editingRefuelId ? data.refills.find(r=>r.id===editingRefuelId) : null;
  return `
    <div class="panel">
      <h2>⛽ ${editing ? 'Edit Refuel' : 'Log a Refuel'}</h2>
      <div class="field-row">
        <div class="field">
          <label>Date</label>
          <input type="date" id="rf-date" value="${editing ? editing.date : todayISO()}">
        </div>
        <div class="field">
          <label>Odometer (km)</label>
          <input type="number" id="rf-odo" placeholder="e.g. 14520" value="${editing ? editing.odometer : ''}">
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Liters</label>
          <input type="number" step="0.01" id="rf-liters" placeholder="e.g. 4" value="${editing ? editing.liters : ''}">
        </div>
        <div class="field">
          <label>Cost (₹)</label>
          <input type="number" step="0.01" id="rf-cost" placeholder="e.g. 443.56" value="${editing ? editing.cost : ''}">
        </div>
      </div>
      <div class="field full">
        <label>Note (optional)</label>
        <input type="text" id="rf-note" placeholder="e.g. Full tank" value="${editing ? (editing.note||'') : ''}">
      </div>
      <button class="btn" onclick="submitRefuel()">${editing ? 'Update Refuel' : 'Save Refuel'}</button>
      ${editing ? `<button class="btn secondary" onclick="cancelEditRefuel()">Cancel Edit</button>` : ''}
    </div>
    <div class="panel">
      <h2>History</h2>
      ${refuelTableHTML()}
    </div>
  `;
}

function refuelTableHTML(){
  const refills = [...data.refills].sort((a,b)=>b.date.localeCompare(a.date));
  if(refills.length===0) return `<div class="empty">No refuels logged yet.</div>`;
  return `<table>
    <tr><th>Date</th><th>Liters</th><th>Cost</th><th>Odo</th><th>Note</th><th></th></tr>
    ${refills.map(r=>`
      <tr>
        <td>${dLabel(r.date)}</td>
        <td>${r.liters} L</td>
        <td>${fmtMoney(r.cost)}</td>
        <td>${fmt(r.odometer)}</td>
        <td style="font-family:'Inter',sans-serif; font-size:12px; color:var(--muted);">${r.note ?? '—'}</td>
        <td class="row-actions">
          <button class="icon-btn" onclick="editRefuel('${r.id}')">✎</button>
          <button class="icon-btn" onclick="deleteRefuel('${r.id}')">✕</button>
        </td>
      </tr>`).join('')}
  </table>`;
}

function editRefuel(id){
  editingRefuelId = id;
  renderTab();
}

function cancelEditRefuel(){
  editingRefuelId = null;
  renderTab();
}

async function submitRefuel(){
  const date = document.getElementById('rf-date').value;
  const odo = Number(document.getElementById('rf-odo').value);
  const liters = Number(document.getElementById('rf-liters').value);
  const cost = Number(document.getElementById('rf-cost').value);
  const note = document.getElementById('rf-note').value;
  if(!date || !odo || !liters){ alert('Fill date, odometer and liters at least'); return; }
  if(editingRefuelId){
    const idx = data.refills.findIndex(r=>r.id===editingRefuelId);
    if(idx !== -1){
      data.refills[idx] = { ...data.refills[idx], date, odometer:odo, liters, cost, note: note || undefined };
    }
    editingRefuelId = null;
  } else {
    data.refills.push({id:'r'+Date.now(), date, liters, cost, odometer:odo, note: note || undefined});
  }
  await saveData();
  render();
  activeTab='refuel'; renderTab();
}

async function deleteRefuel(id){
  data.refills = data.refills.filter(r=>r.id!==id);
  if(editingRefuelId === id) editingRefuelId = null;
  await saveData();
  render();
  activeTab='refuel'; renderTab();
}
