/* ROUTER
   One URL per page: /dashboard, /logride, /fuellog ... and back-button handling. */

// ---------- Routes (one URL per feature) ----------
const ROUTES = {
  dashboard:'/dashboard', log:'/logride', refuel:'/fuellog', service:'/service',
  expenses:'/expenses', spending:'/spending', mileage:'/mileage', export:'/backup'
};
const NAV_ICONS = {dashboard:'📊', log:'📝', refuel:'⛽', service:'🔧', expenses:'🧾', spending:'💰', mileage:'📈', export:'💾'};
const TITLES = {
  dashboard:'Dashboard', log:'Log Ride', refuel:'Fuel Log', service:'Service',
  expenses:'Expenses', spending:'Spending', mileage:'Mileage', export:'Backup'
};
function tabFromPath(path){
  path = (path||'/').replace(/\/+$/,'') || '/';
  if(path==='/fuelog') return 'refuel'; // alias
  for(const k in ROUTES){ if(ROUTES[k]===path) return k; }
  return 'dashboard';
}
function navTo(tab, ev){
  if(ev && ev.preventDefault) ev.preventDefault();
  activeTab = tab;
  if(location.pathname !== ROUTES[tab]) history.pushState({}, '', ROUTES[tab]);
  render();
  window.scrollTo(0,0);
  return false;
}
window.addEventListener('popstate', () => {
  if(!currentUser || !data) return;
  activeTab = tabFromPath(location.pathname);
  render();
});
