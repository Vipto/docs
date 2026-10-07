const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'vipto-notion-export');
const exportBlocks = fs.readdirSync(rootDir).filter(f => fs.statSync(path.join(rootDir, f)).isDirectory());

console.log(`Found ${exportBlocks.length} export blocks:`);

exportBlocks.forEach(block => {
  console.log(`\n=== BLOCK: ${block} ===`);
  const blockPath = path.join(rootDir, block);
  
  function walk(dir, level = 0) {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
      const p = path.join(dir, f);
      const isDir = fs.statSync(p).isDirectory();
      if (isDir) {
        console.log(`${'  '.repeat(level)}📁 ${f}`);
        walk(p, level + 1);
      } else if (f.endsWith('.md')) {
        console.log(`${'  '.repeat(level)}📄 ${f}`);
      }
    });
  }
  
  walk(blockPath);
});
