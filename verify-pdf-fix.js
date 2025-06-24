/**
 * Simple Node.js script to verify PDF.js version compatibility
 * This script checks if the installed PDF.js version matches the worker file
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PDF.js version compatibility...\n');

// Check package.json for installed version
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const installedVersion = packageJson.dependencies['pdfjs-dist'];

console.log(`📦 Installed pdfjs-dist version: ${installedVersion}`);

// Check if worker file exists
const workerPath = path.join(__dirname, 'public', 'workers', 'pdf.worker.min.js');
const workerExists = fs.existsSync(workerPath);

console.log(`🔧 Worker file exists: ${workerExists ? '✅ Yes' : '❌ No'}`);

if (workerExists) {
  const workerStats = fs.statSync(workerPath);
  console.log(`📁 Worker file size: ${(workerStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📅 Worker file modified: ${workerStats.mtime.toISOString()}`);
}

// Check if the source worker file exists in node_modules
const sourceWorkerPath = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const sourceWorkerExists = fs.existsSync(sourceWorkerPath);

console.log(`📦 Source worker file exists: ${sourceWorkerExists ? '✅ Yes' : '❌ No'}`);

if (sourceWorkerExists) {
  const sourceStats = fs.statSync(sourceWorkerPath);
  console.log(`📁 Source worker file size: ${(sourceStats.size / 1024 / 1024).toFixed(2)} MB`);
}

// Check if sizes match (indicating successful copy)
if (workerExists && sourceWorkerExists) {
  const workerStats = fs.statSync(workerPath);
  const sourceStats = fs.statSync(sourceWorkerPath);
  const sizesMatch = workerStats.size === sourceStats.size;
  
  console.log(`🔄 Worker files match: ${sizesMatch ? '✅ Yes' : '❌ No'}`);
  
  if (!sizesMatch) {
    console.log('\n⚠️  Worker file sizes don\'t match. You may need to update the worker file:');
    console.log('   Copy-Item "node_modules\\pdfjs-dist\\build\\pdf.worker.min.mjs" "public\\workers\\pdf.worker.min.js"');
  }
}

// Check fileParsingService.ts for correct CDN URLs
const serviceFilePath = path.join(__dirname, 'src', 'services', 'fileParsingService.ts');
if (fs.existsSync(serviceFilePath)) {
  const serviceContent = fs.readFileSync(serviceFilePath, 'utf8');
  
  const hasCorrectVersion = serviceContent.includes('5.3.31');
  const hasOldVersion = serviceContent.includes('3.11.174');
  const hasMjsExtension = serviceContent.includes('.mjs');
  
  console.log(`\n📝 Service file checks:`);
  console.log(`   Contains version 5.3.31: ${hasCorrectVersion ? '✅ Yes' : '❌ No'}`);
  console.log(`   Contains old version 3.11.174: ${hasOldVersion ? '❌ Yes (should be removed)' : '✅ No'}`);
  console.log(`   Uses .mjs extension: ${hasMjsExtension ? '✅ Yes' : '❌ No'}`);
}

console.log('\n🎯 Summary:');
if (workerExists && sourceWorkerExists) {
  const workerStats = fs.statSync(workerPath);
  const sourceStats = fs.statSync(sourceWorkerPath);
  const sizesMatch = workerStats.size === sourceStats.size;
  
  if (sizesMatch) {
    console.log('✅ PDF.js version compatibility fix appears to be correctly applied!');
    console.log('✅ Worker file is up to date with the installed version');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Test PDF upload functionality');
    console.log('   3. Check browser console for any remaining errors');
  } else {
    console.log('❌ Worker file needs to be updated');
    console.log('🔧 Run this command to fix:');
    console.log('   Copy-Item "node_modules\\pdfjs-dist\\build\\pdf.worker.min.mjs" "public\\workers\\pdf.worker.min.js"');
  }
} else {
  console.log('❌ Missing required files for PDF.js functionality');
  if (!workerExists) {
    console.log('   - Worker file is missing from public/workers/');
  }
  if (!sourceWorkerExists) {
    console.log('   - Source worker file is missing from node_modules');
    console.log('   - Try running: npm install');
  }
}

console.log('\n📚 For more details, see: PDF_VERSION_FIX_SUMMARY.md');