/* APP SHELL
   Draws the side menu + page frame, picks which page to show, and starts the app (startApp). */

function startApp(){
  const cfg = window.APP_CONFIG || {};
  if(!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_KEY || cfg.SUPABASE_KEY.startsWith('PASTE_')){
    document.getElementById('app').innerHTML = '<div class="loading">App is not configured: set SUPABASE_KEY in public/config.js</div>';
    return;
  }
  sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);
  const fromEmailLink = /access_token|type=signup|type=recovery/.test(location.hash||'');
  const intended = location.pathname;
  let lastUid = undefined;
  sb.auth.onAuthStateChange((event, session) => {
    const uid = session && session.user ? session.user.id : null;
    if(uid === lastUid && event !== 'SIGNED_OUT') return; // ignore token refreshes
    lastUid = uid;
    if(!uid){
      currentUser = null; data = null; loadOk = false; showWarn(false);
      try{ if(location.pathname !== '/login') history.replaceState({}, '', '/login'); }catch(e){}
      showLogin('signin');
      return;
    }
    // Existing browser session: only keep it if it was used recently.
    const fresh = event==='SIGNED_IN' && (!getActive() || fromEmailLink);
    if(fresh) touchActive();
    if(event==='INITIAL_SESSION' && fromEmailLink) touchActive();
    if(sessionExpired()){
      lastUid = undefined;
      setTimeout(expireSession, 0);
      return;
    }
    currentUser = session.user;
    document.getElementById('app').className = 'wrap wide';
    const pathTab = (intended==='/login'||intended==='/') ? 'dashboard' : tabFromPath(intended);
    activeTab = (location.pathname==='/login') ? pathTab : tabFromPath(location.pathname);
    document.getElementById('app').innerHTML = '<div class="loading">Booting up the dashboard…</div>';
    setTimeout(loadData, 0); // don't call Supabase inside the auth callback
  });
}

function render(){
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="shell">
    <aside class="rail">
      <header>
        <h1>🏍️ Bike Log</h1>
        <p>Your bike, logged honestly — mileage and money, long term.</p>
      </header>
    <nav class="tabs" aria-label="Sections">
${Object.keys(ROUTES).map(k=>`      <a class="tab ${activeTab===k?'active':''}" href="${ROUTES[k]}" onclick="return navTo('${k}',event)"><span class="ico">${NAV_ICONS[k]}</span><span>${k==='log'?'Log Ride':k==='refuel'?'Fuel Log':TITLES[k]}</span></a>`).join('\n')}
    </nav>
      <div class="rail-foot">
        <div class="who">${currentUser?currentUser.email:''}</div>
        <a href="#" class="signout" onclick="doSignOut();return false;">Sign out</a>
      </div>
    </aside>
    <main class="main">

    ${activeTab==='dashboard' ? dashboardHTML() : ''}

    <div id="tab-content"></div>
    <div class="footer-note">Data is stored privately to your account and persists across sessions.</div>
    </main>
    </div>
  `;

  document.title = (TITLES[activeTab]||'Dashboard') + ' · Bike Log';
  if(location.pathname!==ROUTES[activeTab] && !(activeTab==='refuel' && location.pathname==='/fuelog')) history.replaceState({}, '', ROUTES[activeTab]);
  renderTab();
  if(activeTab==='dashboard') renderDistChart();
}

function setTab(t){ navTo(t); }

function renderTab(){
  const el = document.getElementById('tab-content');
  if(!el) return;
  el.className = 'tc-' + activeTab;
  if(activeTab==='log') el.innerHTML = logTabHTML();
  else if(activeTab==='refuel') el.innerHTML = refuelTabHTML();
  else if(activeTab==='service') el.innerHTML = serviceTabHTML();
  else if(activeTab==='expenses') el.innerHTML = expensesTabHTML();
  else if(activeTab==='spending'){ el.innerHTML = spendingTabHTML(); renderSpendingCharts(); }
  else if(activeTab==='mileage'){ el.innerHTML = mileageTabHTML(); renderMileageChart(); }
  else if(activeTab==='export') el.innerHTML = exportTabHTML();
}

document.addEventListener('click', e => {
  const t = e.target;
  if(t && t.matches && t.matches('input[type="date"]') && typeof t.showPicker === 'function'){
    try{ t.showPicker(); }catch(err){}
  }
});
startApp();
