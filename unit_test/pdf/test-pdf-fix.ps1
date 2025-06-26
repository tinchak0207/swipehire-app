#!/usr/bin/env pwsh

Write-Host "Testing PDF.js version compatibility fix..." -ForegroundColor Green

# Start the development server in the background
Write-Host "Starting development server..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 10

try {
    # Test if the server is running
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is running successfully" -ForegroundColor Green
        
        # Check if the worker file is accessible
        try {
            $workerResponse = Invoke-WebRequest -Uri "http://localhost:3000/workers/pdf.worker.min.js" -UseBasicParsing -TimeoutSec 5
            if ($workerResponse.StatusCode -eq 200) {
                Write-Host "✅ PDF.js worker file is accessible" -ForegroundColor Green
                Write-Host "Worker file size: $($workerResponse.Content.Length) bytes" -ForegroundColor Cyan
            } else {
                Write-Host "❌ PDF.js worker file is not accessible" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error accessing worker file: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host "`n🔧 PDF.js Fix Applied:" -ForegroundColor Cyan
        Write-Host "- Updated worker file from version 3.11.174 to 5.3.31" -ForegroundColor White
        Write-Host "- Fixed version mismatch between API and Worker" -ForegroundColor White
        Write-Host "- Updated fallback CDN URLs to use .mjs extension" -ForegroundColor White
        
        Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Test PDF upload functionality in the browser" -ForegroundColor White
        Write-Host "2. Check browser console for any remaining errors" -ForegroundColor White
        Write-Host "3. Verify PDF parsing works correctly" -ForegroundColor White
        
        Write-Host "`n🌐 Open http://localhost:3000 to test the application" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Server is not responding correctly" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure to run 'npm install' first if you haven't already" -ForegroundColor Yellow
} finally {
    # Don't stop the server automatically - let user test it
    Write-Host "`n⚠️  Server is still running. Press Ctrl+C in the terminal to stop it when done testing." -ForegroundColor Yellow
}