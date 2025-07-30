# SEO Monitoring Documentation

## Overview
This directory contains scripts and documentation for monitoring SwipeHire's SEO health and performance. Run these tools weekly to ensure optimal search engine visibility and user experience.

## Files in this Directory

### `seo-health-check.ps1`
PowerShell script that performs comprehensive SEO health monitoring.

**Features:**
- ✅ URL health and response time monitoring
- 📄 Meta tag analysis (title, description, keywords, Open Graph)
- 🗺️ Sitemap validation and URL count
- 🤖 Robots.txt verification
- ⚡ Core Web Vitals estimation
- 🔒 Security headers check
- 📊 Performance summary with actionable recommendations

**Usage:**
```powershell
# Basic usage
.\seo-health-check.ps1

# Custom domain and output file
.\seo-health-check.ps1 -Domain "https://swipehire.top" -OutputFile "weekly-seo-report.txt"
```

**Monitored URLs:**
- Homepage and main sections (jobs, companies, events, blog)
- Key landing pages (resume optimizer, interview guides)
- Programmatic content samples (skill-location pages)
- Technical files (sitemap.xml, robots.txt)

## SEO Monitoring Schedule

### Weekly Checks (Automated)
Run `seo-health-check.ps1` every Monday morning:

```powershell
# Create scheduled task (run as Administrator)
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\seo-health-check.ps1"
$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9AM
Register-ScheduledTask -TaskName "SwipeHire SEO Health Check" -Action $Action -Trigger $Trigger
```

### Monthly Deep Audit
Perform these additional checks monthly:

1. **Google Search Console Review**
   - Check for crawl errors
   - Monitor Core Web Vitals
   - Review search performance data
   - Analyze click-through rates

2. **PageSpeed Insights Analysis**
   - Test key landing pages
   - Monitor mobile vs desktop performance
   - Track Core Web Vitals trends

3. **Keyword Rankings**
   - Monitor target keyword positions
   - Track competitor rankings
   - Identify new keyword opportunities

4. **Content Performance**
   - Review top-performing blog posts
   - Analyze pillar page engagement
   - Update outdated content

## Key Metrics to Monitor

### Performance Thresholds
- **Page Load Time**: < 3 seconds (target: < 2.5s)
- **URL Success Rate**: > 95%
- **Core Web Vitals**: All pages should pass
- **Meta Tag Coverage**: 100% for key pages

### SEO Health Indicators
- **Sitemap**: Updated within last 7 days
- **Structured Data**: Present on all key pages
- **Security Headers**: All major headers implemented
- **Mobile Friendliness**: All pages responsive

### Critical Alerts
Monitor for these issues that require immediate attention:

❌ **Critical (Fix within 24 hours):**
- 500 server errors on key pages
- Sitemap or robots.txt inaccessible
- Missing title/description tags on main pages
- Site blocked by robots.txt

⚠️ **Warning (Fix within 7 days):**
- Page load times > 4 seconds
- Missing structured data
- Meta descriptions > 160 characters
- Security headers missing

## Troubleshooting Common Issues

### Slow Page Load Times
1. Check Next.js bundle analysis: `npm run analyze`
2. Optimize images and implement proper caching
3. Review database query performance
4. Consider CDN implementation

### Missing Structured Data
1. Verify schema generation in page components
2. Test markup with Google's Rich Results Test
3. Check for JSON-LD syntax errors
4. Ensure all required properties are included

### Meta Tag Issues
1. Review `generateMetadata` functions in page components
2. Check for duplicate or missing meta tags
3. Validate Open Graph and Twitter Card markup
4. Ensure proper internationalization

### Crawl Errors
1. Check robots.txt configuration
2. Verify sitemap includes all important URLs
3. Test URL accessibility manually
4. Review server logs for 404/500 errors

## Advanced Monitoring Tools

### Google Search Console Integration
Set up alerts for:
- Coverage issues (errors/warnings)
- Core Web Vitals degradation
- Manual actions
- Security issues

### Third-Party Monitoring
Consider integrating with:
- **GTmetrix**: Automated performance monitoring
- **SEMrush**: Keyword ranking and competitor analysis
- **Ahrefs**: Backlink monitoring and site audit
- **Screaming Frog**: Technical SEO crawling

## Report Interpretation

### Health Score Breakdown
- **95-100%**: Excellent SEO health
- **90-94%**: Good, minor optimizations needed
- **80-89%**: Needs attention, address warnings
- **<80%**: Critical issues require immediate action

### Performance Metrics
- **Load Time**: Average should be < 2.5s
- **Success Rate**: Should maintain > 95%
- **Schema Coverage**: All key pages should have structured data
- **Security Score**: All major headers should be present

## Next Steps
1. Set up automated weekly monitoring
2. Create Google Search Console dashboard
3. Implement real-time performance alerts
4. Schedule monthly deep audit reviews
5. Track and report SEO ROI metrics