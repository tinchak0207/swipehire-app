const fs = require('node:fs');

// Simple debugging script to check the setup
console.log('🔍 Debugging Industry Events Feature...\n');

// 1. Check if events page exists
const eventsPagePath = './src/app/events/page.tsx';
if (fs.existsSync(eventsPagePath)) {
  console.log('✅ Events page exists at:', eventsPagePath);
} else {
  console.log('❌ Events page missing!');
}

// 2. Check if API route exists
const apiRoutePath = './src/app/api/events/route.ts';
if (fs.existsSync(apiRoutePath)) {
  console.log('✅ Events API route exists at:', apiRoutePath);
} else {
  console.log('❌ Events API route missing!');
}

// 3. Check main page configuration
const mainPagePath = './src/app/page.tsx';
if (fs.existsSync(mainPagePath)) {
  const content = fs.readFileSync(mainPagePath, 'utf8');

  // Check for Calendar import
  if (content.includes('Calendar')) {
    console.log('✅ Calendar icon imported');
  } else {
    console.log('❌ Calendar icon not imported');
  }

  // Check for EventsPage import
  if (content.includes('EventsPage')) {
    console.log('✅ EventsPage component imported');
  } else {
    console.log('❌ EventsPage component not imported');
  }

  // Check for industryEvents in baseTabItems
  if (content.includes("value: 'industryEvents'")) {
    console.log('✅ industryEvents tab defined in baseTabItems');
  } else {
    console.log('❌ industryEvents tab not found');
  }

  // Check for component usage
  if (content.includes('<EventsPage />')) {
    console.log('✅ EventsPage component used in tab definition');
  } else {
    console.log('❌ EventsPage component not used');
  }
} else {
  console.log('❌ Main page missing!');
}

// 4. Check sidebar configuration
const sidebarPath = './src/components/navigation/DashboardSidebar.tsx';
if (fs.existsSync(sidebarPath)) {
  const content = fs.readFileSync(sidebarPath, 'utf8');
  if (content.includes('industryEvents')) {
    console.log('✅ industryEvents included in sidebar navigation');
  } else {
    console.log('❌ industryEvents not in sidebar navigation');
  }
} else {
  console.log('❌ Sidebar component missing!');
}

console.log('\n🎯 Summary:');
console.log('The Industry Events feature should be visible in the app navigation.');
console.log("If it's still not showing, try:");
console.log('1. Clear browser cache and refresh');
console.log('2. Check browser console for any JavaScript errors');
console.log("3. Verify you're logged in or in guest mode");
console.log('4. Look for the "Industry Events" option in the sidebar under "Profile & Career"');
