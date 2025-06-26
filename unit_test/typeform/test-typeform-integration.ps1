# Test script to verify the typeform integration
Write-Host "Testing Market Salary Typeform Integration..." -ForegroundColor Green

# Check if the new component file exists
$componentPath = "src\components\pages\MarketSalaryTypeformPage.tsx"
if (Test-Path $componentPath) {
    Write-Host "✓ MarketSalaryTypeformPage.tsx exists" -ForegroundColor Green
} else {
    Write-Host "✗ MarketSalaryTypeformPage.tsx not found" -ForegroundColor Red
}

# Check if the main page.tsx has been updated
$mainPagePath = "src\app\page.tsx"
if (Test-Path $mainPagePath) {
    $content = Get-Content $mainPagePath -Raw
    if ($content -match "MarketSalaryTypeformPage") {
        Write-Host "✓ page.tsx updated to use MarketSalaryTypeformPage" -ForegroundColor Green
    } else {
        Write-Host "✗ page.tsx not updated" -ForegroundColor Red
    }
    
    if ($content -match "salaryEnquiry.*currentUserRole") {
        Write-Host "✓ Props correctly passed to salaryEnquiry component" -ForegroundColor Green
    } else {
        Write-Host "✗ Props not correctly configured" -ForegroundColor Red
    }
} else {
    Write-Host "✗ page.tsx not found" -ForegroundColor Red
}

# Check if TypeformSalaryQuery component exists
$typeformPath = "src\components\TypeformSalaryQuery.tsx"
if (Test-Path $typeformPath) {
    Write-Host "✓ TypeformSalaryQuery.tsx exists" -ForegroundColor Green
} else {
    Write-Host "✗ TypeformSalaryQuery.tsx not found" -ForegroundColor Red
}

Write-Host "`nIntegration Summary:" -ForegroundColor Yellow
Write-Host "- Users click 'Market Salary...' in sidebar" -ForegroundColor White
Write-Host "- They see the typeform-styled multi-step form" -ForegroundColor White
Write-Host "- After completing form, they see results in enquiry page format" -ForegroundColor White
Write-Host "- Sidebar remains visible throughout the process" -ForegroundColor White
Write-Host "- Users can start a new search from the results page" -ForegroundColor White

Write-Host "`nTo test the implementation:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "2. Navigate to the application in your browser" -ForegroundColor White
Write-Host "3. Click on 'Market Salary Inquiry' in the sidebar" -ForegroundColor White
Write-Host "4. Complete the typeform-styled questionnaire" -ForegroundColor White
Write-Host "5. Verify the results page displays with analysis" -ForegroundColor White