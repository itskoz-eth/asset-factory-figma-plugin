/**
 * Build script for Figma plugin UI
 * Inlines JavaScript into HTML file as required by Figma
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, '..', 'dist');

// Step 1: Run esbuild to generate ui.js
console.log('Building UI JavaScript...');
execSync('npx esbuild src/ui/index.tsx --bundle --outfile=dist/ui.js --loader:.tsx=tsx --loader:.ts=ts --minify', {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

// Step 2: Read the generated JavaScript
const jsPath = path.join(distDir, 'ui.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Step 3: Create HTML with inlined JavaScript
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asset Factory</title>
</head>
<body>
  <div id="root"></div>
  <script>
${jsContent}
  </script>
</body>
</html>`;

// Step 4: Write the final HTML file
const htmlPath = path.join(distDir, 'ui.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('UI build complete! JavaScript inlined into ui.html');
