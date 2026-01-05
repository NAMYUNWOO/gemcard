const fs = require('fs');
const path = require('path');

const circlesDir = path.join(__dirname, '../public/magiccircle/circles');
const files = fs.readdirSync(circlesDir).filter(f => f.endsWith('.svg'));

// Parse SVG path and return all absolute coordinates
function getPathBounds(d) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let curX = 0, curY = 0;
  let startX = 0, startY = 0;

  const updateBounds = (x, y) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  // Split path into commands
  const cmdRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match;

  while ((match = cmdRegex.exec(d)) !== null) {
    const cmd = match[1];
    const argsStr = match[2].trim();
    const nums = argsStr.match(/-?\d+\.?\d*/g)?.map(Number) || [];

    switch (cmd) {
      case 'M':
        for (let i = 0; i < nums.length; i += 2) {
          curX = nums[i]; curY = nums[i + 1];
          updateBounds(curX, curY);
          if (i === 0) { startX = curX; startY = curY; }
        }
        break;
      case 'm':
        for (let i = 0; i < nums.length; i += 2) {
          curX += nums[i]; curY += nums[i + 1];
          updateBounds(curX, curY);
          if (i === 0) { startX = curX; startY = curY; }
        }
        break;
      case 'L':
        for (let i = 0; i < nums.length; i += 2) {
          curX = nums[i]; curY = nums[i + 1];
          updateBounds(curX, curY);
        }
        break;
      case 'l':
        for (let i = 0; i < nums.length; i += 2) {
          curX += nums[i]; curY += nums[i + 1];
          updateBounds(curX, curY);
        }
        break;
      case 'H':
        for (const n of nums) { curX = n; updateBounds(curX, curY); }
        break;
      case 'h':
        for (const n of nums) { curX += n; updateBounds(curX, curY); }
        break;
      case 'V':
        for (const n of nums) { curY = n; updateBounds(curX, curY); }
        break;
      case 'v':
        for (const n of nums) { curY += n; updateBounds(curX, curY); }
        break;
      case 'C':
        for (let i = 0; i < nums.length; i += 6) {
          updateBounds(nums[i], nums[i + 1]);
          updateBounds(nums[i + 2], nums[i + 3]);
          curX = nums[i + 4]; curY = nums[i + 5];
          updateBounds(curX, curY);
        }
        break;
      case 'c':
        for (let i = 0; i < nums.length; i += 6) {
          updateBounds(curX + nums[i], curY + nums[i + 1]);
          updateBounds(curX + nums[i + 2], curY + nums[i + 3]);
          curX += nums[i + 4]; curY += nums[i + 5];
          updateBounds(curX, curY);
        }
        break;
      case 'S':
        for (let i = 0; i < nums.length; i += 4) {
          updateBounds(nums[i], nums[i + 1]);
          curX = nums[i + 2]; curY = nums[i + 3];
          updateBounds(curX, curY);
        }
        break;
      case 's':
        for (let i = 0; i < nums.length; i += 4) {
          updateBounds(curX + nums[i], curY + nums[i + 1]);
          curX += nums[i + 2]; curY += nums[i + 3];
          updateBounds(curX, curY);
        }
        break;
      case 'Q':
        for (let i = 0; i < nums.length; i += 4) {
          updateBounds(nums[i], nums[i + 1]);
          curX = nums[i + 2]; curY = nums[i + 3];
          updateBounds(curX, curY);
        }
        break;
      case 'q':
        for (let i = 0; i < nums.length; i += 4) {
          updateBounds(curX + nums[i], curY + nums[i + 1]);
          curX += nums[i + 2]; curY += nums[i + 3];
          updateBounds(curX, curY);
        }
        break;
      case 'A':
        for (let i = 0; i < nums.length; i += 7) {
          curX = nums[i + 5]; curY = nums[i + 6];
          updateBounds(curX, curY);
        }
        break;
      case 'a':
        for (let i = 0; i < nums.length; i += 7) {
          curX += nums[i + 5]; curY += nums[i + 6];
          updateBounds(curX, curY);
        }
        break;
      case 'Z':
      case 'z':
        curX = startX; curY = startY;
        break;
    }
  }

  return { minX, maxX, minY, maxY };
}

files.forEach(file => {
  const filePath = path.join(circlesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Get all path d attributes (must start with M or m, not "path" which is from id)
  const pathDRegex = /\sd="([MmLlHhVvCcSsQqTtAaZz][^"]+)"/g;
  let match;
  let globalMinX = Infinity, globalMaxX = -Infinity;
  let globalMinY = Infinity, globalMaxY = -Infinity;

  while ((match = pathDRegex.exec(content)) !== null) {
    const { minX, maxX, minY, maxY } = getPathBounds(match[1]);
    if (minX < globalMinX) globalMinX = minX;
    if (maxX > globalMaxX) globalMaxX = maxX;
    if (minY < globalMinY) globalMinY = minY;
    if (maxY > globalMaxY) globalMaxY = maxY;
  }

  if (globalMinX === Infinity) {
    console.log(`${file}: No coordinates found, skipping`);
    return;
  }

  // Calculate centered square viewBox
  const width = globalMaxX - globalMinX;
  const height = globalMaxY - globalMinY;
  const centerX = globalMinX + width / 2;
  const centerY = globalMinY + height / 2;

  // Use square size with 5% padding
  const maxDim = Math.max(width, height);
  const padding = maxDim * 0.05;
  const size = maxDim + padding * 2;

  const vbX = centerX - size / 2;
  const vbY = centerY - size / 2;

  console.log(`${file}: bounds (${globalMinX.toFixed(0)}-${globalMaxX.toFixed(0)}, ${globalMinY.toFixed(0)}-${globalMaxY.toFixed(0)}) → ${size.toFixed(0)}x${size.toFixed(0)}`);

  // Update viewBox and rect
  content = content.replace(/viewBox="[^"]*"/, `viewBox="${vbX.toFixed(2)} ${vbY.toFixed(2)} ${size.toFixed(2)} ${size.toFixed(2)}"`);
  content = content.replace(/<rect[^>]*\/>/, `<rect x="${vbX.toFixed(2)}" y="${vbY.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" fill="#000000"/>`);

  fs.writeFileSync(filePath, content);
});

console.log('\nDone!');
