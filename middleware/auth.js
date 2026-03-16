// ─────────────────────────────────────────
// HUD — Auth Middleware
// ─────────────────────────────────────────

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/admin/login');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin');
  }
  next();
}

module.exports = { requireAuth, redirectIfAuth };
