const cursor = document.getElementById('cursor');
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
const loaderPercent = document.getElementById('loaderPercent');
const openCalendly = document.getElementById('openCalendly');
const calendlyModal = document.getElementById('calendlyModal');
const calendlyFrame = document.getElementById('calendlyFrame');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.querySelector('nav ul');
let loaderProgress = 0;
let loaderTimer = null;

function setLoaderProgress(value){
  loaderProgress = Math.max(loaderProgress, Math.min(value, 100));
  if (loaderBar) loaderBar.style.width = `${loaderProgress}%`;
  if (loaderPercent) loaderPercent.textContent = `${Math.round(loaderProgress)}%`;
}

if (loader) {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const slowConnection = connection && (connection.saveData || /2g/.test(connection.effectiveType || ''));
  const step = slowConnection ? 4 : 8;
  const delay = slowConnection ? 220 : 120;

  loaderTimer = window.setInterval(() => {
    const ceiling = document.readyState === 'complete' ? 96 : 82;
    setLoaderProgress(Math.min(loaderProgress + Math.random() * step, ceiling));
  }, delay);
}

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('cut', e => e.preventDefault());
document.addEventListener('paste', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  const blockedShortcut = (e.ctrlKey || e.metaKey) && ['a', 'c', 's', 'u', 'p'].includes(key);

  if (blockedShortcut || e.key === 'F12') {
    e.preventDefault();
  }
});

function showCalendly(){
  if (!calendlyModal) return;
  if (calendlyFrame && !calendlyFrame.src) {
    calendlyFrame.src = calendlyFrame.dataset.src;
  }
  calendlyModal.classList.add('open');
  calendlyModal.setAttribute('aria-hidden', 'false');
}

function hideCalendly(){
  if (!calendlyModal) return;
  calendlyModal.classList.remove('open');
  calendlyModal.setAttribute('aria-hidden', 'true');
}

function calendlyIsOpen(){
  return calendlyModal?.classList.contains('open');
}

openCalendly?.addEventListener('click', showCalendly);
document.querySelectorAll('[data-close-calendly]').forEach(el=>{
  el.addEventListener('click', hideCalendly);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideCalendly();
});

function closeMobileMenu(){
  navMenu?.classList.remove('open');
  menuToggle?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}

menuToggle?.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = navMenu?.classList.toggle('open');
  menuToggle.classList.toggle('open', Boolean(isOpen));
  menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

navMenu?.addEventListener('click', e => {
  if (e.target.closest('a')) closeMobileMenu();
});

document.addEventListener('click', e => {
  if (!navMenu?.classList.contains('open')) return;
  if (e.target.closest('nav')) return;
  closeMobileMenu();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});

window.addEventListener('load',()=>{
  if (!loader) return;
  window.clearInterval(loaderTimer);
  setLoaderProgress(100);
  window.setTimeout(()=>loader.classList.add('is-hidden'),450);
});

let mx=0,my=0,cx=0,cy=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
function loop(){
  cx += (mx-cx)*0.18; cy += (my-cy)*0.18;
  cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  requestAnimationFrame(loop);
}
loop();
document.querySelectorAll('a, [data-hover], .price-card, .proof-card, .faq-item').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursor.classList.add('hover'));
  el.addEventListener('mouseleave',()=>cursor.classList.remove('hover'));
});

document.querySelectorAll('.proof-card').forEach(card=>{
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - .5) * 10;
    const rotateX = -((y / rect.height) - .5) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .stagger-words, .proof-card';
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
},{threshold:.1, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll(revealSelectors).forEach(el=>io.observe(el));

const sections = Array.from(document.querySelectorAll('.snap-section'));
const wipe = document.getElementById('wipe');
const wipeContent = document.getElementById('wipeContent');
const scrollHint = document.getElementById('scrollHint');
let currentSection = 0, isTransitioning = false, scrollAccumulator = 0;
const SCROLL_THRESHOLD = 80;

function goToSection(target){
  if (isTransitioning || target === currentSection || target < 0 || target >= sections.length) return;
  isTransitioning = true;
  const fromSection = sections[currentSection], toSection = sections[target];
  wipeContent.textContent = toSection.dataset.label || '';
  wipe.classList.add('active');
  requestAnimationFrame(() => wipe.classList.add('expand'));
  setTimeout(() => {
    fromSection.classList.remove('active');
    toSection.classList.add('active');
    toSection.scrollTop = 0;
    toSection.querySelectorAll(revealSelectors).forEach(el => el.classList.add('in'));
    currentSection = target;
  }, 600);
  setTimeout(() => wipe.classList.remove('expand'), 1000);
  setTimeout(() => {
    wipe.classList.remove('active');
    isTransitioning = false;
    scrollAccumulator = 0;
  }, 1400);
  if (scrollHint) scrollHint.classList.add('hidden');
}
function next(){ goToSection(currentSection + 1); }
function prev(){ goToSection(currentSection - 1); }

window.addEventListener('wheel', (e) => {
  if (calendlyIsOpen()) { e.preventDefault(); return; }
  if (isTransitioning) { e.preventDefault(); return; }
  const active = sections[currentSection];
  const atTop = active.scrollTop <= 2;
  const atBottom = Math.ceil(active.scrollTop + active.clientHeight) >= active.scrollHeight - 2;
  if (e.deltaY > 0 && atBottom){
    scrollAccumulator += e.deltaY;
    if (scrollAccumulator > SCROLL_THRESHOLD){ e.preventDefault(); next(); }
  } else if (e.deltaY < 0 && atTop){
    scrollAccumulator += e.deltaY;
    if (scrollAccumulator < -SCROLL_THRESHOLD){ e.preventDefault(); prev(); }
  } else { scrollAccumulator = 0; }
}, { passive: false });

window.addEventListener('keydown', (e) => {
  if (calendlyIsOpen()) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' '){ e.preventDefault(); next(); }
  else if (e.key === 'ArrowUp' || e.key === 'PageUp'){ e.preventDefault(); prev(); }
});

let touchStartY = 0;
window.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', (e) => {
  if (calendlyIsOpen()) return;
  if (isTransitioning) return;
  const diff = touchStartY - e.changedTouches[0].clientY;
  const active = sections[currentSection];
  const atTop = active.scrollTop <= 2;
  const atBottom = Math.ceil(active.scrollTop + active.clientHeight) >= active.scrollHeight - 2;
  if (Math.abs(diff) < 60) return;
  if (diff > 0 && atBottom) next();
  else if (diff < 0 && atTop) prev();
}, { passive: true });

const sectionIdMap = { 'about': 1, 'services': 2, 'results': 3, 'process': 4, 'faq': 5, 'contact': 6 };
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = link.getAttribute('href').slice(1);
    if (sectionIdMap[target] !== undefined){ e.preventDefault(); goToSection(sectionIdMap[target]); }
  });
});

document.querySelectorAll('.faq-item').forEach(item=>{
  item.addEventListener('click',()=>item.classList.toggle('open'));
});

function animateCount(el){
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const duration = 1600;
  const start = performance.now();
  function tick(now){
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(decimals);
  }
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ animateCount(e.target); countObserver.unobserve(e.target); }});
},{threshold:.4});
document.querySelectorAll('.count').forEach(el=>countObserver.observe(el));

const ig = document.getElementById('igFloat');
const wa = document.getElementById('waFloat');
window.addEventListener('load',()=>{
  setTimeout(()=>wa?.classList.add('ready'),900);
  setTimeout(()=>ig?.classList.add('ready'),1100);
});
