#!/usr/bin/env node

/**
 * Delete gem files marked for deletion by gem-validator.html
 *
 * Usage:
 *   node scripts/delete-gems.js gems-to-delete.txt
 *   node scripts/delete-gems.js gems-to-delete.txt --dry-run
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const inputFile = args.find(arg => !arg.startsWith('--'));

if (!inputFile) {
  console.log('Usage: node scripts/delete-gems.js <file-with-gem-names> [--dry-run]');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/delete-gems.js gems-to-delete.txt');
  console.log('  node scripts/delete-gems.js gems-to-delete.txt --dry-run');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`Error: File not found: ${inputFile}`);
  process.exit(1);
}

const gemCadsDir = path.join(__dirname, '..', 'public', 'gem_cads');
const indexPath = path.join(gemCadsDir, 'index.json');

// Read gem names to delete
const content = fs.readFileSync(inputFile, 'utf-8');
const gemsToDelete = content
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Deleting ${gemsToDelete.length} gems...\n`);

let deleted = 0;
let notFound = 0;
let errors = 0;

for (const gemName of gemsToDelete) {
  const filePath = path.join(gemCadsDir, `${gemName}.asc`);

  if (!fs.existsSync(filePath)) {
    console.log(`  [NOT FOUND] ${gemName}.asc`);
    notFound++;
    continue;
  }

  try {
    if (!dryRun) {
      fs.unlinkSync(filePath);
    }
    console.log(`  [DELETED] ${gemName}.asc`);
    deleted++;
  } catch (e) {
    console.log(`  [ERROR] ${gemName}.asc - ${e.message}`);
    errors++;
  }
}

// Update index.json
if (!dryRun && deleted > 0) {
  console.log('\nUpdating index.json...');

  try {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const newIndex = index.filter(name => !gemsToDelete.includes(name));
    fs.writeFileSync(indexPath, JSON.stringify(newIndex));
    console.log(`  Removed ${index.length - newIndex.length} entries from index.json`);
  } catch (e) {
    console.error(`  Error updating index.json: ${e.message}`);
  }
}

console.log(`\n--- Summary ---`);
console.log(`Deleted: ${deleted}`);
console.log(`Not found: ${notFound}`);
console.log(`Errors: ${errors}`);

if (dryRun) {
  console.log('\n[DRY RUN] No files were actually deleted. Remove --dry-run to delete.');
}
