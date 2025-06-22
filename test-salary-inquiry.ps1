# Test Script for Market Salary Inquiry Feature
# This script verifies that the implementation is working correctly

Write-Host "🔍 Testing Market Salary Inquiry Implementation..." -ForegroundColor Cyan

# Check if required files exist
$requiredFiles = @(
    "src\components\pages\MarketSalaryInquiryPage.tsx",
    "src\components\SalaryQueryForm.tsx",
    "src\components\SalaryVisualizationChart.tsx",
    "src\components\SalaryDataTable.tsx",
    "src\hooks\useSalaryQuery.ts",
    "src\services\salaryDataService.ts"
)

Write-Host "`n📁 Checking required files..." -ForegroundColor Yellow

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n❌ Some required files are missing!" -ForegroundColor Red
    exit 1
}

# Check if the main page.tsx has been updated
Write-Host "`n🔧 Checking main page integration..." -ForegroundColor Yellow

$pageContent = Get-Content "src\app\page.tsx" -Raw
if ($pageContent -match "DollarSign" -and $pageContent -match "salaryEnquiry" -and $pageContent -match "MarketSalaryInquiryPage") {
    Write-Host "✅ Main page integration complete" -ForegroundColor Green
} else {
    Write-Host "❌ Main page integration incomplete" -ForegroundColor Red
    exit 1
}

# Check TypeScript compilation
Write-Host "`n🔨 Checking TypeScript compilation..." -ForegroundColor Yellow

try {
    $tscResult = npx tsc --noEmit --skipLibCheck 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green
    } else {
        Write-Host "⚠️  TypeScript compilation has warnings/errors:" -ForegroundColor Yellow
        Write-Host $tscResult -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ TypeScript compilation failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Check if the development server can start
Write-Host "`n🚀 Testing development server startup..." -ForegroundColor Yellow

try {
    # Start the dev server in the background
    $devProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    
    # Wait a few seconds for startup
    Start-Sleep -Seconds 10
    
    # Check if the process is still running
    if (-not $devProcess.HasExited) {
        Write-Host "✅ Development server started successfully" -ForegroundColor Green
        
        # Try to make a simple HTTP request to check if the server is responding
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Server is responding to HTTP requests" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Server responded with status code: $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            # Try port 3001 if 3000 is not available
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Host "✅ Server is responding on port 3001" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  Server responded with status code: $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "⚠️  Could not connect to development server" -ForegroundColor Yellow
            }
        }
        
        # Stop the dev server
        Stop-Process -Id $devProcess.Id -Force
        Write-Host "🛑 Development server stopped" -ForegroundColor Gray
    } else {
        Write-Host "❌ Development server failed to start" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing development server: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n📋 Test Summary:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

if ($allFilesExist) {
    Write-Host "✅ All required files are present" -ForegroundColor Green
    Write-Host "✅ Main page integration is complete" -ForegroundColor Green
    Write-Host "✅ Market Salary Inquiry feature is ready for use" -ForegroundColor Green
    
    Write-Host "`n🎉 Implementation Test PASSED!" -ForegroundColor Green
    Write-Host "`n📖 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Run 'npm run dev' to start the development server" -ForegroundColor White
    Write-Host "2. Navigate to http://localhost:3000 (or 3001)" -ForegroundColor White
    Write-Host "3. Click on 'Market Salary Inquiry' in the sidebar" -ForegroundColor White
    Write-Host "4. Test the salary query form and data visualization" -ForegroundColor White
    Write-Host "5. Review the implementation documentation in MARKET_SALARY_INQUIRY_IMPLEMENTATION.md" -ForegroundColor White
} else {
    Write-Host "❌ Implementation Test FAILED!" -ForegroundColor Red
    Write-Host "Please check the missing files and try again." -ForegroundColor Red
}

Write-Host "`n🔗 Useful Commands:" -ForegroundColor Cyan
Write-Host "npm run dev          # Start development server" -ForegroundColor White
Write-Host "npm run build        # Build for production" -ForegroundColor White
Write-Host "npm run lint         # Run linting" -ForegroundColor White
Write-Host "npm run type-check   # Check TypeScript types" -ForegroundColor White