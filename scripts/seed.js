require('dotenv').config();
const bcrypt = require('bcryptjs');
const { settings, articles } = require('../data/database');

async function seed() {
  console.log('\n  HUD Production House — Seeding Database\n');

  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASS || 'hud2025';
  const hash = await bcrypt.hash(password, 10);

  settings.set('admin', { username, password: hash }).write();
  console.log('  ✓ Admin account: ' + username + ' / ' + password);

  const existingSite = settings.get('site').value();
  if (!existingSite || !existingSite.email) {
    settings.set('site', {
      announcement: 'Selamat datang di HUD Production House — Happiness Until Destination',
      whatsapp: '+6281234567890',
      instagram: '@hudproduction',
      youtube: 'HUD Production House',
      email: 'hello@hudproduction.id',
      openForBrief: true,
    }).write();
    console.log('  ✓ Site settings initialized');
  }

  const existingArticles = articles.get('articles').value();
  if (!existingArticles || existingArticles.length === 0) {
    articles.get('articles').push({
      id: 'welcome-' + Date.now(),
      slug: 'selamat-datang-di-hud',
      titleId: 'Selamat Datang di HUD Production House',
      titleEn: 'Welcome to HUD Production House',
      titleAr: 'مرحباً بكم في HUD',
      titleZh: '欢迎来到HUD制片公司',
      bodyId: 'HUD Production House resmi hadir untuk membawa cerita-cerita terbaik dari Pontianak ke layar nasional dan internasional.\n\nNama kami, HUD, adalah singkatan dari Happiness Until Destination — sebuah filosofi kerja yang kami pegang erat sejak hari pertama.',
      bodyEn: 'HUD Production House is officially here to bring the best stories from Pontianak to national and international screens.\n\nOur name, HUD, stands for Happiness Until Destination.',
      bodyAr: 'HUD Production House يطل رسمياً لتقديم أفضل القصص من بونتياناك إلى الشاشات الوطنية والدولية.',
      bodyZh: 'HUD制片公司正式成立，致力于将坤甸最好的故事带到国内外银幕上。',
      category: 'Berita',
      tags: ['HUD', 'Pontianak'],
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&q=80',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).write();
    console.log('  ✓ Sample article created');
  }

  console.log('\n  Selesai! Jalankan: npm start');
  console.log('  Admin: http://localhost:3000/admin\n');
}

seed().catch(console.error);
