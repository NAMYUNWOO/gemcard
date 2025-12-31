import * as THREE from 'three';
import { SUBTRACTION, Evaluator, Brush } from 'three-bvh-csg';

interface GemCadFacet {
  angle: number;      // degrees from horizontal (0=table, 90=girdle, negative=pavilion)
  distance: number;   // radial distance from center
  baseIndex: number;  // base gear index
  name: string;       // facet name
  indices: number[];  // all gear indices for this facet
}

interface GemCadData {
  gearTeeth: number;  // usually 64 or 96
  symmetry: number;   // mirror symmetry count
  refractiveIndex: number;
  name: string;
  facets: GemCadFacet[];
}

// Parse GemCad .asc file content
export function parseGemCad(content: string): GemCadData {
  const lines = content.split('\n');
  const data: GemCadData = {
    gearTeeth: 64,
    symmetry: 8,
    refractiveIndex: 1.54,
    name: 'Unknown',
    facets: []
  };

  for (const line of lines) {
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
          data.name = parts.slice(1).join(' ');
        }
        break;
      case 'a':
        // a angle distance index n name [indices...]
        const angle = parseFloat(parts[1]);
        const distance = parseFloat(parts[2]);
        const baseIndex = parseInt(parts[3]);
        // Find 'n' separator
        const nIndex = parts.indexOf('n');
        if (nIndex !== -1) {
          const name = parts[nIndex + 1] || '';
          const indices = parts.slice(nIndex + 2).map(s => parseInt(s)).filter(n => !isNaN(n));
          // If no indices listed, use baseIndex
          if (indices.length === 0) {
            indices.push(baseIndex);
          }
          data.facets.push({ angle, distance, baseIndex, name, indices });
        }
        break;
    }
  }

  return data;
}

// Generate gem geometry using CSG
export function generateGemGeometry(gemcadData: GemCadData, scale: number = 1): THREE.BufferGeometry {
  const { gearTeeth, facets } = gemcadData;
  const evaluator = new Evaluator();

  // Start with a cylinder as the base shape
  const maxDistance = Math.max(...facets.map(f => f.distance));
  const baseRadius = maxDistance * scale * 1.5;
  const baseHeight = maxDistance * scale * 3;

  let baseCylinder = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 64);
  let result = new Brush(baseCylinder);
  result.updateMatrixWorld();

  // Process each facet
  for (const facet of facets) {
    const angleRad = (facet.angle * Math.PI) / 180;
    const distanceScaled = facet.distance * scale;

    // For each index position, create a cutting plane
    for (const idx of facet.indices) {
      // Azimuthal angle based on gear index
      const azimuth = (idx / gearTeeth) * 2 * Math.PI;

      // Calculate plane normal
      // angle = 0 -> horizontal plane (table)
      // angle = 90 -> vertical plane (girdle)
      // angle < 0 -> pavilion (pointing down)
      let normal: THREE.Vector3;

      if (Math.abs(facet.angle) < 0.01) {
        // Table facet (horizontal, facing up)
        normal = new THREE.Vector3(0, 1, 0);
      } else if (Math.abs(facet.angle - 90) < 0.01 || Math.abs(facet.angle + 90) < 0.01) {
        // Girdle facet (vertical)
        normal = new THREE.Vector3(Math.cos(azimuth), 0, Math.sin(azimuth));
      } else {
        // Tilted facet
        const tiltAngle = Math.abs(angleRad);
        const isDown = facet.angle < 0;

        // Normal direction: combination of radial and vertical
        const radialX = Math.cos(azimuth);
        const radialZ = Math.sin(azimuth);

        // For crown (positive angle): normal points outward-upward
        // For pavilion (negative angle): normal points outward-downward
        const horizontalComponent = Math.sin(tiltAngle);
        const verticalComponent = Math.cos(tiltAngle) * (isDown ? -1 : 1);

        normal = new THREE.Vector3(
          radialX * horizontalComponent,
          verticalComponent,
          radialZ * horizontalComponent
        ).normalize();
      }

      // Create a large box to use as cutting tool
      const boxSize = baseRadius * 4;
      const cuttingBox = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
      const cuttingBrush = new Brush(cuttingBox);

      // Position the box so one face aligns with the cutting plane
      // Move box center along normal by (distance + boxSize/2)
      cuttingBrush.position.copy(
        normal.clone().multiplyScalar(distanceScaled + boxSize / 2)
      );

      // Rotate box so its -Y face aligns with the cutting plane
      // Default box has faces aligned with axes
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
      cuttingBrush.quaternion.copy(quaternion);

      cuttingBrush.updateMatrixWorld();

      // Subtract the cutting box from result
      try {
        result = evaluator.evaluate(result, cuttingBrush, SUBTRACTION);
        result.updateMatrixWorld();
      } catch (e) {
        console.warn('CSG operation failed for facet', facet.name, idx);
      }
    }
  }

  // Convert Brush back to BufferGeometry
  const geometry = result.geometry.clone();
  geometry.computeVertexNormals();

  return geometry;
}

// Pre-parsed Standard Brilliant data
export const STANDARD_BRILLIANT: GemCadData = {
  gearTeeth: 64,
  symmetry: 8,
  refractiveIndex: 1.54,
  name: 'Standard Brilliant',
  facets: [
    { angle: 90, distance: 1.08976142, baseIndex: 62, name: '1', indices: [62, 58, 54, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2] },
    { angle: -42.1, distance: 0.67323345, baseIndex: 62, name: '2', indices: [62, 58, 54, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2] },
    { angle: -41, distance: 0.67059234, baseIndex: 60, name: '3', indices: [60, 52, 44, 36, 28, 20, 12, 4] },
    { angle: 42.3, distance: 0.81888273, baseIndex: 2, name: 'A', indices: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62] },
    { angle: 35, distance: 0.73195538, baseIndex: 4, name: 'B', indices: [4, 12, 20, 28, 36, 44, 52, 60] },
    { angle: 19.8, distance: 0.60592194, baseIndex: 64, name: 'C', indices: [8, 16, 24, 32, 40, 48, 56] },
    { angle: 0, distance: 0.41817240, baseIndex: 64, name: 'D', indices: [64] },
  ]
};
