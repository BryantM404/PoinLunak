# 🍗 Poin Lunak - Membership System

A production-ready membership and rewards system for **Ayam Goreng Tulang Lunak Holis Surya Sumantri** restaurant, built with Next.js 15, TypeScript, Prisma, and MySQL.

---

## 👥 Team

**Group 04 - Software Engineering Project**

- **Bryant Marvel Lim** (2372055)
- **Laura Puspa Ameliana** (2372061)
- **Indri Mahalani Simamora** (2372068)

**Universitas Kristen Maranatha - Semester 5**

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with HTTP-only cookies
- **Role-based access control** (ADMIN and MEMBER roles)
- **Password hashing** with bcryptjs
- **Route protection** via middleware

### 👤 Member Features
- **View dashboard** with points balance and membership level
- **Transaction history** with date and amount
- **Redeem rewards** from catalog with point deduction
- **QR code vouchers** for redeemed rewards
- **Copy voucher codes** to clipboard
- **Real-time toast notifications** for actions

### 🛠️ Admin Features
- **Statistics dashboard** with charts:
  - Bar chart for transactions per day
  - Line chart for points activity (issued vs redeemed)
- **Manual point adjustments** with reason logging
- **View all users** with membership levels
- **Monitor transactions** across all members

### 🎯 Business Logic
- **Point calculation**: Points = Transaction Amount ÷ 1000 (floored)
- **Membership levels**:
  - 🥉 **Bronze**: 0 - 4,999 points
  - 🥈 **Silver**: 5,000 - 9,999 points
  - 🥇 **Gold**: 10,000+ points
- **Automatic level upgrades** on point accumulation
- **Unique voucher code generation** (`POIN-XXXXXXXX`)
- **Rate limiting** on reward redemption (5 requests/minute)

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15** - App Router with Server Components
- **TypeScript 5** - Full type safety
- **React 19** - UI library

### Database & ORM
- **MySQL** - Relational database
- **Prisma 6.17.1** - Type-safe ORM

### Authentication & Security
- **jose** - JWT token management
- **bcryptjs** - Password hashing
- **Zod 3.22.4** - Input validation

### UI & Styling
- **Tailwind CSS 4** - Utility-first styling
- **Recharts 2.10.3** - Interactive charts
- **react-qr-code 2.0.12** - QR code generation
- **Sonner 1.3.1** - Toast notifications

### Utilities
- **clsx** - Conditional class names
- **tailwind-merge** - Class merging

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or yarn

### Automated Setup (Windows)
Run the PowerShell script to automate installation:

```powershell
.\setup.ps1
```

This will:
1. Install dependencies
2. Copy `.env.example` to `.env`
3. Run Prisma migrations
4. Generate Prisma Client
5. Optionally seed demo data

### Manual Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set:
DATABASE_URL="mysql://user:password@localhost:3306/poinlunak"
JWT_SECRET="your-secure-secret-key-min-32-characters"
```

3. **Run database migrations**:
```bash
npx prisma migrate dev
```

4. **Generate Prisma Client**:
```bash
npx prisma generate
```

5. **Seed demo data** (optional):
```bash
node prisma/seed.mjs
```

6. **Start development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Demo Credentials

After seeding, you can log in with:

**Admin Account**:
- Email: `admin@poinlunak.com`
- Password: `admin123`

**Member Account**:
- Email: `member@poinlunak.com`
- Password: `member123`

---

## 📂 Project Structure

```
poin-lunak/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── transactions/     # Transaction management
│   │   ├── rewards/          # Reward redemption
│   │   ├── admin/            # Admin-only endpoints
│   │   └── user/             # User management
│   ├── admin/                # Admin pages
│   │   └── dashboard/        # Admin dashboard
│   ├── member/               # Member pages
│   │   └── dashboard/        # Member dashboard
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   └── page.tsx              # Landing page
├── components/               # Reusable components
│   ├── ui/                   # UI components (button, card, input)
│   ├── voucher-card.tsx      # Voucher display with QR
│   └── toast-provider.tsx    # Toast notifications
├── lib/                      # Utilities & core logic
│   ├── auth.ts               # Authentication utilities
│   ├── prisma.ts             # Prisma client singleton
│   ├── rate-limit.ts         # Rate limiting logic
│   ├── types.ts              # TypeScript interfaces
│   ├── utils.ts              # Business logic & helpers
│   └── validations.ts        # Zod schemas
├── prisma/                   # Database schema & migrations
│   ├── schema.prisma         # Prisma schema
│   ├── seed.mjs              # Seed script
│   └── migrations/           # Migration files
├── middleware.ts             # Route protection middleware
└── .env.example              # Environment template
```

---

## 📖 Documentation

For detailed documentation, see:
- **[SETUP.md](./SETUP.md)** - Comprehensive setup guide with API documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Feature implementation checklist

---

## 🔒 Security Features

- ✅ **JWT authentication** with HTTP-only cookies (7-day expiry)
- ✅ **Password hashing** with bcryptjs (10 salt rounds)
- ✅ **Input validation** with Zod schemas on all API routes
- ✅ **Role-based access control** via middleware
- ✅ **Rate limiting** on sensitive endpoints
- ✅ **SQL injection prevention** via Prisma parameterized queries
- ✅ **XSS protection** via React's automatic escaping

---

## 📊 Database Schema

### Users
- `id`, `email`, `password`, `name`, `phone`, `role`, `points`, `membership_level`, `status`, `created_at`, `updated_at`

### Transactions
- `id`, `user_id`, `amount`, `points_earned`, `created_at`

### Rewards
- `id`, `user_id`, `reward_name`, `reward_points`, `voucher_code`, `is_used`, `redeemed_at`

### Membership Logs
- `id`, `user_id`, `action`, `points_before`, `points_after`, `description`, `created_at`

---

## 🧑‍💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Code Quality Standards

- ✅ **100% TypeScript** - No `any` types
- ✅ **Server Components** - Data fetching on server-side
- ✅ **Error handling** - Try/catch with standardized JSON responses
- ✅ **Type safety** - Prisma types + custom interfaces
- ✅ **Input validation** - Zod schemas on all APIs

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (`DATABASE_URL`, `JWT_SECRET`)
4. Deploy

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set environment variables in production
3. Run database migrations:
```bash
npx prisma migrate deploy
```

4. Start the server:
```bash
npm start
```

---

## 📝 License

This project is for academic purposes as part of the Software Engineering course at Universitas Kristen Maranatha.

---

## 🙏 Acknowledgments

- **Ayam Goreng Tulang Lunak Holis Surya Sumantri** - Project sponsor
- **Universitas Kristen Maranatha** - Academic institution
- **Next.js Team** - Framework development
- **Vercel** - Hosting platform
