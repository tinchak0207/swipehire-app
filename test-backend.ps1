# PowerShell script to test backend functionality
Write-Host "Testing SwipeHire Backend..." -ForegroundColor Green

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    exit 1
}

# Check if backend directory exists
$backendPath = ".\swipehire-backend"
if (Test-Path $backendPath) {
    Write-Host "✅ Backend directory found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend directory not found" -ForegroundColor Red
    exit 1
}

# Check if package.json exists
$packageJsonPath = "$backendPath\package.json"
if (Test-Path $packageJsonPath) {
    Write-Host "✅ package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
$nodeModulesPath = "$backendPath\node_modules"
if (Test-Path $nodeModulesPath) {
    Write-Host "✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "⚠️ node_modules not found - run 'npm install' in backend directory" -ForegroundColor Yellow
}

# Test MongoDB connection
Write-Host "Testing MongoDB connection..." -ForegroundColor Yellow
try {
    Set-Location $backendPath
    $testResult = node -e "
        const mongoose = require('mongoose');
        const MONGO_URI = 'mongodb+srv://tinchak0207:cfchan%407117@swipehire.fwxspbu.mongodb.net/?retryWrites=true&w=majority&appName=swipehire';
        mongoose.connect(MONGO_URI).then(() => {
            console.log('MongoDB connection successful');
            mongoose.disconnect();
        }).catch(err => {
            console.error('MongoDB connection failed:', err.message);
            process.exit(1);
        });
    "
    Write-Host "✅ MongoDB connection test passed" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB connection test failed" -ForegroundColor Red
}

Set-Location ..
Write-Host "Backend test completed" -ForegroundColor Green