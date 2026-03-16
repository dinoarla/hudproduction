// ─────────────────────────────────────────
// HUD — Blog / Artikel Routes (Public)
// ─────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { articles } = require('../data/database');
const content = require('../data/content');

const pageData = (extra = {}) => ({
  ...content,
  ...extra,
  year: new Date().getFullYear(),
  siteUrl: process.env.SITE_URL || 'https://hudproduction.id',
  gaId: process.env.GA_ID || '',
});

// ── ARTICLE LIST ─────────────────────────
router.get('/', (req, res) => {
  const category = req.query.cat || 'all';
  let all = articles.get('articles').value().filter(a => a.published).slice().reverse();

  if (category !== 'all') {
    all = all.filter(a => a.category === category);
  }

  const categories = [...new Set(
    articles.get('articles').value().filter(a => a.published).map(a => a.category)
  )];

  res.render('blog', pageData({
    title: 'Artikel & Berita — HUD Production House',
    articles: all,
    categories,
    activeCategory: category,
  }));
});

// ── SINGLE ARTICLE ───────────────────────
router.get('/:slug', (req, res) => {
  const article = articles.get('articles').find({ slug: req.params.slug, published: true }).value()
    || articles.get('articles').find({ id: req.params.slug, published: true }).value();

  if (!article) {
    return res.status(404).render('404', pageData({ title: '404 — HUD' }));
  }

  const related = articles.get('articles').value()
    .filter(a => a.published && a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  res.render('article', pageData({
    title: `${article.titleId || article.titleEn} — HUD`,
    article,
    related,
  }));
});

module.exports = router;
