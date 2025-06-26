# PowerShell script to debug company profile state
Write-Host "🔍 Debugging Company Profile State" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Gray

Write-Host "`n📋 Checking localStorage values..." -ForegroundColor Yellow
Write-Host "Note: You'll need to check these in your browser's developer console:" -ForegroundColor Gray
Write-Host "localStorage.getItem('recruiterCompanyProfileComplete')" -ForegroundColor White
Write-Host "localStorage.getItem('mongoDbUserId')" -ForegroundColor White
Write-Host "sessionStorage.getItem('onboardingJustCompleted')" -ForegroundColor White

Write-Host "`n🔧 Browser Console Commands to Run:" -ForegroundColor Yellow
Write-Host "1. Check current user context:" -ForegroundColor Gray
Write-Host "   console.log('Current user context:', window.__userContext || 'Not available')" -ForegroundColor White

Write-Host "`n2. Check backend API directly:" -ForegroundColor Gray
Write-Host "   fetch('http://localhost:5000/api/users/YOUR_MONGO_ID')" -ForegroundColor White
Write-Host "     .then(res => res.json())" -ForegroundColor White
Write-Host "     .then(data => console.log('Backend user data:', data))" -ForegroundColor White

Write-Host "`n3. Force refresh user preferences:" -ForegroundColor Gray
Write-Host "   // In React DevTools, find UserPreferencesContext and trigger fetchAndSetUserPreferences" -ForegroundColor White

Write-Host "`n📝 What to look for:" -ForegroundColor Yellow
Write-Host "✅ companyProfileComplete should be true in backend response" -ForegroundColor Green
Write-Host "✅ Frontend context should reflect the same value" -ForegroundColor Green
Write-Host "❌ If backend shows true but frontend shows false, it's a context sync issue" -ForegroundColor Red
Write-Host "❌ If backend shows false, the onboarding submission didn't work" -ForegroundColor Red

Write-Host "`n🛠️ Quick fixes to try:" -ForegroundColor Yellow
Write-Host "1. Refresh the page (F5)" -ForegroundColor White
Write-Host "2. Clear localStorage and sessionStorage, then re-login" -ForegroundColor White
Write-Host "3. Check browser network tab for failed API calls" -ForegroundColor White
Write-Host "4. Look for console errors during onboarding submission" -ForegroundColor White

Write-Host "`n🔍 Files to check for debugging:" -ForegroundColor Yellow
Write-Host "- Browser Console (F12)" -ForegroundColor White
Write-Host "- Network tab during onboarding submission" -ForegroundColor White
Write-Host "- React DevTools for context state" -ForegroundColor White

Write-Host "`n💡 If the issue persists:" -ForegroundColor Yellow
Write-Host "1. Check if backend server is running on port 5000" -ForegroundColor White
Write-Host "2. Verify MongoDB connection is working" -ForegroundColor White
Write-Host "3. Check backend logs for any errors during profile update" -ForegroundColor White

Write-Host ""