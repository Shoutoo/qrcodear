// Script inject langsung ke Neon PostgreSQL — generate UUID manual
// Jalankan: node inject-quiz-to-neon.js

const { Client } = require('pg');
const { randomUUID } = require('crypto');

const DATABASE_URL = 'postgresql://neondb_owner:npg_NFG76lzOXoHk@ep-billowing-butterfly-azh2lrq2.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const QUIZ_BANK = [
  { ecosystem: "umum", question: "Apa yang dimaksud dengan ekosistem?", options: ["Kumpulan makhluk hidup dan lingkungan yang saling berhubungan","Kumpulan hewan yang hidup di kebun binatang","Tempat tumbuhan disimpan","Kumpulan benda mati saja"], correctAnswer: "Kumpulan makhluk hidup dan lingkungan yang saling berhubungan" },
  { ecosystem: "umum", question: "Contoh komponen biotik dalam ekosistem adalah...", options: ["Batu","Air","Tumbuhan","Udara"], correctAnswer: "Tumbuhan" },
  { ecosystem: "umum", question: "Contoh komponen abiotik dalam ekosistem adalah...", options: ["Kucing","Cahaya matahari","Burung","Ikan"], correctAnswer: "Cahaya matahari" },
  { ecosystem: "umum", question: "Makhluk hidup yang dapat membuat makanannya sendiri disebut...", options: ["Konsumen","Produsen","Pengurai","Predator"], correctAnswer: "Produsen" },
  { ecosystem: "umum", question: "Hewan yang memakan hewan lain disebut juga...", options: ["Herbivora","Karnivora","Produsen","Pengurai"], correctAnswer: "Karnivora" },
  { ecosystem: "umum", question: "Hewan yang hanya memakan tumbuhan disebut...", options: ["Karnivora","Herbivora","Omnivora","Pengurai"], correctAnswer: "Herbivora" },
  { ecosystem: "umum", question: "Contoh hewan omnivora (pemakan segala) adalah...", options: ["Sapi","Singa","Ayam","Rumput"], correctAnswer: "Ayam" },
  { ecosystem: "umum", question: "Makhluk hidup yang bertugas menguraikan sisa makhluk hidup yang telah mati disebut...", options: ["Produsen","Konsumen","Pengurai","Predator"], correctAnswer: "Pengurai" },
  { ecosystem: "umum", question: "Contoh makhluk hidup pengurai adalah...", options: ["Jamur","Elang","Padi","Kucing"], correctAnswer: "Jamur" },
  { ecosystem: "umum", question: "Urutan makan dan dimakan antar makhluk hidup disebut...", options: ["Siklus air","Rantai makanan","Fotosintesis","Metamorfosis"], correctAnswer: "Rantai makanan" },
  { ecosystem: "umum", question: "Pada rantai makanan, posisi pertama biasanya ditempati oleh...", options: ["Konsumen tingkat 1","Produsen","Pengurai","Karnivora puncak"], correctAnswer: "Produsen" },
  { ecosystem: "hutan", question: "Ekosistem hutan biasanya memiliki ciri khas berupa...", options: ["Banyak pohon dan tumbuhan tinggi","Hanya berisi pasir","Tidak ada makhluk hidup","Selalu tertutup salju"], correctAnswer: "Banyak pohon dan tumbuhan tinggi" },
  { ecosystem: "hutan", question: "Berikut ini yang termasuk hewan yang biasa hidup di ekosistem hutan adalah...", options: ["Ikan hiu","Monyet","Ubur-ubur","Kepiting"], correctAnswer: "Monyet" },
  { ecosystem: "darat", question: "Hewan yang hidup di ekosistem darat bernapas menggunakan...", options: ["Insang","Paru-paru","Kulit saja","Tidak bernapas"], correctAnswer: "Paru-paru" },
  { ecosystem: "darat", question: "Contoh ekosistem darat adalah...", options: ["Terumbu karang","Padang rumput","Rawa laut","Sungai bawah tanah"], correctAnswer: "Padang rumput" },
  { ecosystem: "laut", question: "Hewan laut seperti ikan bernapas menggunakan...", options: ["Paru-paru","Insang","Kulit","Hidung"], correctAnswer: "Insang" },
  { ecosystem: "laut", question: "Tumbuhan yang menjadi produsen utama di ekosistem laut adalah...", options: ["Pohon kelapa","Rumput laut/fitoplankton","Pohon jati","Bambu"], correctAnswer: "Rumput laut/fitoplankton" },
  { ecosystem: "sawah", question: "Hewan yang sering menjadi hama di ekosistem sawah adalah...", options: ["Tikus","Gajah","Paus","Unta"], correctAnswer: "Tikus" },
  { ecosystem: "sawah", question: "Tanaman utama yang dibudidayakan di ekosistem sawah adalah...", options: ["Kelapa sawit","Padi","Jati","Kaktus"], correctAnswer: "Padi" },
  { ecosystem: "umum", question: "Jika populasi produsen (tumbuhan) berkurang drastis di suatu ekosistem, yang akan terjadi adalah...", options: ["Konsumen kekurangan makanan","Tidak berpengaruh apa-apa","Semua hewan menjadi lebih sehat","Ekosistem menjadi lebih seimbang"], correctAnswer: "Konsumen kekurangan makanan" },
];

const LESSON_TITLES = {
  umum: 'Kuis Ekosistem Umum',
  hutan: 'Kuis Ekosistem Hutan',
  darat: 'Kuis Ekosistem Darat',
  laut: 'Kuis Ekosistem Laut',
  sawah: 'Kuis Ekosistem Sawah',
};

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('✅ Terhubung ke Neon PostgreSQL');

  // Cek jumlah soal yang ada
  const countRes = await client.query('SELECT COUNT(*) as count FROM "Quiz"');
  const existingCount = parseInt(countRes.rows[0].count);
  console.log(`📊 Jumlah soal saat ini di Neon: ${existingCount}`);

  if (existingCount > 0) {
    console.log('ℹ️  DB sudah ada soal, tidak perlu seed ulang.');
    await client.end();
    return;
  }

  // Cek project yang ada
  let projectRes = await client.query('SELECT id FROM "Project" LIMIT 1');
  let projectId;

  if (projectRes.rows.length === 0) {
    // Cari user TEACHER
    let userRes = await client.query(`SELECT id FROM "User" WHERE role = 'TEACHER' LIMIT 1`);
    
    if (userRes.rows.length === 0) {
      userRes = await client.query('SELECT id FROM "User" LIMIT 1');
    }

    let creatorId;
    if (userRes.rows.length === 0) {
      // Buat user baru dengan UUID manual
      const userId = randomUUID();
      await client.query(
        `INSERT INTO "User" (id, name, email, password_hash, role, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, 'Guru EduAR System', 'system@eduar.internal', '$2b$10$placeholderHash', 'TEACHER']
      );
      creatorId = userId;
      console.log(`✅ Membuat user sistem: ${userId}`);
    } else {
      creatorId = userRes.rows[0].id;
    }

    projectId = randomUUID();
    await client.query(
      `INSERT INTO "Project" (id, title, description, "creatorId", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      [projectId, 'Proyek Ekosistem & Kuis SD', 'Proyek default untuk kuis interaktif ekosistem SD', creatorId]
    );
    console.log(`✅ Membuat project baru: ${projectId}`);
  } else {
    projectId = projectRes.rows[0].id;
    console.log(`ℹ️  Menggunakan project yang ada: ${projectId}`);
  }

  // Buat lessons per ekosistem
  const lessonMap = {};
  for (const [eco, title] of Object.entries(LESSON_TITLES)) {
    let lessonRes = await client.query(
      `SELECT id FROM "Lesson" WHERE title = $1 AND "projectId" = $2 LIMIT 1`,
      [title, projectId]
    );

    if (lessonRes.rows.length === 0) {
      const lessonId = randomUUID();
      await client.query(
        `INSERT INTO "Lesson" (id, title, content, "projectId") VALUES ($1, $2, $3, $4)`,
        [lessonId, title, `Kuis Interaktif Ekosistem ${eco} untuk Siswa SD`, projectId]
      );
      console.log(`✅ Membuat lesson: ${title} → ${lessonId}`);
      lessonMap[eco] = lessonId;
    } else {
      lessonMap[eco] = lessonRes.rows[0].id;
      console.log(`ℹ️  Lesson sudah ada: ${title}`);
    }
  }

  // Insert semua soal
  let seeded = 0;
  for (const item of QUIZ_BANK) {
    const quizId = randomUUID();
    const lessonId = lessonMap[item.ecosystem] || lessonMap['umum'];
    await client.query(
      `INSERT INTO "Quiz" (id, "lessonId", question, options, "correctAnswer") VALUES ($1, $2, $3, $4, $5)`,
      [quizId, lessonId, item.question.trim(), JSON.stringify(item.options), item.correctAnswer.trim()]
    );
    seeded++;
    process.stdout.write(`\r  → ${seeded}/${QUIZ_BANK.length} soal ter-insert...`);
  }

  console.log(`\n\n✅ SELESAI! ${seeded} soal berhasil di-inject ke Neon PostgreSQL!`);

  // Verifikasi akhir
  const verifyRes = await client.query('SELECT COUNT(*) as count FROM "Quiz"');
  console.log(`📊 Verifikasi total soal di Neon: ${verifyRes.rows[0].count}`);
  
  // Sample check
  const sampleRes = await client.query('SELECT id, question FROM "Quiz" LIMIT 3');
  console.log('\n📝 Sample soal yang ter-insert:');
  sampleRes.rows.forEach((r, i) => console.log(`  ${i+1}. ${r.question.substring(0, 60)}...`));

  await client.end();
  console.log('\n✅ Koneksi ditutup. Refresh dashboard untuk melihat soal!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
