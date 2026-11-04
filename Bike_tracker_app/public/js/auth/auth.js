/* LOGIN / REGISTER
   Login page markup, sign in, sign up, password reset, sign out. */

// ---------- Authentication ----------
let authMode = 'signin';
function authMsg(text, kind){
  const el = document.getElementById('auth-msg'); if(!el) return;
  el.textContent = text||''; el.className = 'auth-msg' + (kind?(' '+kind):'');
}
function rollReels(){
  const target = '12840';
  document.querySelectorAll('.reel .strip').forEach((st,i)=>{
    st.style.transitionDelay = (i*0.14)+'s';
    st.style.transform = 'translateY(' + (-54*Number(target[i])) + 'px)';
  });
}
function loginBgHTML(){
  const cfg = window.APP_CONFIG || {};
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const img = '<img class="bg-photo" src="/media/bike-night.jpg" alt="" onerror="this.remove()">';
  const vid = (cfg.LOGIN_VIDEO && !reduce) ? '<video autoplay muted loop playsinline preload="auto" poster="/media/bike-night.jpg" src="'+cfg.LOGIN_VIDEO+'" onerror="this.remove()"></video>' : '';
  const streaks = [12,24,33,41,59,67,76,88].map((x,i)=>'<span style="left:'+x+'%;animation-delay:'+(i*0.37).toFixed(2)+'s"></span>').join('');
  // Layers: animated road (fallback) < photo < video < dark shade for readability
  return '<div class="auth-bg" aria-hidden="true"><div class="glow"></div>'+
    '<svg class="hills" viewBox="0 0 1200 80" preserveAspectRatio="none"><path d="M0 80 L0 48 L90 30 L180 46 L300 22 L420 44 L520 28 L640 50 L760 26 L880 46 L1000 24 L1100 42 L1200 30 L1200 80Z" fill="#0b0d0f"/></svg>'+
    '<div class="road-wrap"><div class="road"></div></div><div class="fade"></div><div class="beam"></div>'+
    '<div class="streaks">'+streaks+'</div>'+img+vid+'<div class="shade"></div></div>';
}
function showLogin(mode){
  authMode = mode || 'signin';
  const isUp = authMode==='signup';
  const app = document.getElementById('app');
  app.className = 'wrap auth';
  document.title = (isUp?'Create account':'Sign in') + ' · Bike Log';
  let notice=''; try{ notice = sessionStorage.getItem('bt_notice')||''; sessionStorage.removeItem('bt_notice'); }catch(e){}
  const reels = [0,1,2,3,4].map(()=>'<div class="reel"><div class="strip">'+[0,1,2,3,4,5,6,7,8,9].map(n=>'<span>'+n+'</span>').join('')+'</div></div>').join('');
  app.innerHTML = loginBgHTML() + `
    <div class="auth-shell">
      <section class="auth-hero" aria-label="About Bike Log">
        <div class="auth-brand">🏍️ Bike Log</div>
        <h1>Know what your bike really costs you.</h1>
        <p class="lede">Log a ride in ten seconds. Bike Log works out your mileage, your spending and your next service for you.</p>
        <div class="reel-box" aria-hidden="true">
          <div class="reels">${reels}<span class="reel-sep">km</span></div>
          <div class="reel-cap">Your odometer, always up to date</div>
        </div>
        <ul class="feat-list">
          <li><div class="feat-ico">🛣️</div><div><b>Daily rides</b><span>Note the odometer in the morning and evening. Distance and gaps are worked out for you.</span></div></li>
          <li><div class="feat-ico">⛽</div><div><b>Real mileage</b><span>See km per litre for every refuel, with the petrol price you paid.</span></div></li>
          <li><div class="feat-ico">🔧</div><div><b>Service countdown</b><span>Know exactly how many kilometres are left before the next service.</span></div></li>
          <li><div class="feat-ico">💰</div><div><b>Where the money goes</b><span>Fuel, repairs, insurance and accessories, split month by month.</span></div></li>
        </ul>
      </section>

      <section class="auth-card">
        <h2>${isUp?'Create your account':'Welcome back'}</h2>
        <p class="sub">${isUp?'Your rides and expenses stay private to your account.':'Sign in to see your dashboard.'}</p>
        <div class="seg" role="tablist">
          <button type="button" role="tab" aria-selected="${!isUp}" class="${!isUp?'on':''}" onclick="showLogin('signin')">Sign in</button>
          <button type="button" role="tab" aria-selected="${isUp}" class="${isUp?'on':''}" onclick="showLogin('signup')">Create account</button>
        </div>
        <form onsubmit="return submitAuth(event)" novalidate>
          <div class="field full" style="margin-bottom:12px;"><label for="auth-email">Email</label>
            <input id="auth-email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com"></div>
          <div class="field full" style="margin-bottom:14px;"><label for="auth-pass">Password</label>
            <div class="pw-wrap"><input id="auth-pass" type="password" autocomplete="${isUp?'new-password':'current-password'}" placeholder="${isUp?'At least 8 characters':'Your password'}">
            <button type="button" class="pw-toggle" onclick="togglePw()" id="pw-toggle" aria-label="Show password">Show</button></div></div>
          <button class="btn" id="auth-go" type="submit">${isUp?'Create account':'Sign in'}</button>
        </form>
        <div id="auth-msg" class="auth-msg" role="status" aria-live="polite"></div>
        <div class="auth-links">
          ${isUp?'<span></span>':'<a href="#" class="mut" onclick="doReset();return false;">Forgot password?</a>'}
          <a href="#" onclick="showLogin('${isUp?'signin':'signup'}');return false;">${isUp?'I already have an account':'New here? Create an account'}</a>
        </div>
        <p class="auth-foot">${isUp?'We will email you a link to confirm your address before you can sign in.':'Signed out automatically after '+IDLE_LIMIT_HOURS+' hours without use.'}</p>
      </section>
    </div>`;
  if(notice) authMsg(notice, '');
  requestAnimationFrame(()=>requestAnimationFrame(rollReels));
}
function togglePw(){
  const i=document.getElementById('auth-pass'), b=document.getElementById('pw-toggle');
  const show = i.type==='password'; i.type = show?'text':'password';
  b.textContent = show?'Hide':'Show'; b.setAttribute('aria-label', show?'Hide password':'Show password');
}
function authVals(){ return { email: document.getElementById('auth-email').value.trim(), password: document.getElementById('auth-pass').value }; }
function setBusy(on){ const b=document.getElementById('auth-go'); if(b){ b.disabled=on; } }
function submitAuth(ev){
  if(ev) ev.preventDefault();
  if(authMode==='signup') doSignUp(); else doSignIn();
  return false;
}
async function doSignIn(){
  const {email,password} = authVals();
  if(!email||!password){ authMsg('Enter your email and password.', 'err'); return; }
  touchActive(); // a deliberate sign-in always starts a fresh session
  setBusy(true); authMsg('Signing in…');
  const { error } = await sb.auth.signInWithPassword({ email, password });
  setBusy(false);
  if(error){
    authMsg(/confirm/i.test(error.message)
      ? 'Confirm your email first. Open the link we sent you, then sign in.'
      : 'That email and password do not match. Check them and try again.', 'err');
  }
}
async function doSignUp(){
  const {email,password} = authVals();
  if(!email){ authMsg('Enter your email address.', 'err'); return; }
  if(password.length<8){ authMsg('Choose a password with at least 8 characters.', 'err'); return; }
  setBusy(true); authMsg('Creating your account…');
  const { data: res, error } = await sb.auth.signUp({ email, password, options:{ emailRedirectTo: window.location.origin } });
  setBusy(false);
  if(error){ authMsg(error.message, 'err'); return; }
  if(res.session) return;
  authMsg('Check your inbox. We sent a confirmation link to ' + email + '. Open it, then sign in.', 'ok');
}
async function doReset(){
  const {email} = authVals();
  if(!email){ authMsg('Enter your email above, then select Forgot password again.', 'err'); return; }
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  authMsg(error ? error.message : 'Reset link sent. Check your inbox.', error?'err':'ok');
}
async function doSignOut(){
  clearActive();
  await sb.auth.signOut();
}
