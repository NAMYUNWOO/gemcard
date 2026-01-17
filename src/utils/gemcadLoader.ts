import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { parseGemCad, generateGemGeometry } from './gemcadParser';

// Geometry cache to avoid redundant loading (memory cache)
const gemCadCache = new Map<string, THREE.BufferGeometry>();

// IndexedDB configuration for persistent caching
const DB_NAME = 'gemcard-geometry-cache';
const DB_VERSION = 1;
const STORE_NAME = 'geometries';

// Dynamic cache limit configuration
const DEFAULT_CACHE_SIZE = 1;
const PREMIUM_CACHE_SIZE = 5;
const CACHE_LIMIT_KEY = 'gemcard-cache-limit';

let cacheLimit = DEFAULT_CACHE_SIZE;

/**
 * Initialize cache limit from localStorage
 * Called at module load time
 */
function initCacheLimit(): void {
  try {
    const stored = localStorage.getItem(CACHE_LIMIT_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (parsed === PREMIUM_CACHE_SIZE) {
        cacheLimit = PREMIUM_CACHE_SIZE;
      }
    }
  } catch {
    // localStorage access failed, keep default
  }
}

// Initialize cache limit on module load
initCacheLimit();

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open IndexedDB connection (singleton pattern)
 */
function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'shapeId' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });

  return dbPromise;
}

/**
 * Convert BufferGeometry to ArrayBuffer (same format as prebuild-gems.mjs)
 * Binary format: [vertexCount (4 bytes)] [positions] [normals]
 */
function geometryToArrayBuffer(geometry: THREE.BufferGeometry): ArrayBuffer {
  const positions = geometry.getAttribute('position').array as Float32Array;
  const normals = geometry.getAttribute('normal').array as Float32Array;
  const vertexCount = geometry.getAttribute('position').count;

  const headerSize = 4;
  const positionsSize = vertexCount * 3 * 4;
  const normalsSize = vertexCount * 3 * 4;
  const totalSize = headerSize + positionsSize + normalsSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  view.setUint32(0, vertexCount, true); // little-endian

  new Float32Array(buffer, headerSize, vertexCount * 3).set(positions);
  new Float32Array(buffer, headerSize + positionsSize, vertexCount * 3).set(normals);

  return buffer;
}

/**
 * Convert ArrayBuffer to BufferGeometry
 */
function arrayBufferToGeometry(buffer: ArrayBuffer): THREE.BufferGeometry {
  const view = new DataView(buffer);
  const vertexCount = view.getUint32(0, true);

  const headerSize = 4;
  const positionsSize = vertexCount * 3 * 4;

  const positions = new Float32Array(buffer, headerSize, vertexCount * 3);
  const normals = new Float32Array(buffer, headerSize + positionsSize, vertexCount * 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals.slice(), 3));

  return geometry;
}

/**
 * Get geometry from IndexedDB cache
 * Updates timestamp on hit for LRU tracking
 */
async function getFromCache(shapeId: string): Promise<THREE.BufferGeometry | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(shapeId);

      request.onsuccess = () => {
        if (request.result?.data) {
          // Update timestamp for LRU
          store.put({ ...request.result, timestamp: Date.now() });
          resolve(arrayBufferToGeometry(request.result.data));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Set cache limit (called by payment system)
 * @param isPremium true for 5 items, false for 1 item
 * @deprecated Use setCacheLimitBySlots instead for dynamic slot-based caching
 */
export function setCacheLimit(isPremium: boolean): void {
  cacheLimit = isPremium ? PREMIUM_CACHE_SIZE : DEFAULT_CACHE_SIZE;
  try {
    localStorage.setItem(CACHE_LIMIT_KEY, String(cacheLimit));
  } catch {
    // localStorage save failed, ignore
  }
}

/**
 * Set cache limit by slot count
 * Allows dynamic caching based on purchased slots (1-10)
 * @param slots Number of slots (1-10)
 */
export function setCacheLimitBySlots(slots: number): void {
  cacheLimit = Math.min(Math.max(slots, 1), 10);
  try {
    localStorage.setItem(CACHE_LIMIT_KEY, String(cacheLimit));
  } catch {
    // localStorage save failed, ignore
  }
}

/**
 * Get current cache limit
 */
export function getCacheLimit(): number {
  return cacheLimit;
}

/**
 * Save geometry to IndexedDB cache with LRU eviction
 * Keeps maximum cacheLimit items (dynamic based on premium status)
 */
async function saveToCache(shapeId: string, geometry: THREE.BufferGeometry): Promise<void> {
  try {
    const db = await openDB();
    const data = geometryToArrayBuffer(geometry);

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Check current count and evict oldest if at max capacity
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      if (countRequest.result >= cacheLimit) {
        // Delete oldest item (lowest timestamp)
        const index = store.index('timestamp');
        const cursorRequest = index.openCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            cursor.delete();
          }
        };
      }
    };

    store.put({ shapeId, data, timestamp: Date.now() });
  } catch (e) {
    console.warn('Failed to cache geometry:', e);
  }
}

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
 * Load GemCad geometry by parsing .asc files at runtime
 * Results are cached to avoid redundant network requests and parsing
 *
 * This approach is optimized for App in Toss deployment:
 * - Only loads the gem shape when needed (lazy loading)
 * - Source .asc files are much smaller than pre-built binaries (8.8MB vs 416MB)
 * - Runtime CSG generation happens once per shape, then cached
 *
 * Caching strategy (3-tier):
 * 1. Memory cache (fastest, session-scoped)
 * 2. IndexedDB cache (persistent, LRU with dynamic limit: 1 free / 5 premium)
 * 3. .asc file parsing + CSG generation (slowest, network-dependent)
 */
export async function loadGemCadGeometry(shapeId: string): Promise<THREE.BufferGeometry> {
  // 1. Check memory cache first (fastest)
  if (gemCadCache.has(shapeId)) {
    return gemCadCache.get(shapeId)!.clone();
  }

  // 2. Check IndexedDB cache (persistent across sessions)
  const cached = await getFromCache(shapeId);
  if (cached) {
    gemCadCache.set(shapeId, cached);
    return cached.clone();
  }

  // 3. Parse .asc file and generate geometry using CSG
  const fileName = shapeId.endsWith('.asc') ? shapeId : `${shapeId}.asc`;
  const response = await fetch(`/gem_cads/${fileName}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${fileName}: ${response.status}`);
  }

  const content = await response.text();
  const gemcadData = parseGemCad(content);
  const geometry = generateGemGeometry(gemcadData, 1.0);

  // Store in memory cache
  gemCadCache.set(shapeId, geometry);

  // Store in IndexedDB cache (async, non-blocking)
  saveToCache(shapeId, geometry);

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
