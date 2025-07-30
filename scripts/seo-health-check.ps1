# SEO Health Check Script for SwipeHire
# Run this weekly to monitor key SEO metrics and page health

param(
    [string]$Domain = "https://swipehire.top",
    [string]$OutputFile = "seo-health-report.txt"
)

Write-Host "🔍 Starting SEO Health Check for $Domain" -ForegroundColor Green
Write-Host "📊 Report will be saved to: $OutputFile" -ForegroundColor Yellow

# Initialize report
$Report = @()
$Report += "SEO Health Check Report - $(Get-Date)"
$Report += "Domain: $Domain"
$Report += "=" * 50

# Critical URLs to monitor
$CriticalUrls = @(
    "$Domain/",
    "$Domain/jobs",
    "$Domain/companies", 
    "$Domain/events",
    "$Domain/blog",
    "$Domain/resume-optimizer",
    "$Domain/guides/tech-interview-preparation-guide",
    "$Domain/guides/resume-optimization-guide",
    "$Domain/guides/career-growth-guide",
    "$Domain/skills/react-jobs-san-francisco",
    "$Domain/skills/python-jobs-remote",
    "$Domain/sitemap.xml",
    "$Domain/robots.txt"
)

# Function to check URL health
function Test-UrlHealth {
    param([string]$Url)
    
    try {
        $Response = Invoke-WebRequest -Uri $Url -Method Head -TimeoutSec 10 -ErrorAction Stop
        return @{
            Url = $Url
            Status = $Response.StatusCode
            LoadTime = (Measure-Command { Invoke-WebRequest -Uri $Url -TimeoutSec 10 }).TotalMilliseconds
            Success = $true
            Error = $null
        }
    }
    catch {
        return @{
            Url = $Url
            Status = "Error"
            LoadTime = 0
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Function to check meta tags
function Test-MetaTags {
    param([string]$Url)
    
    try {
        $Response = Invoke-WebRequest -Uri $Url -TimeoutSec 15
        $Content = $Response.Content
        
        $Title = if ($Content -match '<title[^>]*>([^<]+)</title>') { $Matches[1].Trim() } else { "Missing" }
        $Description = if ($Content -match '<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']') { $Matches[1].Trim() } else { "Missing" }
        $Keywords = if ($Content -match '<meta[^>]*name=["\']keywords["\'][^>]*content=["\']([^"\']+)["\']') { $Matches[1].Trim() } else { "Missing" }
        $OgTitle = if ($Content -match '<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']') { $Matches[1].Trim() } else { "Missing" }
        $Schema = if ($Content -match '<script[^>]*type=["\']application/ld\+json["\']') { "Present" } else { "Missing" }
        
        return @{
            Title = $Title
            TitleLength = $Title.Length
            Description = $Description
            DescriptionLength = $Description.Length
            Keywords = $Keywords
            OgTitle = $OgTitle
            Schema = $Schema
        }
    }
    catch {
        return @{
            Title = "Error"
            TitleLength = 0
            Description = "Error"
            DescriptionLength = 0
            Keywords = "Error"
            OgTitle = "Error"
            Schema = "Error"
        }
    }
}

# Check URL health
Write-Host "🌐 Checking URL Health..." -ForegroundColor Cyan
$Report += "`n🌐 URL HEALTH CHECK"
$Report += "-" * 30

$HealthResults = @()
foreach ($Url in $CriticalUrls) {
    Write-Host "  Checking: $Url" -ForegroundColor Gray
    $Result = Test-UrlHealth -Url $Url
    $HealthResults += $Result
    
    $Status = if ($Result.Success) { "✅" } else { "❌" }
    $LoadTime = [math]::Round($Result.LoadTime, 0)
    
    $Report += "$Status $($Result.Status) | ${LoadTime}ms | $Url"
    
    if (-not $Result.Success) {
        $Report += "   Error: $($Result.Error)"
    }
}

# Performance Analysis
$SlowUrls = $HealthResults | Where-Object { $_.Success -and $_.LoadTime -gt 3000 } | Sort-Object LoadTime -Descending
if ($SlowUrls.Count -gt 0) {
    $Report += "`n⚠️  SLOW LOADING PAGES (>3s)"
    foreach ($Url in $SlowUrls) {
        $Report += "   $([math]::Round($Url.LoadTime, 0))ms - $($Url.Url)"
    }
}

# Check meta tags for key pages
Write-Host "📄 Checking Meta Tags..." -ForegroundColor Cyan
$Report += "`n📄 META TAG ANALYSIS"
$Report += "-" * 30

$KeyPages = @(
    "$Domain/",
    "$Domain/jobs",
    "$Domain/resume-optimizer",
    "$Domain/guides/tech-interview-preparation-guide"
)

foreach ($Url in $KeyPages) {
    Write-Host "  Analyzing: $Url" -ForegroundColor Gray
    $Meta = Test-MetaTags -Url $Url
    
    $Report += "`nPage: $Url"
    $Report += "  Title: $($Meta.Title) (Length: $($Meta.TitleLength))"
    $Report += "  Description: $($Meta.Description) (Length: $($Meta.DescriptionLength))"
    $Report += "  Schema.org: $($Meta.Schema)"
    
    # Check for SEO issues
    $Issues = @()
    if ($Meta.TitleLength -eq 0 -or $Meta.Title -eq "Missing") { $Issues += "Missing title tag" }
    if ($Meta.TitleLength -gt 60) { $Issues += "Title too long (>60 chars)" }
    if ($Meta.DescriptionLength -eq 0 -or $Meta.Description -eq "Missing") { $Issues += "Missing description" }
    if ($Meta.DescriptionLength -gt 160) { $Issues += "Description too long (>160 chars)" }
    if ($Meta.Schema -eq "Missing") { $Issues += "No structured data" }
    
    if ($Issues.Count -gt 0) {
        $Report += "  ⚠️  Issues: $($Issues -join ', ')"
    } else {
        $Report += "  ✅ No issues found"
    }
}

# Check sitemap
Write-Host "🗺️  Checking Sitemap..." -ForegroundColor Cyan
$Report += "`n🗺️  SITEMAP ANALYSIS"
$Report += "-" * 30

try {
    $SitemapResponse = Invoke-WebRequest -Uri "$Domain/sitemap.xml" -TimeoutSec 10
    if ($SitemapResponse.StatusCode -eq 200) {
        $SitemapContent = $SitemapResponse.Content
        $UrlCount = ([regex]::Matches($SitemapContent, '<url>')).Count
        $LastMod = if ($SitemapContent -match '<lastmod>([^<]+)</lastmod>') { $Matches[1] } else { "Not specified" }
        
        $Report += "✅ Sitemap accessible"
        $Report += "   URLs indexed: $UrlCount"
        $Report += "   Last modified: $LastMod"
        
        # Check for common issues
        if ($UrlCount -lt 10) {
            $Report += "   ⚠️  Low URL count - consider adding more pages"
        }
    }
}
catch {
    $Report += "❌ Sitemap not accessible: $($_.Exception.Message)"
}

# Check robots.txt
Write-Host "🤖 Checking Robots.txt..." -ForegroundColor Cyan
$Report += "`n🤖 ROBOTS.TXT ANALYSIS"  
$Report += "-" * 30

try {
    $RobotsResponse = Invoke-WebRequest -Uri "$Domain/robots.txt" -TimeoutSec 10
    if ($RobotsResponse.StatusCode -eq 200) {
        $Report += "✅ Robots.txt accessible"
        $RobotsContent = $RobotsResponse.Content
        
        if ($RobotsContent -match "Sitemap:") {
            $Report += "✅ Sitemap reference found"
        } else {
            $Report += "⚠️  No sitemap reference in robots.txt"
        }
        
        if ($RobotsContent -match "Disallow: /") {
            $Report += "❌ WARNING: Site may be blocked from indexing!"
        }
    }
}
catch {
    $Report += "❌ Robots.txt not accessible: $($_.Exception.Message)"
}

# Core Web Vitals Check (simplified)
Write-Host "⚡ Checking Core Web Vitals..." -ForegroundColor Cyan
$Report += "`n⚡ CORE WEB VITALS (ESTIMATED)"
$Report += "-" * 30

$FastPages = $HealthResults | Where-Object { $_.Success -and $_.LoadTime -lt 2500 }
$SlowPages = $HealthResults | Where-Object { $_.Success -and $_.LoadTime -gt 4000 }

$Report += "Fast loading pages (<2.5s): $($FastPages.Count)/$($HealthResults.Count)"
$Report += "Slow loading pages (>4s): $($SlowPages.Count)/$($HealthResults.Count)"

if ($SlowPages.Count -gt 0) {
    $Report += "⚠️  Consider optimizing slow pages for better Core Web Vitals"
}

# Security headers check
Write-Host "🔒 Checking Security Headers..." -ForegroundColor Cyan
$Report += "`n🔒 SECURITY HEADERS"
$Report += "-" * 30

try {
    $HomeResponse = Invoke-WebRequest -Uri $Domain -TimeoutSec 10
    $Headers = $HomeResponse.Headers
    
    $SecurityHeaders = @{
        "X-Content-Type-Options" = $Headers["X-Content-Type-Options"]
        "X-Frame-Options" = $Headers["X-Frame-Options"] 
        "X-XSS-Protection" = $Headers["X-XSS-Protection"]
        "Strict-Transport-Security" = $Headers["Strict-Transport-Security"]
        "Content-Security-Policy" = $Headers["Content-Security-Policy"]
    }
    
    foreach ($Header in $SecurityHeaders.GetEnumerator()) {
        if ($Header.Value) {
            $Report += "✅ $($Header.Key): Present"
        } else {
            $Report += "⚠️  $($Header.Key): Missing"
        }
    }
}
catch {
    $Report += "❌ Could not check security headers: $($_.Exception.Message)"
}

# Generate summary
$SuccessfulUrls = ($HealthResults | Where-Object { $_.Success }).Count
$TotalUrls = $HealthResults.Count
$SuccessRate = [math]::Round(($SuccessfulUrls / $TotalUrls) * 100, 1)

$Report += "`n📊 SUMMARY"
$Report += "-" * 30
$Report += "URLs checked: $TotalUrls"
$Report += "Successful: $SuccessfulUrls ($SuccessRate%)"
$Report += "Failed: $($TotalUrls - $SuccessfulUrls)"
$Report += "Average load time: $([math]::Round(($HealthResults | Where-Object { $_.Success } | Measure-Object -Property LoadTime -Average).Average, 0))ms"

if ($SuccessRate -ge 95) {
    $Report += "🎉 Overall health: EXCELLENT"
} elseif ($SuccessRate -ge 90) {
    $Report += "✅ Overall health: GOOD"  
} elseif ($SuccessRate -ge 80) {
    $Report += "⚠️  Overall health: NEEDS ATTENTION"
} else {
    $Report += "❌ Overall health: CRITICAL"
}

$Report += "`nNext recommended actions:"
if ($SlowUrls.Count -gt 0) {
    $Report += "• Optimize page load times for better Core Web Vitals"
}
$Report += "• Run Google PageSpeed Insights for detailed performance metrics"
$Report += "• Check Google Search Console for indexing issues"
$Report += "• Monitor keyword rankings and organic traffic"
$Report += "• Review and update content for better user engagement"

# Save report
$Report | Out-File -FilePath $OutputFile -Encoding UTF8
Write-Host "`n✅ SEO Health Check Complete!" -ForegroundColor Green
Write-Host "📄 Report saved to: $OutputFile" -ForegroundColor Yellow
Write-Host "🔄 Run this script weekly to monitor SEO health" -ForegroundColor Cyan

# Display summary in console
Write-Host "`n📊 QUICK SUMMARY:" -ForegroundColor Magenta
Write-Host "URLs checked: $TotalUrls | Success rate: $SuccessRate%" -ForegroundColor White
if ($SlowUrls.Count -gt 0) {
    Write-Host "⚠️  $($SlowUrls.Count) slow-loading pages need optimization" -ForegroundColor Yellow
}