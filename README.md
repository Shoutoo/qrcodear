# AR Edu QR 🎯

> Generator QR Code untuk Konten Augmented Reality 3D — upload model 3D, dapatkan QR code, scan dan lihat AR langsung di browser.

## 🚀 Cara Menjalankan

### Metode 1: Double-click (Windows)
```
Klik 2x pada file: start.bat
```

### Metode 2: Terminal
```bash
cd server
npm install   # hanya pertama kali
node index.js
```

Lalu buka browser ke: **http://localhost:3001**

---

## 📖 Cara Pakai

1. **Upload** — drag & drop file `.glb`, `.gltf`, atau `.usdz` ke area upload
2. **Isi nama** model (opsional, akan diisi otomatis dari nama file)
3. **Klik "Generate QR Code"** — QR langsung muncul
4. **Bagikan QR** — cetak atau tampilkan di layar
5. **Scan** dengan kamera HP → browser terbuka → model 3D tampil dalam **AR**!

---

## 📱 Akses dari HP (dalam jaringan WiFi yang sama)

Saat server berjalan, lihat IP lokal Anda (tampil di `start.bat`) dan buka dari HP:
```
http://192.168.x.x:3001
```
QR code yang dihasilkan akan otomatis menggunakan IP ini agar bisa dipindai dari HP.

> **Tip**: Untuk akses dari luar jaringan, gunakan [ngrok](https://ngrok.com): `ngrok http 3001`

---

## 🗂️ Format File yang Didukung

| Format | Deskripsi | Kompatibilitas |
|--------|-----------|----------------|
| `.glb` | Binary glTF — format utama | Android, iOS, Desktop |
| `.gltf` | glTF + file terpisah | Android, iOS, Desktop |
| `.usdz` | Universal Scene Description | iOS (AR Quick Look) |

Ukuran maksimal: **50 MB**

---

## 🏗️ Struktur Project

```
qrcodear/
├── start.bat          # Windows launcher
├── package.json
├── client/
│   └── index.html     # Frontend SPA (upload, gallery, QR display)
└── server/
    ├── index.js        # Express server
    ├── package.json
    ├── uploads/        # File 3D & QR tersimpan di sini
    ├── data/
    │   └── assets.json # Metadata aset
    └── views/
        └── ar-viewer.html  # Template AR viewer
```

---

## ⚙️ Tech Stack

- **Backend**: Node.js + Express + Multer + nanoid
- **QR Generator**: `qrcode` npm package  
- **AR Viewer**: Google [`<model-viewer>`](https://modelviewer.dev/) — mendukung WebXR & AR Quick Look
- **Frontend**: HTML/CSS/JS (vanilla, no framework)

---

## 🔗 API Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| `POST` | `/api/upload` | Upload file 3D + generate QR |
| `GET` | `/api/assets` | List semua aset |
| `GET` | `/api/assets/:id/qr` | Get QR data untuk aset tertentu |
| `DELETE` | `/api/assets/:id` | Hapus aset |
| `GET` | `/ar/:id` | Halaman AR Viewer |

---

*Dibuat sesuai PRD: AR Edu QR v1.0 — Agustus 2026*
