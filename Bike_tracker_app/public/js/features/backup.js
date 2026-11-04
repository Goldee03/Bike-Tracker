/* BACKUP page (/backup)
   Download JSON/CSV backups and restore from a backup. */

// ---- Backup ----
function exportTabHTML(){
  return `
    <div class="panel">
      <h2>💾 Backup Your Data</h2>
      <div class="hint">Your log lives in Claude's storage for this artifact. Download a copy to your device so you always have it, independent of this chat.</div>
      <div class="export-row" style="margin-top:14px;">
        <button class="btn" onclick="exportJSON()">Download Full Backup (JSON)</button>
        <button class="btn secondary" onclick="exportRidesCSV()">Download Rides (CSV)</button>
        <button class="btn secondary" onclick="exportRefuelsCSV()">Download Refuels (CSV)</button>
        <button class="btn secondary" onclick="exportSpendingCSV()">Download Spending (CSV)</button>
      </div>
    </div>
    <div class="panel">
      <h2>♻️ Restore From Backup</h2>
      <div class="hint">Upload a previously downloaded JSON backup to restore your data. This replaces everything currently stored here.</div>
      <div class="field full" style="margin-top:10px;">
        <input type="file" id="restore-file" accept="application/json">
      </div>
      <button class="btn danger" onclick="restoreJSON()">Restore &amp; Overwrite</button>
    </div>
  `;
}

function downloadBlob(content, filename, type){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportJSON(){
  downloadBlob(JSON.stringify(data, null, 2), `bike-log-backup-${todayISO()}.json`, 'application/json');
}

function exportRidesCSV(){
  const rows = [['Date','Morning','Evening','Distance(km)']];
  sortedDates().forEach(d=>{
    const e = data.entries[d];
    const dist = distanceForDate(d);
    rows.push([d, e.morning ?? '', e.evening ?? '', dist ?? '']);
  });
  const csv = rows.map(r=>r.join(',')).join('\n');
  downloadBlob(csv, `bike-rides-${todayISO()}.csv`, 'text/csv');
}

function exportRefuelsCSV(){
  const rows = [['Date','Liters','Cost(INR)','Odometer(km)','INR/Liter']];
  [...data.refills].sort((a,b)=>a.date.localeCompare(b.date)).forEach(r=>{
    rows.push([r.date, r.liters, r.cost, r.odometer, (r.cost/r.liters).toFixed(2)]);
  });
  const csv = rows.map(r=>r.join(',')).join('\n');
  downloadBlob(csv, `bike-refuels-${todayISO()}.csv`, 'text/csv');
}

function exportSpendingCSV(){
  const rows = [['Date','Category','Amount(INR)','Note']];
  [...allSpendRecords()].sort((a,b)=>a.date.localeCompare(b.date)).forEach(r=>{
    rows.push([r.date, r.category, r.amount, (r.note||'').replace(/,/g,';')]);
  });
  const csv = rows.map(r=>r.join(',')).join('\n');
  downloadBlob(csv, `bike-spending-${todayISO()}.csv`, 'text/csv');
}

async function restoreJSON(){
  const fileInput = document.getElementById('restore-file');
  const file = fileInput.files[0];
  if(!file){ alert('Choose a JSON backup file first'); return; }
  try{
    const text = await file.text();
    let parsed = JSON.parse(text);
    if(!parsed.entries || !parsed.refills){
      alert("This file doesn't look like a valid backup.");
      return;
    }
    parsed = migrate(parsed);
    if(!confirm('This will overwrite all current data with the backup. Continue?')) return;
    data = parsed;
    await saveData();
    render();
    activeTab='export'; renderTab();
    alert('Restored successfully.');
  }catch(e){
    alert("Could not read that file. Make sure it's a JSON backup downloaded from this tracker.");
  }
}
