'use strict';

// ─────────────────────────────────────────
// HUD Production House — Main JS
// ─────────────────────────────────────────

// ── TOAST ────────────────────────────────
function showToast(msg, duration) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, duration || 3000);
}

// ── LANG ────────────────────────────────
var LANG_KEY = 'hud_lang';

function getLang() {
  // Check cookie first, then localStorage
  var cookie = document.cookie.split(';').find(function(c) { return c.trim().startsWith('hud_lang='); });
  if (cookie) return cookie.split('=')[1].trim();
  return localStorage.getItem(LANG_KEY) || 'id';
}

var curLang = getLang();

function setLang(lang) {
  var valid = ['id','en','ar','zh'];
  if (!valid.includes(lang)) return;
  curLang = lang;
  localStorage.setItem(LANG_KEY, lang);

  document.querySelectorAll('.lang-btn').forEach(function(b) {
    var map = {'ID':'id','EN':'en','AR':'ar','中文':'zh'};
    b.classList.toggle('on', map[b.textContent.trim()] === lang);
  });

  document.querySelectorAll('[data-lang]').forEach(function(el) {
    if (el.classList.contains('li')) {
      el.classList.toggle('on', el.dataset.lang === lang);
    }
  });

  document.documentElement.lang = lang;
  document.body.style.direction = (lang === 'ar') ? 'rtl' : 'ltr';

  fetch('/api/lang', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({lang: lang})
  }).catch(function() {});

  var labels = {'id':'Bahasa Indonesia','en':'English','ar':'العربية','zh':'中文'};
  showToast(labels[lang] || lang, 2000);
}

// Init lang on load
document.addEventListener('DOMContentLoaded', function() {
  setLang(curLang);
});

// ── CAROUSEL ───────────────────────────
var cur = 0, total = 0, autoTimer;

function initCarousel() {
  var slides = document.querySelectorAll('.hero-slide');
  total = slides.length;
  if (!total) return;
  goSlide(0);
  startAuto();

  var wrap = document.querySelector('.hero-wrap');
  if (!wrap) return;
  var txStart = 0;
  wrap.addEventListener('touchstart', function(e) {
    txStart = e.changedTouches[0].screenX;
  }, {passive: true});
  wrap.addEventListener('touchend', function(e) {
    var diff = txStart - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
  }, {passive: true});
  wrap.addEventListener('mouseenter', stopAuto);
  wrap.addEventListener('mouseleave', startAuto);
}

function goSlide(n) {
  cur = ((n % total) + total) % total;
  var track = document.getElementById('heroSlides');
  if (track) track.style.transform = 'translateX(-' + cur * 100 + '%)';
  document.querySelectorAll('.cdot').forEach(function(d, i) {
    d.classList.toggle('on', i === cur);
  });
}
function nextSlide() { goSlide(cur + 1); }
function prevSlide() { goSlide(cur - 1); }
function startAuto() { stopAuto(); autoTimer = setInterval(nextSlide, 5500); }
function stopAuto() { clearInterval(autoTimer); }

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft') { prevSlide(); stopAuto(); }
  if (e.key === 'ArrowRight') { nextSlide(); stopAuto(); }
});

// ── DIVISION SWITCHER ──────────────────
var divHeroMap = {
  'film': 0, 'brand': 1, 'podcast': 2, 'dok': 3,
  'digital': 0, 'animasi': 0, 'all': 0
};

function switchDiv(id, tabEl) {
  document.querySelectorAll('.divtab').forEach(function(t) { t.classList.remove('on'); });
  if (tabEl) tabEl.classList.add('on');
  stopAuto();
  goSlide(divHeroMap[id] || 0);
  startAuto();
}

// ── VIDEO PLAYER ───────────────────────
function selectVideo(el, tId, tEn, tAr, tZh, dId, dEn, dAr, dZh, cat, dur, thumb) {
  document.querySelectorAll('.vp-item').forEach(function(v) { v.classList.remove('on'); });
  el.classList.add('on');

  function se(id, val) { var e = document.getElementById(id); if (e) e.textContent = val; }

  se('videoCat', cat);
  se('videoTime', dur);
  se('vt-id', tId); se('vt-en', tEn); se('vt-ar', tAr); se('vt-zh', tZh);
  se('vd-id', dId); se('vd-en', dEn); se('vd-ar', dAr); se('vd-zh', dZh);

  var thumbEl = document.getElementById('videoThumb');
  if (thumbEl) thumbEl.src = thumb;
}

// ── MOBILE MENU ────────────────────────
function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  var ham = document.getElementById('hamburger');
  if (!menu) return;
  var isOpen = menu.classList.toggle('open');
  if (ham) ham.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

window.addEventListener('resize', function() {
  if (window.innerWidth > 1024) {
    var menu = document.getElementById('mobileMenu');
    var ham = document.getElementById('hamburger');
    if (menu) menu.classList.remove('open');
    if (ham) ham.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── SMOOTH HASH LINKS ─────────────────
document.addEventListener('click', function(e) {
  var a = e.target.closest('a[href^="#"]');
  if (a) {
    var hash = a.getAttribute('href').slice(1);
    var target = document.getElementById(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// ── SCROLL EFFECTS ────────────────────
window.addEventListener('scroll', function() {
  var topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.style.borderBottomColor = window.scrollY > 10
      ? 'rgba(45,106,79,0.45)'
      : 'rgba(45,106,79,0.25)';
  }

  // Reveal animation on scroll
  document.querySelectorAll('.reveal').forEach(function(el) {
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('revealed');
    }
  });
}, { passive: true });

// ── IMAGE LAZY LOAD ──────────────────
if ('IntersectionObserver' in window) {
  var imgObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var bg = el.dataset.bg;
        if (bg) {
          el.style.backgroundImage = 'url(' + bg + ')';
          el.removeAttribute('data-bg');
        }
        imgObserver.unobserve(el);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('[data-bg]').forEach(function(el) {
    imgObserver.observe(el);
  });
}

// ── INIT ──────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initCarousel();
});


function setLang(lang) {
  var valid = ['id','en','ar','zh'];
  if (!valid.includes(lang)) return;
  curLang = lang;
  localStorage.setItem(LANG_KEY, lang);

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(function(b) {
    var map = {'ID':'id','EN':'en','AR':'ar','中文':'zh'};
    b.classList.toggle('on', map[b.textContent.trim()] === lang);
  });

  // Show/hide language spans
  document.querySelectorAll('[data-lang]').forEach(function(el) {
    if (el.classList.contains('li')) {
      el.classList.toggle('on', el.dataset.lang === lang);
    }
  });

  // RTL for Arabic
  document.documentElement.lang = lang;
  document.body.style.direction = (lang === 'ar') ? 'rtl' : 'ltr';

  // Save to server (optional)
  fetch('/api/lang', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({lang: lang})
  }).catch(function() {});
}

// Init lang on load
document.addEventListener('DOMContentLoaded', function() {
  setLang(curLang);
});

// ── CAROUSEL ───────────────────────────
var cur = 0, total = 0, autoTimer;

function initCarousel() {
  var slides = document.querySelectorAll('.hero-slide');
  total = slides.length;
  if (!total) return;
  goSlide(0);
  startAuto();

  // Touch swipe
  var wrap = document.querySelector('.hero-wrap');
  if (!wrap) return;
  var txStart = 0;
  wrap.addEventListener('touchstart', function(e) { txStart = e.changedTouches[0].screenX; }, {passive:true});
  wrap.addEventListener('touchend', function(e) {
    var diff = txStart - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
  }, {passive:true});
  wrap.addEventListener('mouseenter', stopAuto);
  wrap.addEventListener('mouseleave', startAuto);
}

function goSlide(n) {
  cur = (n + total) % total;
  var track = document.getElementById('heroSlides');
  if (track) track.style.transform = 'translateX(-' + cur * 100 + '%)';
  document.querySelectorAll('.cdot').forEach(function(d, i) {
    d.classList.toggle('on', i === cur);
  });
}
function nextSlide() { goSlide(cur + 1); }
function prevSlide() { goSlide(cur - 1); }
function startAuto() { stopAuto(); autoTimer = setInterval(nextSlide, 5500); }
function stopAuto() { clearInterval(autoTimer); }

// Keyboard nav
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft') { prevSlide(); stopAuto(); }
  if (e.key === 'ArrowRight') { nextSlide(); stopAuto(); }
});

// ── DIVISION SWITCHER ──────────────────
var divHeroMap = {
  'film':0, 'brand':1, 'podcast':2, 'dok':3,
  'digital':0, 'animasi':0, 'all':0
};

function switchDiv(id, tabEl) {
  document.querySelectorAll('.divtab').forEach(function(t) { t.classList.remove('on'); });
  if (tabEl) tabEl.classList.add('on');
  stopAuto();
  goSlide(divHeroMap[id] || 0);
  startAuto();
}

// ── VIDEO PLAYER ───────────────────────
function selectVideo(el, tId, tEn, tAr, tZh, dId, dEn, dAr, dZh, cat, dur, thumb) {
  document.querySelectorAll('.vp-item').forEach(function(v) { v.classList.remove('on'); });
  el.classList.add('on');

  var setEl = function(id, val) { var e = document.getElementById(id); if (e) e.textContent = val; };
  var setImg = function(id, src) { var e = document.getElementById(id); if (e) { e.src = src; e.style.backgroundImage = 'url('+src+')'; } };

  setEl('videoCat', cat);
  setEl('videoTime', dur);
  setEl('vt-id', tId); setEl('vt-en', tEn); setEl('vt-ar', tAr); setEl('vt-zh', tZh);
  setEl('vd-id', dId); setEl('vd-en', dEn); setEl('vd-ar', dAr); setEl('vd-zh', dZh);

  var thumbEl = document.getElementById('videoThumb');
  if (thumbEl) { thumbEl.src = thumb; }
}

// ── MOBILE MENU ────────────────────────
function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  var ham = document.getElementById('hamburger');
  if (!menu) return;
  menu.classList.toggle('open');
  ham && ham.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}

// Close menu on resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 1024) {
    var menu = document.getElementById('mobileMenu');
    var ham = document.getElementById('hamburger');
    if (menu) menu.classList.remove('open');
    if (ham) ham.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── SCROLL TO ─────────────────────────
function scrollToSec(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Smooth hash links
document.addEventListener('click', function(e) {
  var a = e.target.closest('a[href^="#"]');
  if (a) {
    var hash = a.getAttribute('href').slice(1);
    var target = document.getElementById(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// ── ACTIVE NAV ON SCROLL ───────────────
window.addEventListener('scroll', function() {
  var topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.style.borderBottomColor = window.scrollY > 10
      ? 'rgba(45,106,79,0.4)'
      : 'rgba(45,106,79,0.25)';
  }
}, { passive: true });

// ── INIT ──────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initCarousel();
});
