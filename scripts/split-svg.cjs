const fs = require('fs');
const path = require('path');

const svgContent = fs.readFileSync(
  path.join(__dirname, '../public/magiccircle/64.svg'),
  'utf-8'
);

// 4500x4500 canvas divided into 4x4 grid = 16 cells
// Each cell is 1125x1125
const GRID_SIZE = 4;
const CELL_SIZE = 1125;

// Extract all paths with their IDs and starting coordinates (path3 ~ path1594)
const pathRegex = /<path\s+id="path(\d+)"\s+d="[mM]\s*([0-9.]+),([0-9.]+)[\s\S]*?\/>/g;
const circles = Array.from({ length: 16 }, () => []);
let match;
let totalPaths = 0;

while ((match = pathRegex.exec(svgContent)) !== null) {
  const id = parseInt(match[1]);
  if (id < 3 || id > 1594) continue; // Skip background and out of range

  const x = parseFloat(match[2]);
  const y = parseFloat(match[3]);

  // Determine grid cell (0-3 for col and row)
  const col = Math.min(Math.floor(x / CELL_SIZE), GRID_SIZE - 1);
  const row = Math.min(Math.floor(y / CELL_SIZE), GRID_SIZE - 1);
  const cellIndex = row * GRID_SIZE + col;

  circles[cellIndex].push({
    id,
    content: match[0],
    x,
    y
  });
  totalPaths++;
}

console.log(`Total paths processed: ${totalPaths}`);
circles.forEach((c, i) => {
  const row = Math.floor(i / 4) + 1;
  const col = (i % 4) + 1;
  console.log(`Circle ${i + 1} (row ${row}, col ${col}): ${c.length} paths`);
});

// Create output directory
const outputDir = path.join(__dirname, '../public/magiccircle/circles');
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

  // Remove transform from paths
  const pathsWithoutTransform = circlePaths.map(p =>
    p.content.replace(/\s+transform="[^"]*"/, '')
  );

  // Simple SVG with cell-based viewBox
  const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   version="1.1"
   width="600"
   height="600"
   viewBox="${viewBoxX} ${viewBoxY} ${CELL_SIZE} ${CELL_SIZE}"
   xmlns="http://www.w3.org/2000/svg">
  <rect x="${viewBoxX}" y="${viewBoxY}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="#000000"/>
${pathsWithoutTransform.map(p => '  ' + p).join('\n')}
</svg>`;

  const filename = path.join(outputDir, `circle-${String(i + 1).padStart(2, '0')}.svg`);
  fs.writeFileSync(filename, svgContent);
  console.log(`Created: circle-${String(i + 1).padStart(2, '0')}.svg (${circlePaths.length} paths)`);
});

console.log('\nDone! Check /public/magiccircle/circles/');
