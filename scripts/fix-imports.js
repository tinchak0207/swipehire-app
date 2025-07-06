const fs = require('fs');
const path = require('path');

// Update imports in AI flow files
function fixFlowImports() {
  const flowsDir = path.join(__dirname, '../src/ai/flows');
  const files = fs.readdirSync(flowsDir);

  files.forEach((file) => {
    if (file.endsWith('.ts')) {
      const filePath = path.join(flowsDir, file);
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Replace relative imports with @/ alias
      content = content.replace(/from\s+['"]\.\.\/ai\/genkit['"]/g, "from '@/ai/genkit'");

      fs.writeFileSync(filePath, content);
      console.log(`Updated imports in ${file}`);
    }
  });
}

fixFlowImports();
