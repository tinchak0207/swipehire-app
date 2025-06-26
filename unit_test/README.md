# SwipeHire Unit Test Suite

This directory contains organized unit tests, integration tests, and verification scripts for the SwipeHire application. All tests are written in PowerShell for cross-platform compatibility and ease of execution.

## Directory Structure

```
unit_test/
├── ai/                     # AI-related functionality tests
├── backend/                # Backend service and API tests
├── career-ai/              # Career AI feature tests
├── company-profile/        # Company profile management tests
├── integration/            # Integration tests between components
├── onboarding/            # User onboarding flow tests
├── pdf/                   # PDF processing and handling tests
├── reports/               # Report generation and download tests
├── salary-inquiry/        # Market salary inquiry feature tests
├── server-actions/        # Server action and API endpoint tests
├── typeform/              # Typeform integration tests
└── verification/          # General verification and validation scripts
```

## Test Categories

### 🏢 Company Profile Tests (`company-profile/`)
- **debug-company-profile-state.ps1**: Debug script for company profile state issues
- **verify-company-profile-fix.ps1**: Verification script for company profile fixes

**Purpose**: Tests company profile creation, updates, and state management for recruiters.

### 🚀 Onboarding Tests (`onboarding/`)
- **verify-onboarding-fix.ps1**: Verification script for onboarding popup and flow fixes

**Purpose**: Tests user onboarding wizard, preferences setup, and completion flows.

### 💰 Salary Inquiry Tests (`salary-inquiry/`)
- **test-salary-inquiry.ps1**: Comprehensive test for market salary inquiry implementation

**Purpose**: Tests salary query forms, data visualization, and market analysis features.

### 📋 Typeform Tests (`typeform/`)
- **test-typeform-integration.ps1**: Tests typeform-styled multi-step forms integration

**Purpose**: Tests typeform integration, form styling, and user experience flows.

### 🔧 Server Actions Tests (`server-actions/`)
- **verify-server-action-fix.ps1**: Verification script for server action fixes

**Purpose**: Tests server-side actions, API endpoints, and backend communication.

### 📊 Reports Tests (`reports/`)
- **test-report-download.ps1**: Tests report generation and download functionality

**Purpose**: Tests PDF/CSV report generation, download buttons, and file handling.

### 📄 PDF Tests (`pdf/`)
- **test-pdf-fix.ps1**: Tests PDF.js version compatibility and processing

**Purpose**: Tests PDF upload, parsing, and version compatibility fixes.

## Running Tests

### Prerequisites
- PowerShell 5.1 or later (Windows) or PowerShell Core 6+ (Cross-platform)
- Node.js and npm installed
- SwipeHire backend server available (for integration tests)

### Individual Test Execution

```powershell
# Run a specific test category
.\unit_test\company-profile\debug-company-profile-state.ps1
.\unit_test\onboarding\verify-onboarding-fix.ps1
.\unit_test\salary-inquiry\test-salary-inquiry.ps1

# Run verification scripts
.\unit_test\server-actions\verify-server-action-fix.ps1
.\unit_test\pdf\test-pdf-fix.ps1
```

### Batch Test Execution

```powershell
# Run all tests in a category
Get-ChildItem ".\unit_test\company-profile\*.ps1" | ForEach-Object { & $_.FullName }

# Run all verification tests
Get-ChildItem ".\unit_test\*\verify-*.ps1" -Recurse | ForEach-Object { & $_.FullName }

# Run all tests (be careful - this may take a while)
Get-ChildItem ".\unit_test\*.ps1" -Recurse | ForEach-Object { & $_.FullName }
```

## Test Types

### 🔍 Verification Tests
Quick validation scripts that check if fixes and implementations are properly in place.
- Pattern: `verify-*.ps1`
- Purpose: Fast validation of code changes
- Output: ✅/❌ status indicators

### 🧪 Integration Tests
Comprehensive tests that start services and test full workflows.
- Pattern: `test-*.ps1`
- Purpose: End-to-end functionality testing
- Output: Detailed test results and instructions

### 🐛 Debug Scripts
Diagnostic tools for troubleshooting specific issues.
- Pattern: `debug-*.ps1`
- Purpose: Problem diagnosis and state inspection
- Output: Diagnostic information and troubleshooting steps

## Best Practices

### Writing New Tests
1. **Categorize Properly**: Place tests in the appropriate subdirectory
2. **Use Descriptive Names**: Follow the naming conventions (`test-`, `verify-`, `debug-`)
3. **Include Documentation**: Add clear descriptions and usage instructions
4. **Handle Errors Gracefully**: Use try-catch blocks and provide meaningful error messages
5. **Provide Clear Output**: Use color-coded output with ✅/❌ indicators

### Test Naming Conventions
- `test-[feature-name].ps1`: Comprehensive integration tests
- `verify-[fix-name].ps1`: Quick verification scripts
- `debug-[issue-name].ps1`: Diagnostic and troubleshooting scripts

### Output Standards
```powershell
Write-Host "✅ Success message" -ForegroundColor Green
Write-Host "❌ Error message" -ForegroundColor Red
Write-Host "⚠️ Warning message" -ForegroundColor Yellow
Write-Host "🔍 Info message" -ForegroundColor Cyan
```

## Common Test Patterns

### Service Startup Pattern
```powershell
# Start development server
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 10

try {
    # Test functionality
    # ...
} finally {
    # Cleanup
    Stop-Process -Id $serverProcess.Id -Force
}
```

### File Existence Check Pattern
```powershell
$requiredFiles = @("file1.tsx", "file2.ts")
$allFilesExist = $true

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}
```

### Pattern Matching Check
```powershell
$content = Get-Content "file.tsx" -Raw
if ($content -match "expectedPattern") {
    Write-Host "✅ Pattern found" -ForegroundColor Green
} else {
    Write-Host "❌ Pattern not found" -ForegroundColor Red
}
```

## Maintenance

### Adding New Tests
1. Determine the appropriate category directory
2. Create the test file following naming conventions
3. Update this README if adding a new category
4. Test the script thoroughly before committing

### Updating Existing Tests
1. Maintain backward compatibility when possible
2. Update documentation if behavior changes
3. Test changes across different environments
4. Update related verification scripts if needed

## Troubleshooting

### Common Issues
- **Permission Errors**: Run PowerShell as Administrator if needed
- **Execution Policy**: Set execution policy with `Set-ExecutionPolicy RemoteSigned`
- **Port Conflicts**: Check if ports 3000/5000 are available
- **Missing Dependencies**: Run `npm install` before testing

### Getting Help
- Check individual test files for specific usage instructions
- Review error messages and suggested fixes
- Ensure all prerequisites are installed and configured
- Check that backend services are running when required

---

*Last Updated: $(Get-Date -Format "yyyy-MM-dd")*
*Test Suite Version: 2.0*