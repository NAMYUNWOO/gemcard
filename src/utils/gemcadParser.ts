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

  // 줄 연속 처리를 위해 전체 내용을 먼저 정리
  let combinedContent = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // 줄이 공백으로 시작하면 이전 줄에 연결 (연속된 인덱스)
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
          // H 라인에서 코드(예: PC 01.006, PC 08.087D) 이후의 컷 이름만 추출
          const fullText = parts.slice(1).join(' ');
          // PC XX.XXXD 패턴도 처리 (숫자 뒤에 문자 포함)
          const match = fullText.match(/^[A-Z]{2}\s*[\d.]+[A-Z]?\s+(.+)$/);
          if (match) {
            data.name = match[1].trim();
          } else {
            data.name = fullText;
          }
        }
        break;
      case 'a': {
        // 두 가지 형식 지원:
        // 1. a angle distance baseIndex n name [indices...]
        // 2. a angle distance index1 index2 index3 ... (n 없는 형식)
        const angle = parseFloat(parts[1]);
        const distance = parseFloat(parts[2]);

        const nIndex = parts.indexOf('n');
        if (nIndex !== -1) {
          // 형식 1: n 구분자가 있는 경우
          const baseIndex = parseInt(parts[3]);
          const name = parts[nIndex + 1] || '';
          const indices = parts.slice(nIndex + 2).map(s => parseInt(s)).filter(n => !isNaN(n));
          if (indices.length === 0) {
            indices.push(baseIndex);
          }
          data.facets.push({ angle, distance, baseIndex, name, indices });
        } else {
          // 형식 2: n 없이 인덱스가 바로 나열된 경우
          const indices = parts.slice(3).map(s => parseInt(s)).filter(n => !isNaN(n));
          const baseIndex = indices[0] || 0;
          data.facets.push({ angle, distance, baseIndex, name: '', indices });
        }
        break;
      }
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
  let geometry = result.geometry.clone();
  if (geometry.index !== null) {
    geometry = geometry.toNonIndexed();
  }

  // Flat normals 계산 (각 face별로 동일한 normal)
  computeFlatNormals(geometry);

  return geometry;
}

// 각 삼각형 face에 대해 flat normal 계산
function computeFlatNormals(geometry: THREE.BufferGeometry): void {
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

    normalArray[i * 3] = normal.x;
    normalArray[i * 3 + 1] = normal.y;
    normalArray[i * 3 + 2] = normal.z;

    normalArray[(i + 1) * 3] = normal.x;
    normalArray[(i + 1) * 3 + 1] = normal.y;
    normalArray[(i + 1) * 3 + 2] = normal.z;

    normalArray[(i + 2) * 3] = normal.x;
    normalArray[(i + 2) * 3 + 1] = normal.y;
    normalArray[(i + 2) * 3 + 2] = normal.z;
  }

  geometry.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3));
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
