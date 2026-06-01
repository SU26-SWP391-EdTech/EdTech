const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_FILE = 'all-project-code.txt';

const ALLOWED_EXTENSIONS = new Set([
  '.ts',
  '.js',
  '.tsx',
  '.jsx',
  '.sql',
  '.md',
]);

const EXCLUDED_FILENAMES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
]);

// Optional folder filter
let targetPath = process.argv[2];

if (targetPath) {
  targetPath = targetPath
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/\/+$/, '');
}

try {
  let files = execSync('git ls-files --cached --others --exclude-standard', {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .sort();

  // Filter by folder if provided
  if (targetPath) {
    files = files.filter((file) => {
      const normalized = file.replace(/\\/g, '/');

      return (
        normalized === targetPath || normalized.startsWith(targetPath + '/')
      );
    });
  }

  // Filter by extension
  files = files.filter((file) => {
    const filename = path.basename(file);

    if (EXCLUDED_FILENAMES.has(filename)) {
      return false;
    }

    const ext = path.extname(file).toLowerCase();

    return ALLOWED_EXTENSIONS.has(ext);
  });

  let output = `
============================================================
PROJECT EXPORT
Generated: ${new Date().toISOString()}
============================================================

Path Filter: ${targetPath || 'ALL'}
Files Exported: ${files.length}

`;

  for (const file of files) {
    output += `

============================================================
FILE: ${file}
============================================================

`;

    try {
      output += fs.readFileSync(file, 'utf8');
      output += '\n';
    } catch (err) {
      output += `[ERROR READING FILE]\n${err.message}\n`;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, output);

  console.log(`✅ Exported ${files.length} files`);
  console.log(`📄 Output: ${OUTPUT_FILE}`);

  if (targetPath) {
    console.log(`📂 Filtered Path: ${targetPath}`);
  }
} catch (err) {
  console.error('❌ Error:', err.message);
}
