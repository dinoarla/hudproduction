const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const content = require('../data/content');
const { contacts } = require('../data/database');

// ── MAILER ───────────────────────────────
function createTransporter() {
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER) return null;
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT) || 465,
    secure: process.env.MAIL_SECURE === 'true',
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });
}

// ── PAGE DATA HELPER ─────────────────────
const pageData = (extra = {}) => ({
  ...content,
  ...extra,
  year: new Date().getFullYear(),
  siteUrl: process.env.SITE_URL || 'https://hudproduction.id',
  gaId: process.env.GA_ID || '',
});

// ── HOME ─────────────────────────────────
router.get('/', (req, res) => {
  res.render('home', { ...pageData({ title: 'HUD — Happiness Until Destination' }) });
});

// ── WORKS LIST ───────────────────────────
router.get('/works', (req, res) => {
  const division = req.query.div || 'all';
  const filteredWorks = division === 'all'
    ? content.works
    : content.works.filter(w => w.division === division);

  const labels = { all:'Semua Karya', film:'Film & Series', brand:'Brand Film', digital:'Digital Content', animasi:'Animasi', dok:'Dokumenter', podcast:'Cinematic Podcast' };

  res.render('works', {
    ...pageData({ title: `${labels[division] || 'Karya'} — HUD`, filteredWorks, activeDivision: division }),
  });
});

// ── WORK DETAIL ──────────────────────────
router.get('/works/:id', (req, res) => {
  const work = content.works.find(w => w.id === req.params.id);
  if (!work) return res.status(404).render('404', { ...pageData({ title: '404 — HUD' }) });
  const related = content.works.filter(w => w.division === work.division && w.id !== work.id).slice(0, 3);
  res.render('work-detail', { ...pageData({ title: `${work.titleId} — HUD`, work, related }) });
});

// ── ABOUT ────────────────────────────────
router.get('/about', (req, res) => {
  res.render('about', { ...pageData({ title: 'Tentang Kami — HUD Production House' }) });
});

// ── CONTACT GET ──────────────────────────
router.get('/contact', (req, res) => {
  res.render('contact', { ...pageData({ title: 'Kontak — HUD Production House' }) });
});

// ── CONTACT POST ─────────────────────────
router.post('/contact', async (req, res) => {
  const { name, email, division, budget, message } = req.body;
  if (!name || !email || !message) {
    return res.render('contact', { ...pageData({ title: 'Kontak — HUD', error: true }) });
  }

  console.log(`📩 Brief baru: ${name} <${email}> — ${division}`);

  // Save to database
  contacts.get('submissions').push({
    id: Date.now().toString(),
    name, email,
    division: division || '',
    budget: budget || '',
    message: message || '',
    read: false,
    createdAt: new Date().toISOString(),
  }).write();

  try {
    const transporter = createTransporter();
    if (transporter) {
      const mailTo = process.env.MAIL_TO || 'hello@hudproduction.id';
      // To HUD team
      await transporter.sendMail({
        from: `"HUD Website" <${process.env.MAIL_USER}>`,
        to: mailTo,
        subject: `📽️ Brief Baru: ${division} dari ${name}`,
        html: `<div style="font-family:monospace;background:#0A0F0B;color:#D8F3DC;padding:32px;max-width:600px;">
          <h2 style="color:#52B788;letter-spacing:4px;font-weight:300;">HUD PRODUCTION HOUSE</h2>
          <h3 style="color:#D8F3DC;font-weight:300;margin-bottom:20px;">Brief baru masuk</h3>
          <p><b style="color:#52B788;">Nama:</b> ${name}</p>
          <p><b style="color:#52B788;">Email:</b> <a href="mailto:${email}" style="color:#52B788;">${email}</a></p>
          <p><b style="color:#52B788;">Divisi:</b> ${division || '-'}</p>
          <p><b style="color:#52B788;">Budget:</b> ${budget || '-'}</p>
          <hr style="border-color:#1B4332;margin:20px 0;">
          <p><b style="color:#52B788;">Pesan:</b></p>
          <p style="line-height:1.8;">${message.replace(/\n/g,'<br>')}</p>
          <hr style="border-color:#1B4332;margin:20px 0;">
          <p style="color:#52B788;font-size:11px;">Dikirim dari hudproduction.id · Happiness Until Destination</p>
        </div>`
      });
      // Auto-reply
      await transporter.sendMail({
        from: `"HUD Production House" <${process.env.MAIL_USER}>`,
        to: email,
        subject: `Terima kasih, ${name}! Pesan kamu sudah diterima HUD.`,
        html: `<div style="font-family:monospace;background:#0A0F0B;color:#D8F3DC;padding:32px;max-width:600px;">
          <h2 style="color:#52B788;letter-spacing:4px;font-weight:300;">HUD PRODUCTION HOUSE</h2>
          <p>Halo <b>${name}</b>,</p>
          <p style="line-height:1.8;margin:16px 0;">Terima kasih sudah menghubungi kami. Pesan kamu sudah kami terima dan tim HUD akan menghubungi kamu dalam 1–2 hari kerja.</p>
          <p style="color:#52B788;font-style:italic;margin:24px 0;">"Happiness Until Destination."</p>
          <hr style="border-color:#1B4332;margin:20px 0;">
          <p style="color:#52B788;font-size:11px;">HUD Production House · Pontianak, Kalimantan Barat<br>hello@hudproduction.id · @hudproduction</p>
        </div>`
      });
    }
  } catch (err) {
    console.error('Mail error:', err.message);
  }

  res.render('contact', { ...pageData({ title: 'Kontak — HUD', success: true, successName: name }) });
});

// ── SITEMAP ──────────────────────────────
router.get('/sitemap.xml', (req, res) => {
  const base = process.env.SITE_URL || 'https://hudproduction.id';
  const today = new Date().toISOString().split('T')[0];
  const pages = [
    { path: '', prio: '1.0', freq: 'weekly' },
    { path: '/works', prio: '0.9', freq: 'weekly' },
    { path: '/about', prio: '0.8', freq: 'monthly' },
    { path: '/contact', prio: '0.7', freq: 'monthly' },
    ...content.works.map(w => ({ path: `/works/${w.id}`, prio: '0.7', freq: 'monthly' })),
  ];
  const urls = pages.map(p => `  <url><loc>${base}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.prio}</priority></url>`).join('\n');
  res.set('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
});

// ── ROBOTS ───────────────────────────────
router.get('/robots.txt', (req, res) => {
  const base = process.env.SITE_URL || 'https://hudproduction.id';
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml`);
});

// ── API: LANG COOKIE ─────────────────────
router.post('/api/lang', (req, res) => {
  const { lang } = req.body;
  if (!['id','en','ar','zh'].includes(lang)) return res.status(400).json({ success: false });
  res.cookie('hud_lang', lang, { maxAge: 365*24*60*60*1000, httpOnly: false, sameSite: 'lax' });
  res.json({ success: true, lang });
});

// ── API: HEALTH ───────────────────────────
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'HUD Production House', time: new Date().toISOString() });
});

module.exports = router;
