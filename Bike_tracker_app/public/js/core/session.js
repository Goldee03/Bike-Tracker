/* SESSION TIMEOUT
   Signs the user out after IDLE_LIMIT_HOURS of no use. */

// ---------- Session timeout ----------
// Signed out after this many hours without using the app. Change here.
const IDLE_LIMIT_HOURS = 2;
const ACTIVE_KEY = 'bt_last_active';
function getActive(){ try{ return Number(localStorage.getItem(ACTIVE_KEY))||0; }catch(e){ return 0; } }
function touchActive(){ try{ localStorage.setItem(ACTIVE_KEY, String(Date.now())); }catch(e){} }
function clearActive(){ try{ localStorage.removeItem(ACTIVE_KEY); }catch(e){} }
function sessionExpired(){
  const t = getActive();
  return !t || (Date.now() - t) > IDLE_LIMIT_HOURS*3600*1000;
}
let lastTouch = 0;
function noteActivity(){
  if(!currentUser) return;
  const n = Date.now();
  if(n - lastTouch > 30000){ lastTouch = n; touchActive(); }
}
async function expireSession(){
  clearActive();
  try{ sessionStorage.setItem('bt_notice', 'You were signed out after '+IDLE_LIMIT_HOURS+' hours of inactivity. Sign in again to continue.'); }catch(e){}
  await sb.auth.signOut();
}
function checkIdle(){
  if(currentUser && sessionExpired()) expireSession();
}
['pointerdown','keydown','touchstart'].forEach(ev => window.addEventListener(ev, noteActivity, {passive:true}));
document.addEventListener('visibilitychange', () => { if(!document.hidden) checkIdle(); });
setInterval(checkIdle, 60000);
