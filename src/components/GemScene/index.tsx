import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import type { GemParams } from '../../types/card';
import { loadGemCadList } from '../../types/card';
import { loadGemCadGeometry, createFallbackBrilliantGeometry } from '../../utils/gemcadLoader';
import { GemBackground, type GemBackgroundHandle } from '../GemBackground';
import { GEM_VERTEX_SHADER, GEM_FRAGMENT_SHADER } from '../../shaders';
import { GEM_CONSTANTS } from '../../constants/gem';
import { useDragRotation } from '../../hooks';

// ============================================================================
// Types
// ============================================================================

export interface GemSceneProps {
  params: Omit<GemParams, 'id'>;
  contrast?: number;
  autoRotate?: boolean;
  className?: string;
  dynamicBackground?: boolean;
  backgroundImage?: string;
  disableDrag?: boolean;
  cardMessage?: string;
  senderName?: string;
  maxChars?: number;
  magicCircle?: number; // 1-16 for magic circle SVG
}

interface SceneState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  gemstone: THREE.Mesh | null;
  animationId: number;
  gemVersion: number; // Track async gem creation to prevent race conditions
}

// ============================================================================
// Utility Functions
// ============================================================================

function createFallbackTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 밝은 방사형 그라데이션 (폴백용)
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(0.4, '#FFF8F0');
  gradient.addColorStop(0.7, '#F0E6FF');
  gradient.addColorStop(1, '#E8E0F0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createGemMaterial(
  texture: THREE.Texture,
  color: string,
  turbidity: number,
  contrast: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      tBackground: { value: texture },
      uColor: { value: new THREE.Color(color) },
      uThickness: { value: GEM_CONSTANTS.FIXED_THICKNESS },
      uDispersion: { value: GEM_CONSTANTS.FIXED_DISPERSION },
      uTurbidity: { value: turbidity },
      uContrast: { value: contrast },
      uTime: { value: 0 },
      uLightPos: { value: new THREE.Vector3(5, 5, 5) },
    },
    vertexShader: GEM_VERTEX_SHADER,
    fragmentShader: GEM_FRAGMENT_SHADER,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

// ============================================================================
// Main Component
// ============================================================================

export function GemScene({
  params,
  contrast = 0.5,
  autoRotate = true,
  className,
  dynamicBackground = false,
  backgroundImage,
  disableDrag = false,
  cardMessage,
  senderName,
  maxChars,
  magicCircle,
}: GemSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<GemBackgroundHandle>(null);
  const sceneRef = useRef<SceneState | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const zoomRef = useRef<number>(GEM_CONSTANTS.CAMERA_Z);
  const pinchRef = useRef<{ initialDistance: number; initialZoom: number } | null>(null);

  // Drag rotation hook
  const dragRotation = useDragRotation({
    disabled: disableDrag,
    autoRotate,
  });

  // Preload GemCad list
  useEffect(() => {
    loadGemCadList();
  }, []);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Create gem mesh
  const createGemMesh = useCallback(
    async (p: Omit<GemParams, 'id'>) => {
      if (!sceneRef.current) return;

      // Increment version to invalidate any pending async operations
      sceneRef.current.gemVersion++;
      const currentVersion = sceneRef.current.gemVersion;

      // Remove existing gem
      if (sceneRef.current.gemstone) {
        sceneRef.current.scene.remove(sceneRef.current.gemstone);
        sceneRef.current.gemstone.geometry.dispose();
        (sceneRef.current.gemstone.material as THREE.Material).dispose();
        sceneRef.current.gemstone = null;
      }

      // Get texture
      const texture = backgroundRef.current?.getTexture() || createFallbackTexture();

      // Load geometry
      let geometry: THREE.BufferGeometry;
      try {
        geometry = await loadGemCadGeometry(p.shape);
      } catch (e) {
        console.error('Failed to load GemCad geometry:', e);
        geometry = createFallbackBrilliantGeometry();
      }

      // Verify scene is still valid and version hasn't changed after async operation
      const currentState = sceneRef.current;
      if (!currentState || currentState.gemVersion !== currentVersion) {
        // A newer gem creation was started, discard this one
        geometry.dispose();
        return;
      }

      // Double check and remove any gem that might have been added by a race condition
      const existingGem = currentState.gemstone;
      if (existingGem) {
        currentState.scene.remove(existingGem);
        existingGem.geometry.dispose();
        (existingGem.material as THREE.Material).dispose();
      }

      const material = createGemMaterial(texture, p.color, p.turbidity, contrast);
      const mesh = new THREE.Mesh(geometry, material);
      currentState.scene.add(mesh);
      currentState.gemstone = mesh;
    },
    [contrast]
  );

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      GEM_CONSTANTS.CAMERA_FOV,
      width / height,
      GEM_CONSTANTS.CAMERA_NEAR,
      GEM_CONSTANTS.CAMERA_FAR
    );
    camera.position.set(0, 0, GEM_CONSTANTS.CAMERA_Z);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = GEM_CONSTANTS.TONE_MAPPING_EXPOSURE;

    // Style renderer canvas
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '1';
    container.appendChild(renderer.domElement);

    // Initialize scene state
    sceneRef.current = {
      scene,
      camera,
      renderer,
      gemstone: null,
      animationId: 0,
      gemVersion: 0,
    };

    // Attach drag rotation handlers
    const cleanupDrag = dragRotation.attachTo(renderer.domElement);

    // Zoom handlers (Ctrl/Cmd + wheel to zoom)
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // Allow normal scroll
      const delta = e.deltaY * GEM_CONSTANTS.ZOOM_SENSITIVITY;
      zoomRef.current = Math.max(
        GEM_CONSTANTS.CAMERA_Z_MIN,
        Math.min(GEM_CONSTANTS.CAMERA_Z_MAX, zoomRef.current + delta)
      );
    };

    const getTouchDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = {
          initialDistance: getTouchDistance(e.touches),
          initialZoom: zoomRef.current,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const currentDistance = getTouchDistance(e.touches);
        const scale = pinchRef.current.initialDistance / currentDistance;
        zoomRef.current = Math.max(
          GEM_CONSTANTS.CAMERA_Z_MIN,
          Math.min(GEM_CONSTANTS.CAMERA_Z_MAX, pinchRef.current.initialZoom * scale)
        );
      }
    };

    const handleTouchEnd = () => {
      pinchRef.current = null;
    };

    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('touchstart', handleTouchStart);
    renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', handleTouchEnd);

    // Create initial gem immediately with fallback texture if needed
    const initTimeout = setTimeout(() => {
      if (sceneRef.current && !sceneRef.current.gemstone) {
        createGemMesh(params);
      }
    }, 50);

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;

      const time = performance.now() * 0.001;
      const { gemstone } = sceneRef.current;

      // Update background
      if (backgroundRef.current) {
        if (dynamicBackground || cardMessage) {
          backgroundRef.current.update();
        }

        // Sync texture
        const currentTexture = backgroundRef.current.getTexture();
        if (gemstone && currentTexture) {
          const material = gemstone.material as THREE.ShaderMaterial;
          if (material.uniforms.tBackground.value !== currentTexture) {
            material.uniforms.tBackground.value = currentTexture;
          }
        }
      }

      if (gemstone) {
        // Update rotation from drag hook
        const { rotationX, rotationY } = dragRotation.update();
        gemstone.rotation.y += rotationY;
        gemstone.rotation.x += rotationX;

        // Floating animation
        gemstone.position.y =
          Math.sin(time * GEM_CONSTANTS.FLOAT_SPEED) * GEM_CONSTANTS.FLOAT_AMPLITUDE;

        // Update uniforms
        const material = gemstone.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = time;

        // Pendulum light swing
        const swingAngle =
          Math.sin(time * GEM_CONSTANTS.LIGHT_SWING_SPEED) * GEM_CONSTANTS.LIGHT_SWING_ANGLE;
        material.uniforms.uLightPos.value.set(
          Math.sin(swingAngle) * GEM_CONSTANTS.LIGHT_DISTANCE,
          0,
          Math.cos(swingAngle) * GEM_CONSTANTS.LIGHT_DISTANCE
        );
      }

      // Update camera zoom
      camera.position.z = zoomRef.current;

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!sceneRef.current || !containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearTimeout(initTimeout);
      cleanupDrag();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      renderer.domElement.removeEventListener('touchmove', handleTouchMove);
      renderer.domElement.removeEventListener('touchend', handleTouchEnd);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        // Invalidate any pending async gem creation
        sceneRef.current.gemVersion++;
        // Remove and dispose gem properly
        if (sceneRef.current.gemstone) {
          sceneRef.current.scene.remove(sceneRef.current.gemstone);
          sceneRef.current.gemstone.geometry.dispose();
          (sceneRef.current.gemstone.material as THREE.Material).dispose();
          sceneRef.current.gemstone = null;
        }
        sceneRef.current.renderer.dispose();
      }

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
    // Note: params is intentionally not in deps - initial creation uses captured value,
    // subsequent changes are handled by the params useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicBackground, backgroundImage, cardMessage, senderName, createGemMesh, dragRotation]);

  // Update gem when params change (after initial creation)
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip on initial mount - let the setTimeout in main effect handle it
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (sceneRef.current) {
      createGemMesh(params);
    }
  }, [params.shape, params.color, params.turbidity, params.detailLevel, createGemMesh]);

  // Update contrast uniform only (performance optimization)
  useEffect(() => {
    if (sceneRef.current?.gemstone) {
      const material = sceneRef.current.gemstone.material as THREE.ShaderMaterial;
      material.uniforms.uContrast.value = contrast;
    }
  }, [contrast]);

  // Use minimum dimensions to ensure background is always ready
  const bgWidth = Math.max(dimensions.width, 350);
  const bgHeight = Math.max(dimensions.height, 350);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '100%', position: 'relative' }}
    >
      <GemBackground
        ref={backgroundRef}
        width={bgWidth}
        height={bgHeight}
        dynamicBackground={dynamicBackground}
        backgroundImage={backgroundImage}
        cardMessage={cardMessage}
        senderName={senderName}
        maxChars={maxChars}
        magicCircle={magicCircle}
      />
    </div>
  );
}
