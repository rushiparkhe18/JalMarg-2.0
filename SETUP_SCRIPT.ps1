# Jalmarg 2.0 - Complete Setup Script for New Laptop
# Run this script in PowerShell

Write-Host "🚢 Jalmarg 2.0 - Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js NOT installed!" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm NOT installed!" -ForegroundColor Red
    exit 1
}

# Check Git
$gitVersion = git --version 2>$null
if ($gitVersion) {
    Write-Host "✅ Git installed: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Git NOT installed!" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Cloning repository..." -ForegroundColor Yellow
Write-Host ""

# Check if already cloned
if (Test-Path "JalMarg-2.0") {
    Write-Host "⚠️ JalMarg-2.0 folder already exists!" -ForegroundColor Yellow
    $continue = Read-Host "Do you want to continue? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
} else {
    git clone https://github.com/rushiparkhe18/JalMarg-2.0.git
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to clone repository!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Repository cloned successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Setting up backend environment..." -ForegroundColor Yellow
Write-Host ""

# Navigate to backend
cd JalMarg-2.0\backend

# Create .env file
$envContent = @"
MONGODB_URI=mongodb+srv://Jalmarg:jalmarg2@jalmarg2.pswqnxy.mongodb.net/?appName=JalMarg2
PORT=5000
NODE_ENV=development

# Weather API Configuration
WEATHER_API_BASE_URL=https://api.open-meteo.com/v1
MARINE_API_BASE_URL=https://marine-api.open-meteo.com/v1

# Land Detection API Configuration
RAPIDAPI_KEY=d6c5a31fdemshd90f3c3e93f8025p12f836jsn8f3c30788707
ISITWATER_API_URL=https://isitwater-com.p.rapidapi.com
ISITWATER_API_HOST=isitwater-com.p.rapidapi.com

# Grid Configuration - Complete Indian Ocean Coverage
GRID_RESOLUTION=1
GRID_LAT_MIN=-38.4
GRID_LAT_MAX=30.58
GRID_LON_MIN=22.15
GRID_LON_MAX=142.48
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✅ Backend .env file created!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Installing backend dependencies..." -ForegroundColor Yellow
Write-Host "(This may take 2-3 minutes)" -ForegroundColor Gray
Write-Host ""

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Installing frontend dependencies..." -ForegroundColor Yellow
Write-Host "(This may take 3-5 minutes)" -ForegroundColor Gray
Write-Host ""

cd ..\frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed!" -ForegroundColor Green

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "  cd JalMarg-2.0\backend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "  cd JalMarg-2.0\frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to start backend server..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

cd ..\backend
npm start
