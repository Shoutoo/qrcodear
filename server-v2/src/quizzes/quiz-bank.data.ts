// Bank Soal Kuis Ekosistem SD — Embedded Data
// Dikompilasi langsung ke dist, tidak bergantung path file JSON di Render

export interface QuizBankItem {
  ecosystem: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export const QUIZ_BANK: QuizBankItem[] = [
  {
    "ecosystem": "umum",
    "question": "Apa yang dimaksud dengan ekosistem?",
    "options": [
      "Kumpulan makhluk hidup dan lingkungan yang saling berhubungan",
      "Kumpulan hewan yang hidup di kebun binatang",
      "Tempat tumbuhan disimpan",
      "Kumpulan benda mati saja"
    ],
    "correctAnswer": "Kumpulan makhluk hidup dan lingkungan yang saling berhubungan"
  },
  {
    "ecosystem": "umum",
    "question": "Contoh komponen biotik dalam ekosistem adalah...",
    "options": ["Batu", "Air", "Tumbuhan", "Udara"],
    "correctAnswer": "Tumbuhan"
  },
  {
    "ecosystem": "umum",
    "question": "Contoh komponen abiotik dalam ekosistem adalah...",
    "options": ["Kucing", "Cahaya matahari", "Burung", "Ikan"],
    "correctAnswer": "Cahaya matahari"
  },
  {
    "ecosystem": "umum",
    "question": "Makhluk hidup yang dapat membuat makanannya sendiri disebut...",
    "options": ["Konsumen", "Produsen", "Pengurai", "Predator"],
    "correctAnswer": "Produsen"
  },
  {
    "ecosystem": "umum",
    "question": "Hewan yang memakan hewan lain disebut juga...",
    "options": ["Herbivora", "Karnivora", "Produsen", "Pengurai"],
    "correctAnswer": "Karnivora"
  },
  {
    "ecosystem": "umum",
    "question": "Hewan yang hanya memakan tumbuhan disebut...",
    "options": ["Karnivora", "Herbivora", "Omnivora", "Pengurai"],
    "correctAnswer": "Herbivora"
  },
  {
    "ecosystem": "umum",
    "question": "Contoh hewan omnivora (pemakan segala) adalah...",
    "options": ["Sapi", "Singa", "Ayam", "Rumput"],
    "correctAnswer": "Ayam"
  },
  {
    "ecosystem": "umum",
    "question": "Makhluk hidup yang bertugas menguraikan sisa makhluk hidup yang telah mati disebut...",
    "options": ["Produsen", "Konsumen", "Pengurai", "Predator"],
    "correctAnswer": "Pengurai"
  },
  {
    "ecosystem": "umum",
    "question": "Contoh makhluk hidup pengurai adalah...",
    "options": ["Jamur", "Elang", "Padi", "Kucing"],
    "correctAnswer": "Jamur"
  },
  {
    "ecosystem": "umum",
    "question": "Urutan makan dan dimakan antar makhluk hidup disebut...",
    "options": ["Siklus air", "Rantai makanan", "Fotosintesis", "Metamorfosis"],
    "correctAnswer": "Rantai makanan"
  },
  {
    "ecosystem": "umum",
    "question": "Pada rantai makanan, posisi pertama biasanya ditempati oleh...",
    "options": ["Konsumen tingkat 1", "Produsen", "Pengurai", "Karnivora puncak"],
    "correctAnswer": "Produsen"
  },
  {
    "ecosystem": "hutan",
    "question": "Ekosistem hutan biasanya memiliki ciri khas berupa...",
    "options": [
      "Banyak pohon dan tumbuhan tinggi",
      "Hanya berisi pasir",
      "Tidak ada makhluk hidup",
      "Selalu tertutup salju"
    ],
    "correctAnswer": "Banyak pohon dan tumbuhan tinggi"
  },
  {
    "ecosystem": "hutan",
    "question": "Berikut ini yang termasuk hewan yang biasa hidup di ekosistem hutan adalah...",
    "options": ["Ikan hiu", "Monyet", "Ubur-ubur", "Kepiting"],
    "correctAnswer": "Monyet"
  },
  {
    "ecosystem": "darat",
    "question": "Hewan yang hidup di ekosistem darat bernapas menggunakan...",
    "options": ["Insang", "Paru-paru", "Kulit saja", "Tidak bernapas"],
    "correctAnswer": "Paru-paru"
  },
  {
    "ecosystem": "darat",
    "question": "Contoh ekosistem darat adalah...",
    "options": ["Terumbu karang", "Padang rumput", "Rawa laut", "Sungai bawah tanah"],
    "correctAnswer": "Padang rumput"
  },
  {
    "ecosystem": "laut",
    "question": "Hewan laut seperti ikan bernapas menggunakan...",
    "options": ["Paru-paru", "Insang", "Kulit", "Hidung"],
    "correctAnswer": "Insang"
  },
  {
    "ecosystem": "laut",
    "question": "Tumbuhan yang menjadi produsen utama di ekosistem laut adalah...",
    "options": ["Pohon kelapa", "Rumput laut/fitoplankton", "Pohon jati", "Bambu"],
    "correctAnswer": "Rumput laut/fitoplankton"
  },
  {
    "ecosystem": "sawah",
    "question": "Hewan yang sering menjadi hama di ekosistem sawah adalah...",
    "options": ["Tikus", "Gajah", "Paus", "Unta"],
    "correctAnswer": "Tikus"
  },
  {
    "ecosystem": "sawah",
    "question": "Tanaman utama yang dibudidayakan di ekosistem sawah adalah...",
    "options": ["Kelapa sawit", "Padi", "Jati", "Kaktus"],
    "correctAnswer": "Padi"
  },
  {
    "ecosystem": "umum",
    "question": "Jika populasi produsen (tumbuhan) berkurang drastis di suatu ekosistem, yang akan terjadi adalah...",
    "options": [
      "Konsumen kekurangan makanan",
      "Tidak berpengaruh apa-apa",
      "Semua hewan menjadi lebih sehat",
      "Ekosistem menjadi lebih seimbang"
    ],
    "correctAnswer": "Konsumen kekurangan makanan"
  }
];

export const LESSON_TITLE_MAP: Record<string, string> = {
  umum: 'Kuis & Materi Ekosistem Umum',
  hutan: 'Kuis & Materi Ekosistem Hutan',
  darat: 'Kuis & Materi Ekosistem Darat',
  laut: 'Kuis & Materi Ekosistem Laut',
  sawah: 'Kuis & Materi Ekosistem Sawah',
};

export const LESSON_CONTENT_MAP: Record<string, string> = {
  umum: `Ekosistem adalah kumpulan makhluk hidup dan lingkungan tempat tinggalnya yang saling berhubungan dan berinteraksi secara seimbang.

Di dalam ekosistem terdapat dua komponen utama:
1. Komponen Biotik (Makhluk Hidup): Tumbuhan, hewan, manusia, jamur, dan bakteri.
2. Komponen Abiotik (Benda Mati): Cahaya matahari, air, udara, tanah, dan batu.

Peran Makhluk Hidup dalam Rantai Makanan:
- Produsen: Makhluk hidup yang membuat makanannya sendiri melalui fotosintesis, seperti tumbuhan hijau.
- Konsumen: Makhluk hidup pemakan makhluk lain.
  * Herbivora: Pemakan tumbuhan (sapi, kelinci).
  * Karnivora: Pemakan daging/hewan lain (singa, elang).
  * Omnivora: Pemakan segala tumbuhan dan hewan (ayam, monyet).
- Pengurai (Dekomposer): Bertugas menguraikan sisa makhluk hidup mati menjadi zat hara tanah (jamur & bakteri).

Urutan makan dan dimakan disebut Rantai Makanan. Posisi pertama selalu ditempati oleh Produsen. Jika populasi produsen berkurang drastis, konsumen akan kekurangan makanan!`,

  hutan: `Ekosistem Hutan adalah kawasan daratan alami yang ditumbuhi banyak pohon tinggi dan lebat. Hutan merupakan paru-paru dunia yang menyimpan keanekaragaman hayati sangat tinggi.

Ciri Khas Ekosistem Hutan:
- Didominasi pepohonan tinggi, kanopi daun yang rindang, dan tanah yang subur.
- Tempat tinggal berbagai hewan seperti monyet, harimau, rusa, burung hantu, dan berbagai serangga.
- Menjaga cadangan air tanah dan mencegah banjir serta tanah longsor.`,

  darat: `Ekosistem Darat adalah ekosistem yang lingkungan fisiknya didominasi oleh daratan, seperti padang rumput, hutan, gurun, dan savana.

Sistem Pernapasan Hewan Darat:
- Hewan yang hidup di daratan (mamalia, burung, reptil) bernapas menggunakan paru-paru untuk mengambil oksigen langsung dari udara.
- Padang rumput merupakan salah satu contoh ekosistem darat tempat hidup hewan herbivora pemakan rumput.`,

  laut: `Ekosistem Laut adalah ekosistem perairan asin terluas di bumi.

Produsen & Pernapasan Laut:
- Produsen Utama: Rumput laut dan Fitoplankton (mikroorganisme tumbuhan) yang melakukan fotosintesis di permukaan laut.
- Sistem Pernapasan: Hewan laut seperti ikan bernapas menggunakan insang untuk menyaring oksigen yang terlarut di dalam air.`,

  sawah: `Ekosistem Sawah adalah ekosistem buatan manusia yang difungsikan untuk pertanian dan budidaya tanaman pangan.

Komponen & Rantai Makanan Sawah:
- Tanaman Utama: Padi sebagai produsen utama bahan pangan beras.
- Hama Sawah: Tikus dan belalang merupakan hewan konsumen pertama yang sering menjadi hama penyerang tanaman padi.
- Menjaga populasi pemangsa alami seperti ular sawah dan burung hantu sangat penting untuk mengendalikan populasi hama tikus.`
};

