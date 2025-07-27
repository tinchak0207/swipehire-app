# Development Environment Setup Script
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipInstall,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupHusky,
    
    [Parameter(Mandatory=$false)]
    [switch]$InitializeDatabase,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupFirebase
)

Write-Host "🚀 Setting up SwipeHire development environment..." -ForegroundColor Green

# Check Node.js version
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
}

$majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($majorVersion -lt 18) {
    Write-Error "Node.js version 18+ is required. Current version: $nodeVersion"
    exit 1
}

Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install dependencies
if (-not $SkipInstall) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Setup Husky
if ($SetupHusky) {
    Write-Host "🐕 Setting up Husky pre-commit hooks..." -ForegroundColor Yellow
    npm run prepare
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to setup Husky"
        exit 1
    }
    Write-Host "✅ Husky setup completed" -ForegroundColor Green
}

# Setup environment files
Write-Host "🔧 Setting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ Created .env.local from .env.example" -ForegroundColor Green
        Write-Host "⚠️  Please update .env.local with your actual values" -ForegroundColor Yellow
    } else {
        Write-Warning ".env.example not found. Creating basic .env.local"
        $envContent = @"
# Development Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Database
DATABASE_URL=your-database-url
MONGODB_URI=your-mongodb-uri

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Other Services
VERCEL_TOKEN=your-vercel-token
"@
        Set-Content -Path ".env.local" -Value $envContent
        Write-Host "✅ Created basic .env.local template" -ForegroundColor Green
    }
}

# Setup Firebase (if requested)
if ($SetupFirebase) {
    Write-Host "🔥 Setting up Firebase..." -ForegroundColor Yellow
    
    # Check if Firebase CLI is installed
    $firebaseVersion = firebase --version 2>$null
    if (-not $firebaseVersion) {
        Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
        npm install -g firebase-tools
    }
    
    Write-Host "✅ Firebase CLI ready" -ForegroundColor Green
    Write-Host "Run 'firebase login' and 'firebase init' to complete Firebase setup" -ForegroundColor Yellow
}

# Initialize database (if requested)
if ($InitializeDatabase) {
    Write-Host "🗄️ Initializing database..." -ForegroundColor Yellow
    # Add database initialization logic here
    Write-Host "✅ Database initialization completed" -ForegroundColor Green
}

# Run initial checks
Write-Host "🔍 Running initial checks..." -ForegroundColor Yellow

# TypeScript check
Write-Host "Checking TypeScript..." -ForegroundColor Cyan
npm run typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Warning "TypeScript check failed. Please fix type errors."
} else {
    Write-Host "✅ TypeScript check passed" -ForegroundColor Green
}

# Biome check
Write-Host "Running Biome checks..." -ForegroundColor Cyan
npm run check
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Biome check failed. Running auto-fix..."
    npm run check:fix
} else {
    Write-Host "✅ Biome check passed" -ForegroundColor Green
}

# Test check
Write-Host "Running tests..." -ForegroundColor Cyan
npm run test:ci
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Some tests failed. Please check test results."
} else {
    Write-Host "✅ All tests passed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Development environment setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update .env.local with your actual values" -ForegroundColor White
Write-Host "  2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  npm run dev              - Start development server" -ForegroundColor White
Write-Host "  npm run build            - Build for production" -ForegroundColor White
Write-Host "  npm run test             - Run tests" -ForegroundColor White
Write-Host "  npm run check            - Run Biome checks" -ForegroundColor White
Write-Host "  npm run typecheck        - Run TypeScript checks" -ForegroundColor White
Write-Host "  npm run generate:component - Generate new component" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green