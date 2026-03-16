// ─────────────────────────────────────────
// HUD — Database (pure Node.js, tanpa lowdb)
// Pakai fs + JSON biasa, 100% compatible semua hosting
// ─────────────────────────────────────────
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

function loadDb(name, defaults) {
  const file = path.join(dbDir, name + '.json');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaults, null, 2));
    return JSON.parse(JSON.stringify(defaults));
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch(e) {
    return JSON.parse(JSON.stringify(defaults));
  }
}

function saveDb(name, data) {
  const file = path.join(dbDir, name + '.json');
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function createDb(name, defaults) {
  let data = loadDb(name, defaults);

  const db = {
    get: function(key) {
      return {
        value: function() { return data[key]; },

        find: function(query) {
          return {
            value: function() {
              const arr = data[key] || [];
              return arr.find(function(item) {
                return Object.keys(query).every(function(k) { return item[k] === query[k]; });
              });
            },
            assign: function(updates) {
              return {
                write: function() {
                  const arr = data[key] || [];
                  const idx = arr.findIndex(function(item) {
                    return Object.keys(query).every(function(k) { return item[k] === query[k]; });
                  });
                  if (idx !== -1) Object.assign(arr[idx], updates);
                  data[key] = arr;
                  saveDb(name, data);
                }
              };
            }
          };
        },

        push: function(item) {
          return {
            write: function() {
              if (!data[key]) data[key] = [];
              data[key].push(item);
              saveDb(name, data);
            }
          };
        },

        remove: function(query) {
          return {
            write: function() {
              data[key] = (data[key] || []).filter(function(item) {
                return !Object.keys(query).every(function(k) { return item[k] === query[k]; });
              });
              saveDb(name, data);
            }
          };
        },

        each: function(fn) {
          return {
            write: function() {
              (data[key] || []).forEach(fn);
              saveDb(name, data);
            }
          };
        }
      };
    },

    set: function(key, value) {
      data[key] = value;
      return {
        write: function() { saveDb(name, data); }
      };
    }
  };

  return db;
}

// ── ARTICLES DB ──────────────────────────
const articles = createDb('articles', { articles: [] });

// ── CONTACTS DB ──────────────────────────
const contacts = createDb('contacts', { submissions: [] });

// ── SETTINGS DB ──────────────────────────
// Default password: hud2025
const settings = createDb('settings', {
  admin: {
    username: 'admin',
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
