// ─────────────────────────────────────────
// HUD — Admin Routes
// ─────────────────────────────────────────
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const { requireAuth, redirectIfAuth } = require('../middleware/auth');
const { articles, contacts, settings } = require('../data/database');
const content = require('../data/content');

// ── FILE UPLOAD ──────────────────────────
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = slugify(path.basename(file.originalname, ext), { lower: true });
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp/.test(file.mimetype);
    cb(ok ? null : new Error('Only images allowed'), ok);
  }
});

// ── HELPER ───────────────────────────────
const adminData = (extra = {}) => ({
  layout: 'admin',
  siteSettings: settings.get('site').value(),
  ...extra,
});

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('admin/login', { layout: 'admin-bare', title: 'Login — HUD Admin', error: req.query.error });
});

router.post('/login', redirectIfAuth, async (req, res) => {
  const { username, password } = req.body;
  const admin = settings.get('admin').value();

  const validUser = username === admin.username;
  const validPass = await bcrypt.compare(password, admin.password);

  if (validUser && validPass) {
    req.session.isAdmin = true;
    req.session.username = username;
    const returnTo = req.session.returnTo || '/admin';
    delete req.session.returnTo;
    return res.redirect(returnTo);
  }
  res.redirect('/admin/login?error=1');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────
router.get('/', requireAuth, (req, res) => {
  const allArticles = articles.get('articles').value();
  const allContacts = contacts.get('submissions').value();
  const unread = allContacts.filter(c => !c.read).length;

  res.render('admin/dashboard', adminData({
    title: 'Dashboard — HUD Admin',
    stats: {
      articles: allArticles.length,
      works: content.works.length,
      contacts: allContacts.length,
      unread,
    },
    recentArticles: allArticles.slice(-5).reverse(),
    recentContacts: allContacts.slice(-5).reverse(),
  }));
});

// ─────────────────────────────────────────
// ARTICLES
// ─────────────────────────────────────────
router.get('/articles', requireAuth, (req, res) => {
  const all = articles.get('articles').value().slice().reverse();
  res.render('admin/articles', adminData({ title: 'Artikel — HUD Admin', articles: all }));
});

router.get('/articles/new', requireAuth, (req, res) => {
  res.render('admin/article-form', adminData({ title: 'Artikel Baru — HUD Admin', isNew: true }));
});

router.post('/articles/new', requireAuth, upload.single('image'), (req, res) => {
  const { titleId, titleEn, titleAr, titleZh, bodyId, bodyEn, bodyAr, bodyZh, category, tags, published } = req.body;
  const slug = slugify(titleId || titleEn, { lower: true, strict: true });
  const id = `${slug}-${Date.now()}`;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '');

  articles.get('articles').push({
    id,
    slug,
    titleId: titleId || '',
    titleEn: titleEn || '',
    titleAr: titleAr || '',
    titleZh: titleZh || '',
    bodyId: bodyId || '',
    bodyEn: bodyEn || '',
    bodyAr: bodyAr || '',
    bodyZh: bodyZh || '',
    category: category || 'Berita',
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    image: imageUrl,
    published: published === 'on',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).write();

  res.redirect('/admin/articles');
});

router.get('/articles/edit/:id', requireAuth, (req, res) => {
  const article = articles.get('articles').find({ id: req.params.id }).value();
  if (!article) return res.redirect('/admin/articles');
  res.render('admin/article-form', adminData({ title: 'Edit Artikel — HUD Admin', article, isNew: false }));
});

router.post('/articles/edit/:id', requireAuth, upload.single('image'), (req, res) => {
  const { titleId, titleEn, titleAr, titleZh, bodyId, bodyEn, bodyAr, bodyZh, category, tags, published } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '');

  articles.get('articles').find({ id: req.params.id }).assign({
    titleId, titleEn, titleAr, titleZh,
    bodyId, bodyEn, bodyAr, bodyZh,
    category: category || 'Berita',
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    image: imageUrl,
    published: published === 'on',
    updatedAt: new Date().toISOString(),
  }).write();

  res.redirect('/admin/articles');
});

router.post('/articles/delete/:id', requireAuth, (req, res) => {
  articles.get('articles').remove({ id: req.params.id }).write();
  res.redirect('/admin/articles');
});

// ─────────────────────────────────────────
// CONTACTS / BRIEFS
// ─────────────────────────────────────────
router.get('/contacts', requireAuth, (req, res) => {
  const all = contacts.get('submissions').value().slice().reverse();
  // Mark all as read
  const subs = contacts.get('submissions').value();
  subs.forEach(c => { c.read = true; });
  contacts._write();
  res.render('admin/contacts', adminData({ title: 'Brief Masuk — HUD Admin', submissions: all }));
});

router.post('/contacts/delete/:id', requireAuth, (req, res) => {
  contacts.get('submissions').remove({ id: req.params.id }).write();
  res.redirect('/admin/contacts');
});

// ─────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────
router.get('/settings', requireAuth, (req, res) => {
  res.render('admin/settings', adminData({ title: 'Pengaturan — HUD Admin' }));
});

router.post('/settings/site', requireAuth, (req, res) => {
  const { announcement, whatsapp, instagram, youtube, email, openForBrief } = req.body;
  settings.set('site', {
    announcement: announcement || '',
    whatsapp: whatsapp || '',
    instagram: instagram || '',
    youtube: youtube || '',
    email: email || '',
    openForBrief: openForBrief === 'on',
  }).write();
  res.redirect('/admin/settings?saved=1');
});

router.post('/settings/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const admin = settings.get('admin').value();
  const valid = await bcrypt.compare(currentPassword, admin.password);

  if (!valid || newPassword !== confirmPassword || newPassword.length < 6) {
    return res.redirect('/admin/settings?error=password');
  }

  const hash = await bcrypt.hash(newPassword, 10);
  const adminData = settings.get('admin').value();
  settings.set('admin', { ...adminData, password: hash });
  res.redirect('/admin/settings?saved=1');
});

// ─────────────────────────────────────────
// MEDIA UPLOADS
// ─────────────────────────────────────────
router.get('/media', requireAuth, (req, res) => {
  const files = fs.existsSync(uploadDir)
    ? fs.readdirSync(uploadDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).map(f => ({
        name: f,
        url: `/uploads/${f}`,
        size: Math.round(fs.statSync(path.join(uploadDir, f)).size / 1024) + ' KB',
      }))
    : [];
  res.render('admin/media', adminData({ title: 'Media — HUD Admin', files }));
});

router.post('/media/upload', requireAuth, upload.array('files', 10), (req, res) => {
  res.redirect('/admin/media');
});

router.post('/media/delete', requireAuth, (req, res) => {
  const { filename } = req.body;
  const filePath = path.join(uploadDir, path.basename(filename));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.redirect('/admin/media');
});

module.exports = router;
