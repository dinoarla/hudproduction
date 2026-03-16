# HUD Production House
### Happiness Until Destination

Website resmi HUD Production House — production house berbasis di Pontianak, Kalimantan Barat.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Development (auto-reload)
npm run dev

# 3. Production
npm start
```

Buka: `http://localhost:3000`

---

## 📁 Struktur Project

```
hud-production/
├── server.js          # Entry point Express
├── package.json
├── data/
│   └── content.js     # ⭐ SEMUA KONTEN SITE — edit di sini
├── routes/
│   └── index.js       # URL routing
├── views/
│   ├── layouts/
│   │   └── main.hbs   # Layout utama (nav + footer)
│   ├── home.hbs        # Halaman beranda
│   ├── works.hbs       # Daftar karya
│   ├── work-detail.hbs # Detail karya
│   ├── about.hbs       # Tentang HUD
│   ├── contact.hbs     # Kontak + form
│   └── 404.hbs         # Error page
└── public/
    ├── css/main.css    # Semua styles
    └── js/main.js      # Client-side JS
```

---

## ✏️ Cara Update Konten

Semua konten ada di **`data/content.js`** — edit file ini untuk:
- Ganti info kontak (`meta.email`, `meta.whatsapp`, dll)
- Tambah/edit karya di `works[]`
- Ganti slide hero di `heroSlides[]`
- Update berita di `latestNews[]`
- Sesuaikan semua teks dalam 4 bahasa (id/en/ar/zh)

---

## 🌐 Deploy ke Hosting Node.js

### Option 1: VPS / cPanel Node.js

```bash
# Upload semua file KECUALI node_modules
# Di server:
npm install --production
npm start
```

Set environment variable: `PORT=3000` (atau port sesuai hosting)

### Option 2: Railway.app (Gratis)

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 3: Render.com (Gratis)

1. Push ke GitHub
2. Buat New Web Service di render.com
3. Connect repo → Build: `npm install` → Start: `npm start`

### Option 4: Heroku

```bash
heroku create hud-production
git push heroku main
```

### Option 5: Vercel (untuk Node.js)

Tambahkan `vercel.json`:
```json
{
  "version": 2,
  "builds": [{"src": "server.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "/server.js"}]
}
```

---

## 🔧 Environment Variables

Buat file `.env` di root:

```env
PORT=3000
NODE_ENV=production
```

---

## 📧 Setup Form Kontak

Di `routes/index.js`, bagian `router.post('/contact')`, tambahkan integrasi email:

### Dengan Nodemailer + Gmail:

```bash
npm install nodemailer
```

```js
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'email@gmail.com', pass: 'app-password' }
});

await transporter.sendMail({
  from: '"HUD Website" <email@gmail.com>',
  to: 'hello@hudproduction.id',
  subject: `Brief dari ${name} — ${division}`,
  html: `<p>Nama: ${name}</p><p>Email: ${email}</p><p>Pesan: ${message}</p>`
});
```

### Dengan Nodemailer + SMTP cPanel:

```js
const transporter = nodemailer.createTransport({
  host: 'mail.yourdomain.com',
  port: 465,
  secure: true,
  auth: { user: 'hello@hudproduction.id', pass: 'password' }
});
```

---

## 🖼️ Ganti Gambar Placeholder

Gambar sementara dari Unsplash. Untuk ganti dengan gambar asli:

1. Upload gambar ke folder `public/images/`
2. Update URL di `data/content.js`
3. Contoh: `image: '/images/nama-file.jpg'`

Ukuran yang disarankan:
- Hero slides: 1600×900px (16:9)
- Card thumbnails: 800×450px (16:9)
- Featured works: 900×600px
- Sidebar: 200×150px

---

## 📱 Fitur yang Sudah Ada

- ✅ 4 bahasa: Indonesia, English, العربية, 中文
- ✅ Auto RTL untuk Arab
- ✅ Hero carousel (autoplay + swipe + keyboard)
- ✅ Video playlist interaktif
- ✅ Responsive mobile/tablet/desktop
- ✅ 6 divisi konten lengkap
- ✅ Form kontak (perlu sambungkan email)
- ✅ SEO meta tags
- ✅ Halaman detail karya + related works
- ✅ 404 & error handling
- ✅ Compression & security headers

---

*HUD Production House · Pontianak, Kalimantan Barat · Happiness Until Destination*
