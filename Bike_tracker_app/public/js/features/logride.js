/* LOG RIDE page (/logride)
   Ride form, ride history, auto-advance to the next date, edit and delete ride. */

// ---- Log Ride ----
let logFormDate = todayISO();
let logNotice = '';
function addDaysISO(iso, n){
  const d = new Date(iso+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+n);
  return d.toISOString().slice(0,10);
}
// Which date the Log Ride form should open on: the day after the latest
// fully logged day, or the latest day itself if its evening reading is missing.
function nextLogDate(){
  const dates = sortedDates();
  if(!dates.length) return todayISO();
  const last = dates[dates.length-1];
  const e = data.entries[last] || {};
  return (e.evening==null) ? last : addDaysISO(last, 1);
}

function logTabHTML(){
  const iso = logFormDate;
  const existing = data.entries[iso] || {};
  return `
    <div class="panel">
      <h2>📝 ${data.entries[iso] ? 'Edit Ride' : 'Log a Ride'}</h2>
      ${logNotice ? `<div class="hint" style="color:var(--green); margin:-4px 0 12px;">${logNotice}</div>` : ''}
      <div class="field full">
        <label>Date</label>
        <input type="date" id="log-date" value="${iso}" onchange="changeLogDate(this.value)">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Morning Odometer</label>
          <input type="number" id="log-morning" placeholder="e.g. 14445" value="${existing.morning ?? ''}">
        </div>
        <div class="field">
          <label>Evening Odometer</label>
          <input type="number" id="log-evening" placeholder="e.g. 14520" value="${existing.evening ?? ''}">
        </div>
      </div>
      <div class="field full">
        <label>Note (optional)</label>
        <input type="text" id="log-note" placeholder="e.g. Native trip" value="${existing.note ?? ''}">
      </div>
      <button class="btn" onclick="submitLog()">${data.entries[iso] ? 'Update Entry' : 'Save Entry'}</button>
      <div class="hint">Tip: morning reading should usually match yesterday's evening reading — the dashboard flags it if not.</div>
    </div>
    <div class="panel">
      <h2>📖 Ride History</h2>
      ${rideHistoryTableHTML()}
    </div>
  `;
}

function changeLogDate(v){
  logFormDate = v; logNotice = '';
  renderTab();
}

function editRide(dateStr){
  logFormDate = dateStr; logNotice = '';
  activeTab = 'log';
  renderTab();
  const el = document.getElementById('log-morning');
  if(el && typeof el.scrollIntoView === 'function') el.scrollIntoView({behavior:'smooth', block:'center'});
}

function rideHistoryTableHTML(){
  const dates = sortedDates().sort().reverse();
  if(dates.length===0) return `<div class="empty">No rides logged yet.</div>`;
  return `
    <table>
      <tr><th>Date</th><th>Morning</th><th>Evening</th><th>Dist</th><th>Note</th><th></th></tr>
      ${dates.map(d=>{
        const e = data.entries[d];
        const dist = distanceForDate(d);
        return `<tr>
          <td>${dLabel(d)}</td>
          <td>${e.morning ?? '—'}</td>
          <td>${e.evening ?? '—'}</td>
          <td>${dist!=null ? dist+' km' : '<span class="gap-flag">missing</span>'}</td>
          <td style="font-family:'Inter',sans-serif; font-size:12px; color:var(--muted);">${e.note ?? '—'}</td>
          <td class="row-actions">
            <button class="icon-btn" onclick="editRide('${d}')">✎</button>
            <button class="icon-btn" onclick="deleteEntry('${d}')">✕</button>
          </td>
        </tr>`;
      }).join('')}
    </table>
  `;
}

async function submitLog(){
  const iso = document.getElementById('log-date').value;
  const morning = document.getElementById('log-morning').value;
  const evening = document.getElementById('log-evening').value;
  if(!iso){ alert('Pick a date'); return; }
  const note = document.getElementById('log-note').value;
  const existed = !!data.entries[iso];
  data.entries[iso] = {
    morning: morning!=='' ? Number(morning) : (data.entries[iso]?.morning ?? null),
    evening: evening!=='' ? Number(evening) : (data.entries[iso]?.evening ?? null),
    note: note || undefined
  };
  const saved = data.entries[iso];
  if(saved.evening==null){
    // Day not finished yet: stay on it so the evening reading can be added later.
    logFormDate = iso;
    logNotice = 'Saved the morning reading for ' + dLabel(iso) + '. Add the evening reading when you are back.';
  } else if(existed){
    logFormDate = nextLogDate();
    logNotice = 'Updated ' + dLabel(iso) + '. Now on ' + dLabel(logFormDate) + '.';
  } else {
    let n = addDaysISO(iso, 1), guard = 0;
    while(data.entries[n] && data.entries[n].evening!=null && guard++ < 400) n = addDaysISO(n, 1);
    logFormDate = n;
    logNotice = 'Saved ' + dLabel(iso) + '. Now on ' + dLabel(n) + '.';
  }
  await saveData();
  render();
  activeTab='log'; renderTab();
}

async function deleteEntry(iso){
  delete data.entries[iso];
  await saveData();
  render();
  activeTab='log'; renderTab();
}
