# 🍗 Poin Lunak - Sistem Membership Restoran

**Sistem Loyalty/Membership berbasis website untuk "Ayam Goreng Tulang Lunak Holis Surya Sumantri"**

---

## 📋 Latar Belakang

Proyek ini bertujuan untuk mengganti sistem **diskon manual yang tidak terkontrol** menjadi **sistem loyalitas berbasis poin yang terukur**. Pelanggan dapat mengumpulkan poin setiap melakukan transaksi dan menukarkannya menjadi voucher, sehingga promosi menjadi lebih efektif tanpa merusak margin keuntungan bisnis.

### Masalah yang Diselesaikan:
- ❌ Diskon manual tidak terkontrol dan sulit dilacak
- ❌ Tidak ada data loyalitas pelanggan
- ❌ Promosi tidak terukur

### Solusi:
- ✅ Sistem poin otomatis berdasarkan transaksi
- ✅ Dashboard admin untuk kontrol penuh
- ✅ Penukaran voucher secara mandiri oleh member
- ✅ Data transaksi dan poin yang transparan

---

## 👥 Tim Pengembang

**Kelompok 04 - Proyek Rekayasa Perangkat Lunak**

| NIM | Nama |
|-----|------|
| 2372055 | Bryant Marvel Lim |
| 2372061 | Laura Puspa Ameliana |
| 2372068 | Indri Mahalani Simamora |

**Universitas Kristen Maranatha - Semester 5**

---

## ✨ Fitur Utama

### 👤 Fitur Member
- Melihat saldo poin di dashboard
- Riwayat transaksi dengan detail tanggal dan jumlah
- Katalog reward/voucher yang tersedia
- Penukaran poin ke voucher dengan QR code
- Notifikasi real-time untuk setiap aksi

### 🛠️ Fitur Admin
- Dashboard statistik dengan grafik:
  - Bar chart transaksi per hari
  - Line chart aktivitas poin (issued vs redeemed)
- Input transaksi member dan hitung poin otomatis
- Manajemen pengguna (CRUD)
- Pengaturan rasio konversi poin
- Manajemen reward/voucher
- Validasi penggunaan voucher member

### 🎯 Logika Bisnis
- **Perhitungan Poin**: Poin = Total Transaksi ÷ Rasio (default: Rp 1.000 = 1 Poin)
- **Kode Voucher Unik**: Format `VOUCHER-XXXXXXXX`
- **Masa Berlaku Voucher**: Dapat diatur per item reward
- **Rate Limiting**: Proteksi 5 request/menit untuk penukaran

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript 5 |
| UI Library | React 19 |
| Database | MySQL 8.0 |
| ORM | Prisma 6.17.1 |
| Styling | Tailwind CSS 4 |
| Auth | JWT (jose) + bcryptjs |
| Validasi | Zod |
| Charts | Recharts |
| QR Code | react-qr-code |
| Container | Docker |

---

## 🚀 Cara Menjalankan

### Prerequisites
- **Node.js** 18.x atau lebih baru
- **npm** atau **yarn**
- **MySQL 8.0** (lokal atau via Docker)

---

### 🐳 Option 1: Menggunakan Docker (Recommended)

#### A. Development Mode (Database Docker, App Lokal)

```bash
# 1. Clone repository
git clone <repository-url>
cd PoinLunak/poin-lunak

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Jalankan MySQL via Docker
docker-compose -f docker-compose.dev.yml up -d

# 5. Tunggu ~30 detik, lalu jalankan migrasi
npx prisma migrate deploy

# 6. (Optional) Seed data demo
npm run prisma:seed

# 7. Jalankan aplikasi
npm run dev
```

#### B. Full Docker (Semua dalam Container)

```bash
# Build dan jalankan semua service
docker-compose up -d

# Jalankan migrasi
docker-compose run --rm migrate

# (Optional) Seed data - jalankan dari LUAR container
# Karena seed butuh bcryptjs yang tidak ada di production image
DATABASE_URL="mysql://poinlunak:poinlunak123@localhost:3307/poin_lunak" npm run prisma:seed
```

> ⚠️ **Catatan**: Untuk seed di Full Docker, jalankan dari terminal lokal (bukan dari dalam container) karena production image tidak menyertakan devDependencies.

---

### 💻 Option 2: Tanpa Docker (MySQL Lokal)

#### Jika menggunakan XAMPP/Laragon/MySQL lokal:

**Step 1: Buat Database**
```sql
CREATE DATABASE poin_lunak;
CREATE USER 'poinlunak'@'localhost' IDENTIFIED BY 'poinlunak123';
GRANT ALL PRIVILEGES ON poin_lunak.* TO 'poinlunak'@'localhost';
FLUSH PRIVILEGES;
```

Atau pakai user `root`:
```sql
CREATE DATABASE poin_lunak;
```

**Step 2: Setup Project**
```bash
# Clone repository
git clone <repository-url>
cd PoinLunak/poin-lunak

# Install dependencies
npm install

# Copy dan edit environment file
cp .env.example .env
```

**Step 3: Edit `.env`**
```env
# Jika pakai user root tanpa password (XAMPP default)
DATABASE_URL="mysql://root:@localhost:3306/poin_lunak"

# Jika pakai user root dengan password
DATABASE_URL="mysql://root:password@localhost:3306/poin_lunak"

# Jika pakai user custom
DATABASE_URL="mysql://poinlunak:poinlunak123@localhost:3306/poin_lunak"

JWT_SECRET="your-secret-key-minimal-32-karakter"
```

**Step 4: Jalankan**
```bash
# Migrasi database
npx prisma migrate deploy

# (Optional) Seed data demo
npm run prisma:seed

# Jalankan aplikasi
npm run dev
```

---

### 🌐 Akses Aplikasi

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🧪 Akun Demo (Setelah Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin1@poinlunak.com | admin123 |
| Admin | admin2@poinlunak.com | admin123 |
| Member | budi@example.com | member123 |
| Member | siti@example.com | member123 |

> Lihat `prisma/seed.mjs` untuk daftar lengkap 20+ member

---

## 📋 Perintah Berguna

### Development
```bash
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm run start        # Jalankan production server
npm run lint         # Cek linting
```

### Database
```bash
npx prisma studio           # Buka GUI database
npx prisma migrate dev      # Buat migrasi baru (development)
npx prisma migrate deploy   # Deploy migrasi (production)
npx prisma migrate reset    # Reset database
npm run prisma:seed         # Seed data demo
```

### Docker
```bash
# Development (MySQL only)
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down

# Full Docker
docker-compose up -d
docker-compose down
docker-compose down -v    # Hapus data volume
```

---

## 📁 Struktur Project

```
PoinLunak/
├── poin-lunak/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Halaman admin
│   │   │   ├── dashboard/      # Dashboard statistik
│   │   │   ├── users/          # Manajemen user
│   │   │   ├── transactions/   # Manajemen transaksi
│   │   │   └── rewards/        # Manajemen voucher
│   │   ├── member/             # Halaman member
│   │   │   └── dashboard/      # Dashboard member
│   │   ├── api/                # API Routes
│   │   ├── login/              # Halaman login
│   │   └── register/           # Halaman registrasi
│   ├── components/             # Komponen UI
│   │   ├── ui/                 # Button, Card, Input, dll
│   │   ├── navbar.tsx          # Navigasi
│   │   └── voucher-card.tsx    # Kartu voucher dengan QR
│   ├── lib/                    # Utilities
│   │   ├── auth.ts             # Autentikasi JWT
│   │   ├── prisma.ts           # Prisma client
│   │   ├── validations.ts      # Zod schemas
│   │   └── utils.ts            # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── seed.mjs            # Seeder
│   │   └── migrations/         # File migrasi
│   ├── docker-compose.yml      # Full Docker
│   ├── docker-compose.dev.yml  # Docker dev (MySQL only)
│   ├── Dockerfile              # Docker image app
│   └── .env.example            # Template environment
├── db_PoinLunak.mwb            # MySQL Workbench diagram
├── PROGRESS.md                 # Log progress mingguan
└── README.md                   # File ini
```

---

## 🔒 Fitur Keamanan

- ✅ JWT authentication dengan HTTP-only cookies (7 hari expiry)
- ✅ Password hashing dengan bcryptjs (10 salt rounds)
- ✅ Input validation dengan Zod schemas di semua API
- ✅ Role-based access control via middleware
- ✅ Rate limiting pada endpoint sensitif
- ✅ SQL injection prevention via Prisma parameterized queries
- ✅ XSS protection via React automatic escaping

---

## 🔧 Troubleshooting

### Error: Can't reach database server
- Pastikan MySQL sudah jalan: `docker ps` atau cek XAMPP/Laragon
- Tunggu ~30 detik setelah start container untuk MySQL ready

### Error: Port 3306 already in use
- Jika sudah ada MySQL lokal, gunakan `docker-compose.dev.yml` dengan port 3307
- Atau matikan MySQL lokal dulu

### Error: Access denied for user
- Cek kembali username dan password di `.env`
- Pastikan user sudah dibuat di MySQL dengan privilege yang benar

### Reset Database (mulai dari awal)
```bash
# Dengan Docker
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
npx prisma migrate deploy
npm run prisma:seed

# Dengan Prisma
npx prisma migrate reset
```

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan akademik sebagai bagian dari mata kuliah Rekayasa Perangkat Lunak di Universitas Kristen Maranatha.

---

## 🙏 Ucapan Terima Kasih

- **Ayam Goreng Tulang Lunak Holis Surya Sumantri** - Sponsor proyek
- **Universitas Kristen Maranatha** - Institusi akademik
- **Next.js Team** - Framework development
- **Vercel** - Hosting platform
