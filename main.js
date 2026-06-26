/* ═══════════════════════════════════════════════
   WEDDING INVITATION — main.js
   Risna Karima & Muhammad Busairi
═══════════════════════════════════════════════ */

// ── Init AOS ──
AOS.init({
  duration: 750,
  easing: 'ease-out-cubic',
  once: true,
  offset: 50,
});

// ── Target wedding date/time (WITA = UTC+8) ──
const WEDDING_DATE = new Date('2026-07-23T20:00:00+08:00');

/* ════════════════════════════════════════════
   OPEN INVITATION
════════════════════════════════════════════ */
document.getElementById('btnBuka').addEventListener('click', openInvitation);

function openInvitation() {
  const cover   = document.getElementById('cover');
  const content = document.getElementById('main-content');
  const nav     = document.getElementById('bottom-nav');
  const music = document.getElementById('bg-music');
  music.play().catch(() => console.warn('Autoplay diblokir.'));
  document.getElementById('btn-music').classList.remove('hidden');

  // Fade out cover, then show content
  cover.style.transition = 'opacity 0.6s ease';
  cover.style.opacity = '0';

  setTimeout(() => {
    cover.classList.add('hidden');
    content.classList.remove('hidden');
    nav.classList.remove('hidden');

    // Fade in content
    content.style.opacity = '0';
    content.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        content.style.opacity = '1';
      });
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Start countdown
    startCountdown();

    // Load saved ucapan
    loadUcapan();

    // AOS refresh
    setTimeout(() => AOS.refresh(), 300);

    // Setup gallery lightbox
    setupGallery();

    // Highlight nav based on scroll
    setupScrollSpy();
  }, 600);
}

/* ════════════════════════════════════════════
   COUNTDOWN TIMER
════════════════════════════════════════════ */
function startCountdown() {
  function tick() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      setCountdown(0, 0, 0, 0);
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdown(days, hours, minutes, seconds);
  }

  function setCountdown(d, h, m, s) {
    document.getElementById('cd-days').textContent    = pad(d);
    document.getElementById('cd-hours').textContent   = pad(h);
    document.getElementById('cd-minutes').textContent = pad(m);
    document.getElementById('cd-seconds').textContent = pad(s);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  tick();
  setInterval(tick, 1000);
}

/* ════════════════════════════════════════════
   BOTTOM NAV — SCROLL SPY
════════════════════════════════════════════ */
function setupScrollSpy() {
  const sections = ['ayat','mempelai','countdown','acara','lokasi','galeri','contact','gift','ucapan','penutup'];
  const navItems = document.querySelectorAll('.nav-item');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === id);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

function navTo(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return false; // prevent # scroll jump
}

/* ════════════════════════════════════════════
   GALLERY LIGHTBOX
════════════════════════════════════════════ */
function setupGallery() {
  const items = document.querySelectorAll('.gal-item img');
  items.forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src));
  });
}

function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lb-img').src = src;
  lb.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

// Close lightbox on backdrop click
document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});

// Close lightbox on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

/* ════════════════════════════════════════════
   UCAPAN & DOA — LocalStorage
════════════════════════════════════════════ */
const STORAGE_KEY = 'wedding_ucapan_risna_busairi';

function kirimUcapan() {
  const nama  = document.getElementById('inp-nama').value.trim();
  const pesan = document.getElementById('inp-pesan').value.trim();

  if (!nama || !pesan) {
    shakeInput(!nama ? 'inp-nama' : 'inp-pesan');
    return;
  }

  const item = {
    nama,
    pesan,
    waktu: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  };

  // Save to localStorage
  const list = getSavedUcapan();
  list.unshift(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

  // Add to DOM
  prependUcapanDOM(item);

  // Reset inputs
  document.getElementById('inp-nama').value  = '';
  document.getElementById('inp-pesan').value = '';
}

function getSavedUcapan() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function loadUcapan() {
  const list = getSavedUcapan();
  list.forEach(item => appendUcapanDOM(item));
}

function prependUcapanDOM(item) {
  const container = document.getElementById('ucapan-list');
  const el = buildUcapanEl(item);
  container.insertBefore(el, container.firstChild);
}

function appendUcapanDOM(item) {
  const container = document.getElementById('ucapan-list');
  container.appendChild(buildUcapanEl(item));
}

function buildUcapanEl({ nama, pesan, waktu }) {
  const div = document.createElement('div');
  div.className = 'ucapan-item';
  div.innerHTML = `
    <span class="ucapan-user">
      <i class="fas fa-user-circle"></i> ${escHtml(nama)}
      ${waktu ? `<span style="font-weight:400;color:var(--brown-light);font-size:0.65rem;margin-left:auto">${waktu}</span>` : ''}
    </span>
    <p class="ucapan-msg">${escHtml(pesan)}</p>
  `;
  return div;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Shake animation for empty input
function shakeInput(id) {
  const el = document.getElementById(id);
  el.style.borderColor = '#e05252';
  el.style.animation = 'none';
  setTimeout(() => {
    el.style.animation = 'shake 0.4s ease';
  }, 10);
  el.focus();
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation   = '';
  }, 1000);
}

// Add shake keyframes
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{ transform: translateX(0); }
    20%    { transform: translateX(-6px); }
    40%    { transform: translateX(6px); }
    60%    { transform: translateX(-4px); }
    80%    { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ════════════════════════════════════════════
   BACKGROUND MUSIC TOGGLE
════════════════════════════════════════════ */
document.getElementById('btn-music').addEventListener('click', toggleMusic);

function toggleMusic() {
  const music = document.getElementById('bg-music');
  const btn   = document.getElementById('btn-music');
  const icon  = btn.querySelector('i');

  if (music.paused) {
    music.play();
    icon.className = 'fas fa-music';
  } else {
    music.pause();
    icon.className = 'fas fa-music-slash';
  }
}

/* ════════════════════════════════════════════
   COPY REKENING
════════════════════════════════════════════ */
function salin(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML  = '<i class="fas fa-check"></i> Disalin!';
    btn.style.background = '#4CAF50';
    setTimeout(() => {
      btn.innerHTML        = original;
      btn.style.background = '';
    }, 2200);
  }).catch(() => {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity  = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    btn.innerHTML = '<i class="fas fa-check"></i> Disalin!';
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Salin'; }, 2200);
  });
}
