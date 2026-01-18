# Poin Lunak - Quick Setup Script for Windows PowerShell
# Run this script from the poin-lunak directory

Write-Host "🍗 Poin Lunak - Automated Setup Script" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the poin-lunak directory" -ForegroundColor Red
    exit 1
}

# Step 1: Install Dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Setup Environment Variables
Write-Host "🔧 Step 2: Setting up environment variables..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists. Skipping..." -ForegroundColor Yellow
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env file with your database credentials!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to continue after editing .env file..." -ForegroundColor Yellow
    Read-Host
}
Write-Host ""

# Step 3: Run Prisma Migrations
Write-Host "🗄️  Step 3: Setting up database..." -ForegroundColor Cyan
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "Make sure your DATABASE_URL in .env is correct" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database migrations completed!" -ForegroundColor Green
Write-Host ""

# Step 4: Generate Prisma Client
Write-Host "⚙️  Step 4: Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated!" -ForegroundColor Green
Write-Host ""

# Step 5: Seed Database (Optional)
Write-Host "🌱 Step 5: Would you like to seed demo data?" -ForegroundColor Cyan
Write-Host "   This will create demo admin and member accounts" -ForegroundColor Gray
$seed = Read-Host "Seed database? (y/n)"
if ($seed -eq "y" -or $seed -eq "Y") {
    node prisma/seed.mjs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to seed database" -ForegroundColor Red
    } else {
        Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Demo Credentials:" -ForegroundColor Yellow
        Write-Host "   Admin:  admin@poinlunak.com / admin123" -ForegroundColor White
        Write-Host "   Member: member@poinlunak.com / member123" -ForegroundColor White
    }
}
Write-Host ""

# Step 6: All Done!
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development server, run:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - SETUP.md for detailed instructions" -ForegroundColor White
Write-Host "   - IMPLEMENTATION_SUMMARY.md for feature overview" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
