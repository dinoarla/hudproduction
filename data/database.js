// ─────────────────────────────────────────
// HUD — Database (JSON file-based via lowdb)
// Semua data tersimpan di data/db/*.json
// ─────────────────────────────────────────
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

function getDb(name, defaults) {
  const adapter = new FileSync(path.join(dbDir, `${name}.json`));
  const db = low(adapter);
  db.defaults(defaults).write();
  return db;
}

// ── ARTICLES DB ──────────────────────────
const articles = getDb('articles', {
  articles: []
});

// ── CONTACTS DB ──────────────────────────
const contacts = getDb('contacts', {
  submissions: []
});

// ── SETTINGS DB ──────────────────────────
const settings = getDb('settings', {
  admin: {
    username: 'admin',
    // Default password: hud2025 (change immediately!)
    password: '$2a$10$xQ7jR9u.kJfVfvNkB5D1COqYRqVt3pZ9y1A2kL8mNpX0sWdHgEcRy'
  },
  site: {
    announcement: 'Selamat datang di HUD Production House — Happiness Until Destination',
    whatsapp: '+6281234567890',
    instagram: '@hudproduction',
    youtube: 'HUD Production House',
    email: 'hello@hudproduction.id',
    openForBrief: true,
  }
});

module.exports = { articles, contacts, settings };
