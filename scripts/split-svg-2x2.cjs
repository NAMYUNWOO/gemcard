const fs = require('fs');
const path = require('path');

const svgContent = fs.readFileSync(
  path.join(__dirname, '../public/magiccircle/7953386.svg'),
  'utf-8'
);

// 5000x5000 canvas divided into 2x2 grid = 4 cells
// Each cell is 2500x2500
const GRID_SIZE = 2;
const CELL_SIZE = 2500;

// Extract the <defs> section to preserve clipPath references
const defsMatch = svgContent.match(/<defs[\s\S]*?<\/defs>/);
const defsSection = defsMatch ? defsMatch[0] : '';

// Extract paths from the main group (skip clipPath definitions in defs)
// Match multi-line path elements
const pathRegex = /<path\s+(?:[^>]*?\s+)?id="(path\d+)"[\s\S]*?\/>/g;

// Find where the main content group starts (after </defs>)
const defsEndIndex = svgContent.indexOf('</defs>');
const mainContent = svgContent.slice(defsEndIndex);

const circles = Array.from({ length: 4 }, () => []);
let match;
let totalPaths = 0;

while ((match = pathRegex.exec(mainContent)) !== null) {
  const fullPath = match[0];
  const pathId = match[1];

  // Extract d attribute to get starting coordinates
  const dMatch = fullPath.match(/d="([mM])\s*([\d.]+),([\d.]+)/);
  if (!dMatch) continue;

  const command = dMatch[1];
  let x = parseFloat(dMatch[2]);
  let y = parseFloat(dMatch[3]);

  // Skip the background rectangle (path2 with 5000,0)
  if (pathId === 'path2') continue;

  // Determine grid cell (0-1 for col and row)
  const col = Math.min(Math.floor(x / CELL_SIZE), GRID_SIZE - 1);
  const row = Math.min(Math.floor(y / CELL_SIZE), GRID_SIZE - 1);
  const cellIndex = row * GRID_SIZE + col;

  circles[cellIndex].push({
    id: pathId,
    content: fullPath,
    x,
    y
  });
  totalPaths++;
}

console.log(`Total paths processed: ${totalPaths}`);
circles.forEach((c, i) => {
  const row = Math.floor(i / GRID_SIZE) + 1;
  const col = (i % GRID_SIZE) + 1;
  console.log(`Circle ${i + 1} (row ${row}, col ${col}): ${c.length} paths`);
});

// Create output directory
const outputDir = path.join(__dirname, '../public/magiccircle/circles2');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate individual SVG for each circle
circles.forEach((circlePaths, i) => {
  if (circlePaths.length === 0) {
    console.log(`Circle ${i + 1}: No paths, skipping`);
    return;
  }

  const row = Math.floor(i / GRID_SIZE);
  const col = i % GRID_SIZE;
  const viewBoxX = col * CELL_SIZE;
  const viewBoxY = row * CELL_SIZE;

  // Remove transform from each path since we apply it at group level
  const cleanedPaths = circlePaths.map(p => {
    return p.content.replace(/\s+transform="[^"]*"/g, '');
  });

  // Original transform: matrix(0.13333333,0,0,-0.13333333,0,666.66667)
  // This scales by 1/7.5 and flips Y, translating to fit in 666.67x666.67
  // For cell-based extraction, we need to adjust the Y translation based on cell position
  // Each cell in output should show coordinates from (viewBoxX, viewBoxY) to (viewBoxX+2500, viewBoxY+2500)
  // After transform, these map to approximately (viewBoxX/7.5, 666.67-viewBoxY/7.5-333.33) to (viewBoxX/7.5+333.33, 666.67-viewBoxY/7.5)

  // Output viewBox in final screen coordinates (after transform)
  const outX = viewBoxX / 7.5;
  const outY = 666.67 - (viewBoxY + CELL_SIZE) / 7.5;
  const outSize = CELL_SIZE / 7.5;

  const svgOutput = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   version="1.1"
   width="600"
   height="600"
   viewBox="${outX.toFixed(2)} ${outY.toFixed(2)} ${outSize.toFixed(2)} ${outSize.toFixed(2)}"
   xmlns="http://www.w3.org/2000/svg">
  ${defsSection}
  <rect x="${outX.toFixed(2)}" y="${outY.toFixed(2)}" width="${outSize.toFixed(2)}" height="${outSize.toFixed(2)}" fill="#1e1e20"/>
  <g transform="matrix(0.13333333,0,0,-0.13333333,0,666.66667)">
${cleanedPaths.map(p => '    ' + p).join('\n')}
  </g>
</svg>`;

  const filename = path.join(outputDir, `circle-${String(i + 1).padStart(2, '0')}.svg`);
  fs.writeFileSync(filename, svgOutput);
  console.log(`Created: circle-${String(i + 1).padStart(2, '0')}.svg (${circlePaths.length} paths)`);
});

console.log('\nDone! Check /public/magiccircle/circles2/');
