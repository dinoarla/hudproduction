require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const routes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blog');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
      connectSrc: ["'self'", "https://www.google-analytics.com"],
    },
  },
}));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'hud-happiness-until-destination-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,
    gt: (a, b) => a > b,
    json: (ctx) => JSON.stringify(ctx),
    truncate: (str, len) => str && str.length > len ? str.slice(0, len) + '...' : (str || ''),
    formatDate: (iso) => {
      if (!iso) return '';
      return new Date(iso).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
    },
    formatDateShort: (iso) => {
      if (!iso) return '';
      return new Date(iso).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
    },
    inc: (n) => parseInt(n) + 1,
    or: (a, b) => a || b,
    and: (a, b) => a && b,
    not: (a) => !a,
    articleBody: (text) => {
      if (!text) return '';
      const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return escaped.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    },
    ifCond: function(v1, op, v2, opts) {
      const ops = { '==': v1==v2, '===': v1===v2, '!=': v1!=v2, '>': v1>v2, '<': v1<v2 };
      return (ops[op] ? opts.fn : opts.inverse)(this);
    },
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.isAdmin = !!(req.session && req.session.isAdmin);
  res.locals.adminUser = (req.session && req.session.username) || '';
  next();
});

app.use('/', routes);
app.use('/admin', adminRoutes);
app.use('/blog', blogRoutes);
app.use('/artikel', blogRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 — HUD Production House',
    ...require('./data/content'),
    year: new Date().getFullYear(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: 'Server Error — HUD',
    ...require('./data/content'),
    year: new Date().getFullYear(),
  });
});

app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║  HUD Production House                ║`);
  console.log(`  ║  Happiness Until Destination         ║`);
  console.log(`  ╠══════════════════════════════════════╣`);
  console.log(`  ║  http://localhost:${PORT}                 ║`);
  console.log(`  ║  Admin  → /admin/login               ║`);
  console.log(`  ║  Blog   → /blog                      ║`);
  console.log(`  ║  Health → /api/health                ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});

module.exports = app;