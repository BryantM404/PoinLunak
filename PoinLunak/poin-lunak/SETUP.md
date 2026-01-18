# Poin Lunak - Setup & Development Guide

## 🚀 Production-Ready Features Implemented

### ✅ 1. CODE OPTIMIZATION & REFACTORING
- **Server Components**: All data fetching moved to Server Components
- **Type Safety**: Complete TypeScript interfaces matching Prisma schema
- **Error Handling**: Robust try/catch blocks with standardized JSON responses
- **Security**: JWT authentication with HTTP-only cookies, role-based middleware

### ✅ 2. LOGIC HARDENING
- **Point Calculation**: `Points = Transaction Amount / 1000` (floored)
- **Voucher Integrity**: Unique code generation with DB verification (max 10 attempts)
- **Validation**: Zod validation for all API inputs
- **Point Deduction Check**: Cannot redeem if `current_points < reward_cost`

### ✅ 3. FEATURE EXPANSION

#### A. Enhanced Admin Dashboard
- **📊 Charts**: Recharts integration showing:
  - Transactions per day (Bar Chart)
  - Points issued vs redeemed (Line Chart)
- **⚙️ Manual Point Adjustment**: Admin can add/subtract points with reason logging

#### B. Voucher Experience
- **🎫 QR Code Display**: Using `react-qr-code` for easy cashier scanning
- **📋 Copy to Clipboard**: One-click code copying
- **✨ Beautiful UI**: Color-coded voucher status (Available/Used)

#### C. User Feedback
- **🔔 Toast Notifications**: Using `sonner` for:
  - Green: Success (Login, Redeem, etc.)
  - Red: Errors
  - Positioned top-right, 3s duration

#### D. Rate Limiting
- **🛡️ Protection**: In-memory rate limiter on `/api/rewards/redeem`
- **Limits**: 5 redemptions per minute per user
- **Response**: 429 status with reset time headers

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MySQL 8+
- npm or yarn

### Step 1: Clone & Install Dependencies

```powershell
cd poin-lunak
npm install
```

### Step 2: Setup Database

1. Create MySQL database:
```sql
CREATE DATABASE poin_lunak CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Copy environment variables:
```powershell
Copy-Item .env.example .env
```

3. Edit `.env` with your database credentials:
```
DATABASE_URL="mysql://root:yourpassword@localhost:3306/poin_lunak"
JWT_SECRET="generate-a-random-secure-string-here"
```

### Step 3: Run Prisma Migrations

```powershell
npx prisma migrate dev
npx prisma generate
```

### Step 4: Seed Initial Data (Optional)

Create demo admin and member accounts:

```powershell
# You can create these manually through the register page, or via Prisma Studio:
npx prisma studio
```

**Suggested Demo Accounts:**
- **Admin**: 
  - Email: `admin@poinlunak.com`
  - Password: `admin123`
  - Role: `ADMIN`

- **Member**: 
  - Email: `member@poinlunak.com`
  - Password: `member123`
  - Role: `MEMBER`

### Step 5: Run Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
poin-lunak/
├── app/
│   ├── api/
│   │   ├── auth/               # Login, Register, Logout
│   │   ├── transactions/       # Transaction CRUD
│   │   ├── rewards/            # Redeem & Catalog
│   │   ├── admin/              # Admin Stats & Point Adjustment
│   │   └── users/              # User Management
│   ├── admin/
│   │   └── dashboard/          # Admin Dashboard with Charts
│   ├── member/
│   │   └── dashboard/          # Member Dashboard with Vouchers
│   ├── login/
│   ├── register/
│   └── page.tsx                # Landing Page
├── components/
│   ├── ui/                     # Reusable UI Components
│   ├── voucher-card.tsx        # QR Code Voucher Display
│   └── toast-provider.tsx      # Toast Notifications
├── lib/
│   ├── auth.ts                 # JWT & bcrypt utilities
│   ├── prisma.ts               # Prisma singleton
│   ├── rate-limit.ts           # Rate limiting logic
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # Business logic utilities
│   └── validations.ts          # Zod schemas
├── middleware.ts               # Auth & Route Protection
└── prisma/
    └── schema.prisma           # Database schema
```

---

## 🎯 Key Features

### Authentication & Authorization
- JWT-based auth with HTTP-only cookies
- Role-based access control (ADMIN / MEMBER)
- Middleware protects routes automatically
- Auto-redirect based on user role

### Business Logic
- **Point Calculation**: Automatic on transaction creation
- **Membership Levels**: Bronze (0), Silver (5000), Gold (10000)
- **Voucher System**: Unique code generation with QR display
- **Activity Logs**: All important actions logged to `membership_logs`

### Admin Dashboard
- Real-time statistics (Users, Transactions, Points)
- Interactive charts (Recharts)
- Manual point adjustment with reason tracking
- User management capabilities

### Member Dashboard
- Current points & membership level display
- Transaction history
- Voucher redemption with QR code
- One-click voucher code copying

---

## 🔐 Security Features

1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **JWT Tokens**: 7-day expiry, HTTP-only cookies
3. **Input Validation**: Zod schemas on all API endpoints
4. **Rate Limiting**: Prevents spam redemptions
5. **Role-Based Access**: Middleware prevents unauthorized access
6. **SQL Injection Protection**: Prisma ORM parameterized queries

---

## 🎨 Design System

**Theme Colors:**
- Primary Gold: `#DDBA72`
- Primary Brown: `#6B3E1D`
- Success: Green
- Error: Red

**Components:**
- All UI components use the theme colors
- Consistent spacing and border radius
- Responsive design (mobile-first)

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Transactions
- `POST /api/transactions` - Create transaction & award points
- `GET /api/transactions?userId=X` - Get user transactions

### Rewards
- `GET /api/rewards/catalog` - Get available rewards
- `POST /api/rewards/redeem` - Redeem reward (Rate Limited)
- `GET /api/rewards/redeem?userId=X` - Get user's vouchers

### Admin
- `GET /api/admin/stats` - Dashboard statistics & charts data
- `POST /api/admin/points/adjust` - Manual point adjustment

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users?id=X` - Get specific user

---

## 🧪 Testing

### Manual Testing Checklist

1. **Registration Flow**
   - ✅ Create new member account
   - ✅ Verify auto-login after registration
   - ✅ Check initial 0 points

2. **Transaction Flow**
   - ✅ Create transaction (via Prisma Studio or admin panel)
   - ✅ Verify point calculation (amount / 1000)
   - ✅ Check membership level upgrade

3. **Redemption Flow**
   - ✅ Redeem reward with sufficient points
   - ✅ Verify point deduction
   - ✅ Generate QR code
   - ✅ Copy voucher code
   - ✅ Test rate limiting (try 6+ rapid clicks)

4. **Admin Flow**
   - ✅ View dashboard charts
   - ✅ Adjust user points manually
   - ✅ View transaction logs

---

## 🚀 Production Deployment

### Before Deploying:

1. **Update Environment Variables**:
   - Set strong `JWT_SECRET`
   - Update `DATABASE_URL` with production DB
   - Set `NODE_ENV=production`

2. **Build & Test**:
```powershell
npm run build
npm run start
```

3. **Database Migration**:
```powershell
npx prisma migrate deploy
```

### Recommended Platforms:
- **Frontend**: Vercel, Netlify
- **Database**: PlanetScale, Railway, AWS RDS
- **Full Stack**: Railway, Render, Fly.io

---

## 📚 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MySQL + Prisma ORM
- **Authentication**: JWT (jose) + bcryptjs
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **QR Codes**: react-qr-code
- **Notifications**: Sonner
- **State Management**: React Hooks + Server Components

---

## 👥 Development Team

- **2372055** - Bryant Marvel Lim
- **2372061** - Laura Puspa Ameliana  
- **2372068** - Indri Mahalani Simamora

**Universitas Kristen Maranatha** - Rekayasa Perangkat Lunak

---

## 📞 Support

For issues or questions, please contact the development team or create an issue in the repository.

---

## ⚠️ Important Notes

1. **First Run**: Must run `npx prisma migrate dev` before starting
2. **JWT Secret**: Change in production for security
3. **Rate Limit**: Uses in-memory store (resets on server restart). Use Redis for production.
4. **Demo Data**: Create admin account manually via Prisma Studio or register page

---

**Made with ❤️ for Ayam Goreng Tulang Lunak Holis Surya Sumantri**
