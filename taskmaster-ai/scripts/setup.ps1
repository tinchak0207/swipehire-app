# Taskmaster AI Setup Script
# PowerShell script to initialize Taskmaster AI in the project

Write-Host "🤖 Setting up Taskmaster AI..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if Node.js and npm are available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Check if TypeScript is available
try {
    $tsVersion = npx tsc --version
    Write-Host "✅ TypeScript version: $tsVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  TypeScript not found. Installing..." -ForegroundColor Yellow
    npm install -g typescript
}

# Verify taskmaster-ai directory structure
$taskmasterPath = "taskmaster-ai"
if (Test-Path $taskmasterPath) {
    Write-Host "✅ Taskmaster AI directory found" -ForegroundColor Green
} else {
    Write-Host "❌ Taskmaster AI directory not found" -ForegroundColor Red
    exit 1
}

# Check required files
$requiredFiles = @(
    "taskmaster-ai/config/taskmaster.config.ts",
    "taskmaster-ai/generators/PromptGenerator.ts",
    "taskmaster-ai/validators/CodeValidator.ts",
    "taskmaster-ai/cli/taskmaster.ts",
    "taskmaster-ai/index.ts"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        exit 1
    }
}

# Test CLI functionality
Write-Host "`n🧪 Testing CLI functionality..." -ForegroundColor Cyan
try {
    npx tsx taskmaster-ai/cli/taskmaster.ts --help | Out-Null
    Write-Host "✅ CLI is working correctly" -ForegroundColor Green
} catch {
    Write-Host "❌ CLI test failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Create example usage script
$exampleScript = @"
# Example Taskmaster AI Usage

# Generate component prompt
npx tsx taskmaster-ai/cli/taskmaster.ts -t component -n Button -d "Reusable button component"

# Generate page prompt
npx tsx taskmaster-ai/cli/taskmaster.ts -t page -n Dashboard -d "User dashboard page"

# Interactive mode
npx tsx taskmaster-ai/cli/taskmaster.ts --interactive

# View configuration
npx tsx taskmaster-ai/cli/taskmaster.ts --config
"@

$exampleScript | Out-File -FilePath "taskmaster-ai/examples.ps1" -Encoding UTF8

Write-Host "`n✨ Taskmaster AI setup complete!" -ForegroundColor Green
Write-Host "📖 See taskmaster-ai/README.md for usage instructions" -ForegroundColor Cyan
Write-Host "🚀 Run 'npx tsx taskmaster-ai/cli/taskmaster.ts --help' to get started" -ForegroundColor Cyan
Write-Host "📝 Example commands saved to taskmaster-ai/examples.ps1" -ForegroundColor Cyan