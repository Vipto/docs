const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'vipto-notion-export');

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

const allFiles = findFiles(rootDir);
console.log(`Total files found: ${allFiles.length}`);

const mdFiles = allFiles.filter(f => f.endsWith('.md'));
console.log(`Total Markdown files: ${mdFiles.length}`);

// Group by subdirectories
const fileMap = {};
mdFiles.forEach(f => {
  const rel = path.relative(rootDir, f);
  const parts = rel.split(path.sep);
  console.log(rel);
});
