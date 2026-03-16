'use strict';
// ─────────────────────────────────────────
// HUD Admin — Client JS
// ─────────────────────────────────────────

// ── ACTIVE NAV ───────────────────────────
(function() {
  var path = window.location.pathname;
  document.querySelectorAll('.anav-item').forEach(function(a) {
    var href = a.getAttribute('href');
    if (!href) return;
    var isActive = path === href || (href !== '/admin' && path.startsWith(href));
    a.classList.toggle('active', isActive);
  });
})();

// ── CONFIRM DELETE ───────────────────────
document.querySelectorAll('form[onsubmit]').forEach(function(f) {
  // already handled inline
});

// ── AUTO SLUG FROM TITLE ─────────────────
(function() {
  var titleInput = document.querySelector('[name="titleId"]');
  if (!titleInput) return;
  // Slug is handled server-side
})();

// ── KEYBOARD SHORTCUTS ───────────────────
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + S = submit active form
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    var form = document.querySelector('.article-form, .settings-form');
    if (form) {
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.click();
    }
  }
  // Escape closes modal
  if (e.key === 'Escape') {
    var modal = document.querySelector('.modal.open');
    if (modal) modal.classList.remove('open');
  }
});

// ── DRAG & DROP UPLOAD ───────────────────
(function() {
  var dz = document.getElementById('dropZone');
  if (!dz) return;
  ['dragenter','dragover'].forEach(function(ev) {
    dz.addEventListener(ev, function(e) {
      e.preventDefault(); dz.classList.add('drag-over');
    }, false);
  });
  ['dragleave','drop'].forEach(function(ev) {
    dz.addEventListener(ev, function(e) {
      e.preventDefault(); dz.classList.remove('drag-over');
      if (ev === 'drop' && e.dataTransfer.files.length) {
        document.getElementById('fileInput').files = e.dataTransfer.files;
        document.getElementById('uploadForm').submit();
      }
    }, false);
  });
})();

// ── TOAST NOTIFICATION ───────────────────
function showAdminToast(msg, type) {
  var existing = document.getElementById('adminToast');
  if (existing) existing.remove();
  var t = document.createElement('div');
  t.id = 'adminToast';
  t.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;' +
    'background:#111a13;border:0.5px solid rgba(82,183,136,0.5);' +
    'color:#52B788;font-family:"DM Mono",monospace;font-size:10px;letter-spacing:1.5px;' +
    'padding:12px 20px;border-radius:4px;transition:all 0.25s;';
  if (type === 'error') t.style.borderColor = 'rgba(226,75,74,0.5)';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; setTimeout(function() { t.remove(); }, 300); }, 3000);
}

// ── COPY TO CLIPBOARD ────────────────────
function copyUrl(url) {
  var full = window.location.origin + url;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(full).then(function() {
      showCopy();
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = full; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta); showCopy();
  }
}

function showCopy() {
  var t = document.getElementById('copyToast');
  if (!t) return;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2000);
}

// ── SETTINGS TOGGLE LABEL ────────────────
document.querySelectorAll('.toggle-label input').forEach(function(input) {
  function update() {
    var lbl = input.parentElement.querySelector('span:last-child');
    if (!lbl) return;
  }
  input.addEventListener('change', update);
  update();
});

// ── CONFIRM DELETES ──────────────────────
document.querySelectorAll('form').forEach(function(form) {
  if (form.action && form.action.includes('/delete/')) {
    form.addEventListener('submit', function(e) {
      if (!confirm('Yakin ingin menghapus? Tindakan ini tidak dapat dibatalkan.')) {
        e.preventDefault();
      }
    });
  }
});
