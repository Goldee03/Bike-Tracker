/* DATA
   Default data, migration of old data, and loading/saving to Supabase (table user_data). */

// A brand-new account starts empty. All real records live in the database.
function defaultData(){
  return {
    entries: {},
    refills: [],
    services: [],
    expenses: [],
    settings: {intervalKm:2000},
    schemaVersion: SHEET_SCHEMA_VERSION
  };
}

function migrate(parsed){
  // upgrade old single-service shape to services[] + settings
  if(parsed.service && !parsed.services){
    parsed.services = [{
      id:'svc-legacy',
      date: Object.keys(parsed.entries||{}).sort()[0] || todayISO(),
      odometer: parsed.service.lastServiceOdo || 0,
      cost: 0,
      note:'Migrated from earlier version'
    }];
    parsed.settings = {intervalKm: parsed.service.intervalKm || 2000};
    delete parsed.service;
  }
  if(!parsed.services) parsed.services = [];
  if(!parsed.expenses) parsed.expenses = [];
  if(!parsed.settings) parsed.settings = {intervalKm:2000};
  if(!parsed.refills) parsed.refills = [];
  if(!parsed.entries) parsed.entries = {};

  return parsed;
}

let loadOk = false; // never save over the DB if the initial load failed
let sb = null;        // Supabase client
let currentUser = null;

function showWarn(on){ const w=document.getElementById('conn-warning'); if(w) w.style.display = on?'block':'none'; }

async function loadData(){
  loadOk = false;
  try{
    const { data: row, error } = await sb.from('user_data').select('data').eq('user_id', currentUser.id).maybeSingle();
    if(error) throw error;
    data = row && row.data ? migrate(row.data) : defaultData();
    logFormDate = nextLogDate(); logNotice = '';
    loadOk = true;
    showWarn(false);
    await saveData();
  }catch(e){
    console.error('load failed', e);
    data = defaultData();
    showWarn(true);
  }
  render();
}

async function saveData(){
  if(!loadOk){ showWarn(true); return; }
  try{
    const { error } = await sb.from('user_data').upsert({ user_id: currentUser.id, data: data, updated_at: new Date().toISOString() });
    if(error) throw error;
    showWarn(false);
  }catch(e){
    console.error('save failed', e);
    showWarn(true);
  }
}
