# PoinLunak - Aplikasi Loyalty Points

Aplikasi manajemen poin loyalitas berbasis Next.js dengan Prisma dan MySQL.

## Prerequisites

Sebelum menjalankan aplikasi, pastikan sudah terinstall:

- **Node.js** v18 atau lebih baru
- **npm** atau **yarn** atau **pnpm**
- **Docker & Docker Compose** (untuk database MySQL)

## 🚀 Cara Menjalankan (Quick Start)

### Option 1: Development Mode (Recommended untuk Development)

**Step 1: Clone dan Install Dependencies**
```bash
git clone <repository-url>
cd PoinLunak/poin-lunak
npm install
```

**Step 2: Jalankan Database MySQL via Docker**
```bash
docker-compose -f docker-compose.dev.yml up -d
```
> Ini akan menjalankan MySQL di port 3306

**Step 3: Setup Environment Variables**

Buat file `.env` di folder `poin-lunak`:
```env
DATABASE_URL="mysql://poinlunak:poinlunak123@localhost:3306/poin_lunak"
JWT_SECRET="your-secret-key-ganti-ini"
```

**Step 4: Jalankan Migrasi Database**
```bash
npx prisma migrate deploy
```

**Step 5: (Optional) Seed Database dengan Data Awal**
```bash
npm run prisma:seed
```

**Step 6: Jalankan Aplikasi**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

### Option 2: Full Docker (Semua via Docker)

Jalankan semua service (Database + App) dalam Docker:

```bash
# Build dan jalankan semua container
docker-compose up -d

# Jalankan migrasi
docker-compose run --rm migrate
```

Aplikasi akan jalan di [http://localhost:3000](http://localhost:3000)

---

## 📋 Perintah Berguna

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npx prisma studio` | Buka Prisma Studio (GUI database) |
| `npx prisma migrate dev` | Buat dan jalankan migrasi baru |
| `npx prisma migrate deploy` | Deploy migrasi ke database |
| `npm run prisma:seed` | Seed database dengan data awal |

## 🐳 Docker Commands

| Perintah | Deskripsi |
|----------|-----------|
| `docker-compose -f docker-compose.dev.yml up -d` | Start MySQL only (dev) |
| `docker-compose -f docker-compose.dev.yml down` | Stop MySQL (dev) |
| `docker-compose up -d` | Start semua (MySQL + App) |
| `docker-compose down` | Stop semua |
| `docker-compose down -v` | Stop dan hapus data volume |

## 🔧 Troubleshooting

### Error: Can't reach database server
- Pastikan Docker sudah jalan: `docker ps`
- Pastikan container MySQL sudah running
- Tunggu ~30 detik setelah start container untuk MySQL siap

### Error: Port 3306 already in use
- Jika sudah ada MySQL lokal, gunakan port 3307:
  - Ubah `docker-compose.dev.yml` port ke `"3307:3306"`
  - Ubah DATABASE_URL ke `mysql://poinlunak:poinlunak123@localhost:3307/poin_lunak`

### Reset Database
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
npx prisma migrate deploy
npm run prisma:seed
```

## 📁 Struktur Project

```
poin-lunak/
├── app/                 # Next.js App Router
│   ├── admin/          # Halaman admin
│   ├── member/         # Halaman member
│   ├── api/            # API Routes
│   └── login/          # Halaman login
├── components/          # React components
├── lib/                 # Utility functions
├── prisma/              # Database schema & migrations
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Migration files
│   └── seed.mjs        # Database seeder
└── public/              # Static files
```

## 👤 Default Accounts (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin1@poinlunak.com | admin123 |
| Admin | admin2@poinlunak.com | admin123 |
| Member | budi@example.com | member123 |

> Lihat `prisma/seed.mjs` untuk daftar lengkap akun member

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com)
