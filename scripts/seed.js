require('dotenv').config();
const bcrypt = require('bcryptjs');
const { settings, articles } = require('../data/database');

async function seed() {
  console.log('\n  HUD Production House — Seeding Database\n');

  // ── CREATE ADMIN ──────────────────────
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASS || 'hud2025';
  const hash = await bcrypt.hash(password, 10);

  settings.set('admin', { username, password: hash }).write();
  console.log(`  ✓ Admin account created`);
  console.log(`    Username : ${username}`);
  console.log(`    Password : ${password}`);
  console.log(`    ⚠️  Segera ganti password setelah login pertama!\n`);

  // ── DEFAULT SITE SETTINGS ─────────────
  const existing = settings.get('site').value();
  if (!existing || !existing.email) {
    settings.set('site', {
      announcement: 'Selamat datang di HUD Production House — Happiness Until Destination ✦ Sekarang menerima proyek Brand Film & Web Series 2025',
      whatsapp: '+6281234567890',
      instagram: '@hudproduction',
      youtube: 'HUD Production House',
      email: 'hello@hudproduction.id',
      openForBrief: true,
    }).write();
    console.log('  ✓ Site settings initialized');
  }

  // ── SAMPLE ARTICLE ─────────────────────
  const existing_articles = articles.get('articles').value();
  if (existing_articles.length === 0) {
    articles.get('articles').push({
      id: 'welcome-hud-' + Date.now(),
      slug: 'selamat-datang-di-hud',
      titleId: 'Selamat Datang di HUD Production House',
      titleEn: 'Welcome to HUD Production House',
      titleAr: 'مرحباً بكم في HUD Production House',
      titleZh: '欢迎来到HUD制片公司',
      bodyId: 'HUD Production House resmi hadir untuk membawa cerita-cerita terbaik dari Pontianak dan Kalimantan Barat ke layar nasional dan internasional.\n\nNama kami, HUD, adalah singkatan dari Happiness Until Destination — sebuah filosofi kerja yang kami pegang erat sejak hari pertama. Kami tidak sedang bekerja. Kami sedang bermain, bersenang-senang, dan menciptakan sesuatu yang bermakna dalam setiap langkah perjalanan ini.\n\nTujuan akhir kami sederhana: wealthy di dunia, surga di akhirat. Dan kami percaya bahwa keduanya bisa dicapai lewat cerita yang jujur, karya yang bermakna, dan proses yang menyenangkan.\n\nMari bergabung dalam perjalanan ini.',
      bodyEn: 'HUD Production House is officially here to bring the best stories from Pontianak and West Kalimantan to national and international screens.\n\nOur name, HUD, stands for Happiness Until Destination — a work philosophy we have held close since day one. We are not working. We are playing, enjoying ourselves, and creating something meaningful with every step of this journey.\n\nOur ultimate goal is simple: wealth in this world, paradise in the next. And we believe both can be achieved through honest storytelling, meaningful work, and an enjoyable process.\n\nJoin us on this journey.',
      bodyAr: 'HUD Production House يطل رسمياً لتقديم أفضل القصص من بونتياناك وكاليمانتان الغربية إلى الشاشات الوطنية والدولية.\n\nاسمنا HUD هو اختصار لـ "Happiness Until Destination" — السعادة حتى الوصول — فلسفة عمل نتمسك بها منذ اليوم الأول.',
      bodyZh: 'HUD制片公司正式成立，致力于将坤甸和西加里曼丹最好的故事带到国内外银幕上。\n\n我们的名字HUD代表"Happiness Until Destination"（快乐直至终点）——这是我们从第一天起就坚守的工作理念。我们不是在工作，我们在玩耍、享受，并在旅途的每一步中创造有意义的事物。',
      category: 'Berita',
      tags: ['HUD', 'Pontianak', 'Production House'],
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&q=80',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).write();
    console.log('  ✓ Sample article created');
  }

  console.log('\n  ─────────────────────────────────────────');
  console.log('  Seeding selesai. Jalankan: npm start');
  console.log('  Admin panel: http://localhost:3000/admin');
  console.log('  ─────────────────────────────────────────\n');
}

seed().catch(console.error);
