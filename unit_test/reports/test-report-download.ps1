# Test script for Report Download functionality
Write-Host "Testing Report Download Button Implementation..." -ForegroundColor Green

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru

# Wait for server to start
Start-Sleep -Seconds 10

# Open the salary enquiry page in browser
Write-Host "Opening salary enquiry page..." -ForegroundColor Yellow
Start-Process "http://localhost:3000/salary-enquiry"

Write-Host "Test Instructions:" -ForegroundColor Cyan
Write-Host "1. Fill out the salary query form and submit" -ForegroundColor White
Write-Host "2. Once results are displayed, look for the 'Download Report' button" -ForegroundColor White
Write-Host "3. Click the dropdown arrow to see PDF and CSV options" -ForegroundColor White
Write-Host "4. Test downloading both PDF and CSV reports" -ForegroundColor White
Write-Host "5. Verify that files are downloaded successfully" -ForegroundColor White
Write-Host "6. Check that loading states and feedback messages work correctly" -ForegroundColor White

Write-Host "`nPress any key to stop the development server..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop the development server
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force

Write-Host "Test completed!" -ForegroundColor Green