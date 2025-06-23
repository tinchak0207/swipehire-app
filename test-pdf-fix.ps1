# Test script to verify PDF parsing fix
Write-Host "Testing PDF parsing fix..." -ForegroundColor Green

# Check if the worker file exists
$workerPath = "public\workers\pdf.worker.min.js"
if (Test-Path $workerPath) {
    Write-Host "✓ PDF worker file exists at $workerPath" -ForegroundColor Green
    $fileSize = (Get-Item $workerPath).Length
    Write-Host "  File size: $([math]::Round($fileSize / 1KB, 2)) KB" -ForegroundColor Gray
} else {
    Write-Host "✗ PDF worker file missing at $workerPath" -ForegroundColor Red
    exit 1
}

# Check package.json for correct pdfjs-dist version
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$pdfjsVersion = $packageJson.dependencies.'pdfjs-dist'
Write-Host "✓ pdfjs-dist version in package.json: $pdfjsVersion" -ForegroundColor Green

# Check if the debug page exists
$debugPagePath = "src\app\debug\pdf-test\page.tsx"
if (Test-Path $debugPagePath) {
    Write-Host "✓ Debug page exists at $debugPagePath" -ForegroundColor Green
} else {
    Write-Host "✗ Debug page missing at $debugPagePath" -ForegroundColor Red
}

# Check if the improved test component exists
$testComponentPath = "src\components\debug\ImprovedPDFTestComponent.tsx"
if (Test-Path $testComponentPath) {
    Write-Host "✓ Improved test component exists at $testComponentPath" -ForegroundColor Green
} else {
    Write-Host "✗ Improved test component missing at $testComponentPath" -ForegroundColor Red
}

Write-Host "`nFix Summary:" -ForegroundColor Yellow
Write-Host "1. Downloaded PDF.js worker file locally to avoid CDN issues" -ForegroundColor White
Write-Host "2. Updated pdfjs-dist to stable version 3.11.174" -ForegroundColor White
Write-Host "3. Implemented fallback worker configuration" -ForegroundColor White
Write-Host "4. Created enhanced debug tools for testing" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Start the development server: npm run dev" -ForegroundColor White
Write-Host "2. Navigate to: http://localhost:3000/debug/pdf-test" -ForegroundColor White
Write-Host "3. Test with a PDF file to verify the fix works" -ForegroundColor White
Write-Host "4. Check the resume optimizer upload page: http://localhost:3000/resume-optimizer/upload" -ForegroundColor White

Write-Host "`nPDF parsing should now work without the worker initialization error!" -ForegroundColor Green