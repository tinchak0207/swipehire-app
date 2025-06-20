# PowerShell script to test the server action fix
Write-Host "🔍 Testing Server Action Fix" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Gray

$testsPassed = 0
$totalTests = 0

function Test-Condition {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$SuccessMessage,
        [string]$FailureMessage
    )
    
    $script:totalTests++
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    
    if ($Condition) {
        Write-Host "✅ $SuccessMessage" -ForegroundColor Green
        $script:testsPassed++
    } else {
        Write-Host "❌ $FailureMessage" -ForegroundColor Red
    }
    Write-Host ""
}

# List of service files to check
$serviceFiles = @(
    ".\src\services\recruiterService.ts",
    ".\src\services\userService.ts",
    ".\src\services\reviewService.ts",
    ".\src\services\matchService.ts",
    ".\src\services\interactionService.ts",
    ".\src\services\diaryService.ts",
    ".\src\services\chatService.ts"
)

foreach ($serviceFile in $serviceFiles) {
    $fileName = Split-Path $serviceFile -Leaf
    
    if (Test-Path $serviceFile) {
        $content = Get-Content $serviceFile -Raw
        
        Test-Condition -TestName "$fileName - No 'use server' directive" `
            -Condition (-not ($content -match "'use server'")) `
            -SuccessMessage "$fileName does not have 'use server' directive" `
            -FailureMessage "$fileName still has 'use server' directive"
    } else {
        Test-Condition -TestName "$fileName - File exists" `
            -Condition $false `
            -SuccessMessage "$fileName exists" `
            -FailureMessage "$fileName not found"
    }
}

# Check if jobService.ts has the commented directive (this is correct)
$jobServicePath = ".\src\services\jobService.ts"
if (Test-Path $jobServicePath) {
    $jobServiceContent = Get-Content $jobServicePath -Raw
    Test-Condition -TestName "jobService.ts - Commented 'use server'" `
        -Condition ($jobServiceContent -match "// 'use server'") `
        -SuccessMessage "jobService.ts has properly commented 'use server' directive" `
        -FailureMessage "jobService.ts missing commented 'use server' directive"
}

# Summary
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed / $totalTests" -ForegroundColor $(if ($testsPassed -eq $totalTests) { "Green" } else { "Yellow" })

if ($testsPassed -eq $totalTests) {
    Write-Host "🎉 All tests passed! The server action fix is complete." -ForegroundColor Green
    Write-Host ""
    Write-Host "What was fixed:" -ForegroundColor Yellow
    Write-Host "- Removed 'use server' directive from all client-side service files" -ForegroundColor White
    Write-Host "- Services now make direct API calls to backend instead of Next.js server actions" -ForegroundColor White
    Write-Host "- Onboarding should now work correctly" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start backend: .\start-backend.ps1" -ForegroundColor White
    Write-Host "2. Start frontend: npm run dev" -ForegroundColor White
    Write-Host "3. Test recruiter onboarding flow" -ForegroundColor White
    Write-Host "4. Verify API calls go to http://localhost:5000 (not localhost:3000)" -ForegroundColor White
} else {
    Write-Host "⚠️ Some tests failed. Please review the issues above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual check:" -ForegroundColor Yellow
    Write-Host "Search for 'use server' in src/services/ directory and remove any remaining instances" -ForegroundColor White
}

Write-Host ""
Write-Host "Expected behavior after fix:" -ForegroundColor Cyan
Write-Host "- Onboarding API calls should go to http://localhost:5000/api/users/{id}/profile" -ForegroundColor White
Write-Host "- No more 400 Bad Request errors from localhost:3000" -ForegroundColor White
Write-Host "- No more 'An unexpected response was received from the server' errors" -ForegroundColor White
Write-Host "- Successful onboarding completion" -ForegroundColor White

Write-Host ""