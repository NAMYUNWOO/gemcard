import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { parseGemCad, generateGemGeometry } from './gemcadParser';

// Geometry cache to avoid redundant loading
const gemCadCache = new Map<string, THREE.BufferGeometry>();

/**
 * Compute flat normals for each triangle face
 * This creates sharp edges between facets, essential for gem rendering
 */
export function computeFlatNormals(geometry: THREE.BufferGeometry): void {
  const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
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

    // Apply same normal to all three vertices of the face
    for (let j = 0; j < 3; j++) {
      normalArray[(i + j) * 3] = normal.x;
      normalArray[(i + j) * 3 + 1] = normal.y;
      normalArray[(i + j) * 3 + 2] = normal.z;
    }
  }

  geometry.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3));
}

/**
 * Create a fallback Standard Brilliant geometry using CSG
 * Used when GemCad file loading fails
 */
export function createFallbackBrilliantGeometry(): THREE.BufferGeometry {
  const evaluator = new Evaluator();
  const gearTeeth = 64;
  const scale = 1.0;

  // Standard Brilliant facet data
  const facets = [
    { angle: 90, distance: 1.08976142, indices: [62, 58, 54, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2] },
    { angle: -42.1, distance: 0.67323345, indices: [62, 58, 54, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2] },
    { angle: -41, distance: 0.67059234, indices: [60, 52, 44, 36, 28, 20, 12, 4] },
    { angle: 42.3, distance: 0.81888273, indices: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62] },
    { angle: 35, distance: 0.73195538, indices: [4, 12, 20, 28, 36, 44, 52, 60] },
    { angle: 19.8, distance: 0.60592194, indices: [8, 16, 24, 32, 40, 48, 56] },
    { angle: 0, distance: 0.41817240, indices: [0] }, // Table
  ];

  const maxDist = Math.max(...facets.map(f => f.distance));
  const baseRadius = maxDist * scale * 1.5;
  const baseHeight = maxDist * scale * 3;

  const baseCylinder = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 64);
  let result = new Brush(baseCylinder);
  result.updateMatrixWorld();

  for (const facet of facets) {
    const angleRad = (facet.angle * Math.PI) / 180;
    const dist = facet.distance * scale;

    for (const idx of facet.indices) {
      const azimuth = (idx / gearTeeth) * 2 * Math.PI;

      let normal: THREE.Vector3;

      if (Math.abs(facet.angle) < 0.01) {
        normal = new THREE.Vector3(0, 1, 0);
      } else if (Math.abs(facet.angle - 90) < 0.01) {
        normal = new THREE.Vector3(Math.cos(azimuth), 0, Math.sin(azimuth));
      } else {
        const tiltAngle = Math.abs(angleRad);
        const isDown = facet.angle < 0;
        const radialX = Math.cos(azimuth);
        const radialZ = Math.sin(azimuth);
        const hComp = Math.sin(tiltAngle);
        const vComp = Math.cos(tiltAngle) * (isDown ? -1 : 1);
        normal = new THREE.Vector3(radialX * hComp, vComp, radialZ * hComp).normalize();
      }

      const boxSize = baseRadius * 4;
      const cuttingBox = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
      const cuttingBrush = new Brush(cuttingBox);

      cuttingBrush.position.copy(normal.clone().multiplyScalar(dist + boxSize / 2));

      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
      cuttingBrush.quaternion.copy(quat);
      cuttingBrush.updateMatrixWorld();

      try {
        result = evaluator.evaluate(result, cuttingBrush, SUBTRACTION);
        result.updateMatrixWorld();
      } catch (e) {
        console.warn('CSG operation failed:', e);
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

/**
 * Load GemCad geometry from .asc file
 * Results are cached to avoid redundant network requests and parsing
 */
export async function loadGemCadGeometry(shapeId: string): Promise<THREE.BufferGeometry> {
  // Check cache first
  if (gemCadCache.has(shapeId)) {
    return gemCadCache.get(shapeId)!.clone();
  }

  const fileName = shapeId.endsWith('.asc') ? shapeId : `${shapeId}.asc`;
  const response = await fetch(`/gem_cads/${fileName}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${fileName}: ${response.status}`);
  }

  const content = await response.text();
  const gemcadData = parseGemCad(content);
  const geometry = generateGemGeometry(gemcadData, 1.0);

  // Store in cache
  gemCadCache.set(shapeId, geometry);

  return geometry.clone();
}

/**
 * Clear the geometry cache
 * Useful for memory management or forcing reload
 */
export function clearGeometryCache(): void {
  gemCadCache.forEach(geometry => geometry.dispose());
  gemCadCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: gemCadCache.size,
    keys: Array.from(gemCadCache.keys()),
  };
}
