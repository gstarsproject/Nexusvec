const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replacements
      content = content.replace(/font-black/g, 'font-semibold');
      content = content.replace(/text-\[10px\]/g, 'text-xs');
      content = content.replace(/text-\[9px\]/g, 'text-xs');
      content = content.replace(/text-\[8px\]/g, 'text-xs');
      content = content.replace(/uppercase tracking-widest/g, 'tracking-tight');
      content = content.replace(/tracking-widest/g, 'tracking-wider');
      
      // Specific terms removal (gamer/sci-fi terms)
      content = content.replace(/Global_Status: Optimal/g, 'System Status: Optimal');
      content = content.replace(/Reseller_Fleet/g, 'Resellers');
      content = content.replace(/Partner_Nodes/g, 'Partners');
      content = content.replace(/Connectivity Status Bar/g, 'System Status Bar');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done!');
