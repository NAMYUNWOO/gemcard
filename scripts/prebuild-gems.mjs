/**
 * Pre-build gem geometry from .asc files to JSON
 *
 * This script parses GemCad .asc files and generates geometry using CSG,
 * then saves the result as JSON files for fast loading at runtime.
 *
 * Usage: node scripts/prebuild-gems.mjs
 */

import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEM_CADS_DIR = path.join(__dirname, '../public/gem_cads');
const OUTPUT_DIR = path.join(__dirname, '../public/gem_geometry');

// Parse GemCad .asc file content
function parseGemCad(content) {
  const lines = content.split('\n');
  const data = {
    gearTeeth: 64,
    symmetry: 8,
    refractiveIndex: 1.54,
    name: 'Unknown',
    facets: []
  };

  // Line continuation handling
  let combinedContent = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (line.startsWith(' ') || line.startsWith('\t')) {
      combinedContent += ' ' + trimmed;
    } else {
      combinedContent += '\n' + trimmed;
    }
  }

  const processedLines = combinedContent.split('\n').filter(l => l.trim());

  for (const line of processedLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];

    switch (cmd) {
      case 'g':
        data.gearTeeth = parseInt(parts[1]) || 64;
        break;
      case 'y':
        data.symmetry = parseInt(parts[1]) || 8;
        break;
      case 'I':
        data.refractiveIndex = parseFloat(parts[1]) || 1.54;
        break;
      case 'H':
        if (!data.name || data.name === 'Unknown') {
          const fullText = parts.slice(1).join(' ');
          const match = fullText.match(/^[A-Z]{2}\s*[\d.]+[A-Z]?\s+(.+)$/);
          if (match) {
            data.name = match[1].trim();
          } else {
            data.name = fullText;
          }
        }
        break;
      case 'a': {
        const angle = parseFloat(parts[1]);
        const distance = parseFloat(parts[2]);

        // Find where comment starts (G marker)
        let endIndex = parts.length;
        const gIndex = parts.indexOf('G');
        if (gIndex !== -1) {
          endIndex = gIndex;
        }

        // Collect all indices from position 3 to comment start
        const indices = [];
        let name = '';
        let skipNext = false;

        for (let i = 3; i < endIndex; i++) {
          if (skipNext) {
            if (!name) name = parts[i];
            skipNext = false;
            continue;
          }
          if (parts[i] === 'n') {
            skipNext = true;
            continue;
          }
          const num = parseInt(parts[i]);
          if (!isNaN(num)) {
            indices.push(num);
          }
        }

        const baseIndex = indices[0] || 0;
        data.facets.push({ angle, distance, baseIndex, name, indices });
        break;
      }
    }
  }

  return data;
}

// Compute flat normals
function computeFlatNormals(geometry) {
  const positionAttribute = geometry.getAttribute('position');
  const normalArray = new Float32Array(positionAttribute.count * 3);

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < positionAttribute.count; i += 3) {
    vA.fromBufferAttribute(positionAttribute, i);
    vB.fromBufferAttribute(positionAttribute, i + 1);
    vC.fromBufferAttribute(positionAttribute, i + 2);

    ab.subVectors(vB, vA);
    ac.subVectors(vC, vA);
    normal.crossVectors(ab, ac).normalize();

    for (let j = 0; j < 3; j++) {
      normalArray[(i + j) * 3] = normal.x;
      normalArray[(i + j) * 3 + 1] = normal.y;
      normalArray[(i + j) * 3 + 2] = normal.z;
    }
  }

  geometry.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3));
}

// Generate gem geometry using CSG
function generateGemGeometry(gemcadData, scale = 1) {
  const { gearTeeth, facets } = gemcadData;
  const evaluator = new Evaluator();

  const maxDistance = Math.max(...facets.map(f => f.distance));
  const baseRadius = maxDistance * scale * 1.5;
  const baseHeight = maxDistance * scale * 3;

  let baseCylinder = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 64);
  let result = new Brush(baseCylinder);
  result.updateMatrixWorld();

  for (const facet of facets) {
    const angleRad = (facet.angle * Math.PI) / 180;
    const distanceScaled = facet.distance * scale;

    for (const idx of facet.indices) {
      const azimuth = (idx / gearTeeth) * 2 * Math.PI;

      let normal;

      if (Math.abs(facet.angle) < 0.01) {
        normal = new THREE.Vector3(0, 1, 0);
      } else if (Math.abs(facet.angle - 90) < 0.01 || Math.abs(facet.angle + 90) < 0.01) {
        normal = new THREE.Vector3(Math.cos(azimuth), 0, Math.sin(azimuth));
      } else {
        const tiltAngle = Math.abs(angleRad);
        const isDown = facet.angle < 0;

        const radialX = Math.cos(azimuth);
        const radialZ = Math.sin(azimuth);

        const horizontalComponent = Math.sin(tiltAngle);
        const verticalComponent = Math.cos(tiltAngle) * (isDown ? -1 : 1);

        normal = new THREE.Vector3(
          radialX * horizontalComponent,
          verticalComponent,
          radialZ * horizontalComponent
        ).normalize();
      }

      const boxSize = baseRadius * 4;
      const cuttingBox = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
      const cuttingBrush = new Brush(cuttingBox);

      cuttingBrush.position.copy(
        normal.clone().multiplyScalar(distanceScaled + boxSize / 2)
      );

      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
      cuttingBrush.quaternion.copy(quaternion);

      cuttingBrush.updateMatrixWorld();

      try {
        result = evaluator.evaluate(result, cuttingBrush, SUBTRACTION);
        result.updateMatrixWorld();
      } catch (e) {
        console.warn('CSG operation failed for facet', facet.name, idx);
      }
    }
  }

  let geometry = result.geometry.clone();
  if (geometry.index !== null) {
    geometry = geometry.toNonIndexed();
  }

  computeFlatNormals(geometry);
  return geometry;
}

// Convert geometry to binary format (much smaller than JSON)
function geometryToBinary(geometry) {
  const positions = geometry.getAttribute('position').array;
  const normals = geometry.getAttribute('normal').array;
  const vertexCount = geometry.getAttribute('position').count;

  // Binary format: [vertexCount (4 bytes)] [positions (vertexCount*3*4 bytes)] [normals (vertexCount*3*4 bytes)]
  const headerSize = 4;
  const positionsSize = vertexCount * 3 * 4;
  const normalsSize = vertexCount * 3 * 4;
  const totalSize = headerSize + positionsSize + normalsSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // Write vertex count
  view.setUint32(0, vertexCount, true); // little-endian

  // Write positions
  const positionsArray = new Float32Array(buffer, headerSize, vertexCount * 3);
  positionsArray.set(positions);

  // Write normals
  const normalsArray = new Float32Array(buffer, headerSize + positionsSize, vertexCount * 3);
  normalsArray.set(normals);

  return Buffer.from(buffer);
}

// Main build function
async function buildAllGems() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read index.json to get list of gems
  const indexPath = path.join(GEM_CADS_DIR, 'index.json');
  const gemList = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  console.log(`Found ${gemList.length} gems to process`);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const gemId of gemList) {
    const outputPath = path.join(OUTPUT_DIR, `${gemId}.bin`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      skipped++;
      continue;
    }

    const ascPath = path.join(GEM_CADS_DIR, `${gemId}.asc`);

    if (!fs.existsSync(ascPath)) {
      console.warn(`File not found: ${ascPath}`);
      failed++;
      continue;
    }

    try {
      console.log(`Processing ${gemId}...`);
      const content = fs.readFileSync(ascPath, 'utf-8');
      const gemcadData = parseGemCad(content);
      const geometry = generateGemGeometry(gemcadData, 1.0);
      const binaryData = geometryToBinary(geometry);

      fs.writeFileSync(outputPath, binaryData);
      processed++;

      // Clean up
      geometry.dispose();

      if (processed % 50 === 0) {
        console.log(`Processed ${processed}/${gemList.length - skipped}`);
      }
    } catch (e) {
      console.error(`Failed to process ${gemId}:`, e.message);
      failed++;
    }
  }

  console.log(`\nBuild complete!`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Failed: ${failed}`);
}

// Run
buildAllGems().catch(console.error);
