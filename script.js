const RSVP_API_URL = 'https://script.google.com/macros/s/AKfycbwvGEIx3en8flVLpmQ5dT70_cXF4W0jSg3MjaQGD_qrjb__EianQkkm-a00SEvDO_5R/exec';

// Attach section images from data attributes.
document.querySelectorAll('.image-scene').forEach(section => {
  section.style.setProperty('--section-image', `url("${section.dataset.image}")`);
});

// Menu
const menuBtn = document.getElementById('menuBtn');
const navPanel = document.getElementById('navPanel');
menuBtn.addEventListener('click', () => navPanel.classList.toggle('open'));
navPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navPanel.classList.remove('open')));

// Lenis smooth scrolling
let lenis;
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.Lenis) {
  lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.05 });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

// Scroll progress + GSAP
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = `${Math.min(100, Math.max(0, scrollY / max * 100))}%`;
});

if (window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('.image-scene .scene-image').forEach(img => {
    gsap.fromTo(img,{scale:1.06,yPercent:-1.8},{scale:1.01,yPercent:1.8,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
  });
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.from(el,{opacity:0,y:45,duration:1.05,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 78%',once:true}});
  });
}

// Live countdown (Charlotte = America/New_York; Jan 9, 2027 is EST -05:00)
const EVENT = new Date('2027-01-09T19:00:00-05:00').getTime();
const ids = ['days','hours','minutes','seconds'];
function updateCountdown(){
  let diff = Math.max(0, EVENT - Date.now());
  const d = Math.floor(diff / 86400000); diff %= 86400000;
  const h = Math.floor(diff / 3600000); diff %= 3600000;
  const m = Math.floor(diff / 60000); diff %= 60000;
  const s = Math.floor(diff / 1000);
  [d,h,m,s].forEach((v,i)=>document.getElementById(ids[i]).textContent = i===0 ? String(v).padStart(3,'0') : String(v).padStart(2,'0'));
}
updateCountdown(); setInterval(updateCountdown,1000);

// RSVP state
const form = document.getElementById('rsvpForm');
const attendingOnly = document.querySelector('.attending-only');
const declineMessage = document.getElementById('declineMessage');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');
const confirmation = document.getElementById('confirmation');
const confirmCard = document.getElementById('confirmCard');

function syncAttendanceUI(){
  const value = form.elements.attendance.value;
  const declining = value === 'Not Attending';
  attendingOnly.style.display = declining ? 'none' : 'block';
  declineMessage.hidden = !declining;
}
form.querySelectorAll('input[name="attendance"]').forEach(r => r.addEventListener('change', syncAttendanceUI));
syncAttendanceUI();

function validate(){
  const data = new FormData(form);
  if (!String(data.get('guestName')||'').trim()) return 'Please enter your name.';
  if (!String(data.get('phone')||'').trim()) return 'Please enter your phone number.';
  const email = String(data.get('email')||'').trim();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.';
  return '';
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  formStatus.textContent = '';
  const error = validate(); if (error){ formStatus.textContent = error; return; }
  const fd = new FormData(form);
  const attending = fd.get('attendance') === 'Attending';
  const payload = {
    guestName: String(fd.get('guestName')).trim(),
    attendance: String(fd.get('attendance')),
    adults: attending ? Number(fd.get('adults')||1) : 0,
    children: attending ? Number(fd.get('children')||0) : 0,
    phone: String(fd.get('phone')).trim(),
    email: String(fd.get('email')).trim()
  };
  submitBtn.disabled = true; submitBtn.textContent = 'SENDING…';
  try{
    // text/plain avoids unnecessary CORS preflight with Apps Script.
    await fetch(RSVP_API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'});
    showConfirmation(payload.attendance);
  }catch(err){
    formStatus.textContent = 'We could not submit your RSVP. Please try again.';
  }finally{
    submitBtn.disabled = false; submitBtn.textContent = 'SUBMIT RSVP';
  }
});

function showConfirmation(attendance){
  const attending = attendance === 'Attending';
  confirmCard.innerHTML = attending
    ? `<div class="check">✓</div><h2>You're on<br>the list!</h2><div class="gold-divider"><span></span><b>✦</b><span></span></div><p>We can't wait to celebrate<br>with you in Charlotte.</p><a href="#rsvp" class="edit-link">Edit RSVP</a>`
    : `<div class="check">✦</div><h2>Thank you<br>for letting us know!</h2><div class="gold-divider"><span></span><b>✦</b><span></span></div><p>We'll miss having you there,<br>but your love and support mean so much to us.</p><a href="#rsvp" class="edit-link">Change response</a>`;
  confirmation.hidden = false;
  requestAnimationFrame(()=>confirmation.scrollIntoView({behavior:'smooth'}));
  confirmCard.querySelector('.edit-link').addEventListener('click',()=>{ confirmation.hidden=true; });
}
