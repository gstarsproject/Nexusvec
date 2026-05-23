const fs = require('fs');
const glob = require('glob');

const files = glob.sync('./src/**/*.tsx');
const ids = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /id:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }
});

const counts = {};
ids.forEach(id => {
  counts[id] = (counts[id] || 0) + 1;
});

const duplicates = Object.keys(counts).filter(id => counts[id] > 1);
console.log('Duplicates:', duplicates.map(id => `${id}: ${counts[id]}`));
