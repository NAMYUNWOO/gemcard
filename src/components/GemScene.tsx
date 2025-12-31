import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SUBTRACTION, Evaluator, Brush } from 'three-bvh-csg';
import type { GemParams, GemShape } from '../types/card';
import { GemBackground, type GemBackgroundHandle } from './GemBackground';

interface GemSceneProps {
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
}

const FIXED_THICKNESS = 1.5;
const FIXED_DISPERSION = 0.05;

const VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vEye;
  varying vec4 vScreenPos;
  varying vec3 vLocalPos;
  void main() {
    vLocalPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vEye = normalize(worldPos.xyz - cameraPosition);
    vScreenPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = vScreenPos;
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D tBackground;
  uniform vec3 uColor;
  uniform float uThickness;
  uniform float uDispersion;
  uniform float uTurbidity;
  uniform float uContrast;
  uniform float uTime;
  uniform vec3 uLightPos;
  varying vec3 vNormal;
  varying vec3 vEye;
  varying vec4 vScreenPos;
  varying vec3 vLocalPos;

  float smoothStepFunc(float a, float b, float t) {
    t = clamp((t - a) / (b - a), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    vec2 uv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
    float dist = length(vLocalPos.xy);
    float displacementStrength = smoothStepFunc(1.5, 0.0, dist);

    vec3 refractVec = refract(vEye, vNormal, 1.0 / 2.41);
    vec2 refractOffset = refractVec.xy * 0.15 * uThickness * displacementStrength;

    float r = texture2D(tBackground, uv + refractOffset * (1.0 + uDispersion)).r;
    float g = texture2D(tBackground, uv + refractOffset).g;
    float b = texture2D(tBackground, uv + refractOffset * (1.0 - uDispersion)).b;

    vec3 baseColor = vec3(r, g, b) * uColor * 1.1;

    vec3 milkyTone = vec3(0.92, 0.92, 0.95);
    baseColor = mix(baseColor, milkyTone, uTurbidity * 0.7);

    // === FACET LIGHTING (강한 명암 대비) ===

    // 메인 라이트 (상단 우측)
    vec3 lightDir1 = normalize(uLightPos);
    vec3 halfDir1 = normalize(lightDir1 - vEye);
    float NdotL1 = dot(vNormal, lightDir1);

    // 보조 라이트 (하단 좌측) - 입체감 강화
    vec3 lightDir2 = normalize(vec3(-3.0, -2.0, 4.0));
    float NdotL2 = dot(vNormal, lightDir2);

    // 내부 대비 (uContrast로 면들 사이 명암 차이 조절)
    float shadowMask = max(NdotL1, 0.3);
    float contrastStrength = mix(0.1, 0.5, uContrast); // 대비 강도
    baseColor *= (1.0 - contrastStrength + contrastStrength * shadowMask);
    // 보조 라이트로 입체감 (대비에 따라 강도 조절)
    baseColor *= (1.0 + max(NdotL2, 0.0) * mix(0.05, 0.2, uContrast));

    // 날카로운 스펙큘러 (면마다 다르게 반짝임)
    float spec1 = pow(max(dot(vNormal, halfDir1), 0.0), 256.0);
    baseColor = mix(baseColor, vec3(1.3), spec1 * 0.7);

    // 보조 스펙큘러 (반대편 하이라이트)
    vec3 halfDir2 = normalize(lightDir2 - vEye);
    float spec2 = pow(max(dot(vNormal, halfDir2), 0.0), 128.0);
    baseColor = mix(baseColor, vec3(1.1), spec2 * 0.3);

    // 프레넬 (테두리 강조)
    float fresnel = pow(1.0 - max(dot(vNormal, -vEye), 0.0), 3.0);
    baseColor += vec3(0.12, 0.18, 0.25) * fresnel * 0.4;

    // 흰색/밝은 보석일 때 추가 대비
    float colorBrightness = (uColor.r + uColor.g + uColor.b) / 3.0;
    if (colorBrightness > 0.85) {
      // 면 방향에 따른 미세한 색조 변화로 입체감
      float facetTint = dot(vNormal, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
      baseColor *= mix(0.92, 1.08, facetTint);
    }

    gl_FragColor = vec4(baseColor, 1.0);
  }
`;

// CSG-based Standard Brilliant cut
function createBrilliantCSG(): THREE.BufferGeometry {
  const evaluator = new Evaluator();
  const gearTeeth = 64;
  const scale = 1.0;

  // Standard Brilliant facet data from GemCad
  const facets = [
    { angle: 90, distance: 1.08976142, indices: [62, 58, 54, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2] },
    { angle: -42.1, distance: 0.67323345, indices: [62, 58, 54, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2] },
    { angle: -41, distance: 0.67059234, indices: [60, 52, 44, 36, 28, 20, 12, 4] },
    { angle: 42.3, distance: 0.81888273, indices: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62] },
    { angle: 35, distance: 0.73195538, indices: [4, 12, 20, 28, 36, 44, 52, 60] },
    { angle: 19.8, distance: 0.60592194, indices: [8, 16, 24, 32, 40, 48, 56] },
    { angle: 0, distance: 0.41817240, indices: [0] }, // Table
  ];

  // Start with a cylinder
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
        // Table (horizontal up)
        normal = new THREE.Vector3(0, 1, 0);
      } else if (Math.abs(facet.angle - 90) < 0.01) {
        // Girdle (vertical outward)
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

      // Create cutting box
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
        console.warn('CSG failed', e);
      }
    }
  }

  const geometry = result.geometry.clone();
  if (geometry.index !== null) {
    const nonIndexed = geometry.toNonIndexed();
    nonIndexed.computeVertexNormals();
    return nonIndexed;
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createGemGeometry(shape: GemShape, detail: number): THREE.BufferGeometry {
  let geometry: THREE.BufferGeometry;
  const h = 1.6;
  const cH = h * 0.33;
  const pH = h * 0.67;

  switch (shape) {
    case 'brilliant': {
      // Use CSG-based Standard Brilliant
      try {
        return createBrilliantCSG();
      } catch (e) {
        console.error('CSG Brilliant failed, using fallback', e);
        // Fallback to simple geometry
        const bG = new THREE.CylinderGeometry(1.0, 1.0, 0.05, 16 + detail * 8);
        const bC = new THREE.CylinderGeometry(0.65, 1.0, cH, 16 + detail * 8);
        const bP = new THREE.CylinderGeometry(1.0, 0.01, pH, 16 + detail * 8);
        bC.translate(0, cH / 2 + 0.025, 0);
        bP.translate(0, -pH / 2 - 0.025, 0);
        geometry = mergeGeometries([bG, bC, bP])!;
        break;
      }
    }
    case 'emerald': {
      const eG = new THREE.CylinderGeometry(0.8, 0.82, 0.05, Math.max(4, 8 + detail * 2));
      const eC = new THREE.CylinderGeometry(0.6, 0.8, cH, Math.max(4, 8 + detail * 2), Math.max(1, detail + 1));
      const eP = new THREE.CylinderGeometry(0.82, 0.1, pH, Math.max(4, 8 + detail * 2), Math.max(1, detail + 1));
      eC.translate(0, cH / 2 + 0.025, 0);
      eP.translate(0, -pH / 2 - 0.025, 0);
      geometry = mergeGeometries([eG, eC, eP])!;
      geometry.scale(1.2, 1, 0.9);
      break;
    }
    case 'princess': {
      const segments = 4;
      const girdleSize = 1.15;
      const tableSize = 0.75;
      const culetSize = 0.05;

      const pG = new THREE.CylinderGeometry(girdleSize * 0.707, girdleSize * 0.707, 0.05, segments);
      const pC = new THREE.CylinderGeometry(tableSize * 0.707, girdleSize * 0.707, cH, segments);
      const pP = new THREE.CylinderGeometry(girdleSize * 0.707, culetSize, pH, segments);

      pG.rotateY(Math.PI / 4);
      pC.rotateY(Math.PI / 4);
      pP.rotateY(Math.PI / 4);

      pC.translate(0, (cH + 0.05) / 2, 0);
      pP.translate(0, -(pH + 0.05) / 2, 0);

      geometry = mergeGeometries([pG, pC, pP])!;
      break;
    }
    case 'pear': {
      geometry = new THREE.SphereGeometry(1, Math.max(6, 14 + detail * 6), Math.max(4, 12 + detail * 6));
      const posP = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posP.count; i++) {
        const x = posP.getX(i);
        let y = posP.getY(i);
        let z = posP.getZ(i);
        if (y > 0) {
          const f = 1.0 - y * 0.7;
          posP.setX(i, x * f);
          posP.setZ(i, z * f);
          posP.setY(i, y * 0.8);
          y = y * 0.8;
          z = z * f;
        } else {
          posP.setY(i, y * 1.5);
          y = y * 1.5;
        }
        posP.setZ(i, z + Math.pow(y + 1, 2) * 0.12);
      }
      posP.needsUpdate = true;
      break;
    }
    case 'oval': {
      geometry = new THREE.SphereGeometry(1, Math.max(6, 16 + detail * 8), Math.max(4, 12 + detail * 6));
      geometry.scale(0.85, 1.35, 0.85);
      break;
    }
    case 'sphere': {
      // 완전한 매끈한 구체 (facet 없음)
      const sphereSegments = Math.max(32, 48 + detail * 8);
      geometry = new THREE.SphereGeometry(1.2, sphereSegments, sphereSegments);
      // sphere는 toNonIndexed() 호출하지 않음 - 매끈하게 유지
      geometry.computeVertexNormals();
      return geometry;
    }
    default: {
      if (detail <= -3) {
        geometry = new THREE.TetrahedronGeometry(1.2);
      } else if (detail === -2) {
        geometry = new THREE.OctahedronGeometry(1.2);
      } else if (detail === -1) {
        geometry = new THREE.DodecahedronGeometry(1.2);
      } else {
        const bG = new THREE.CylinderGeometry(1.0, 1.0, 0.05, 16 + detail * 8);
        const bC = new THREE.CylinderGeometry(0.65, 1.0, cH, 16 + detail * 8);
        const bP = new THREE.CylinderGeometry(1.0, 0.01, pH, 16 + detail * 8);
        bC.translate(0, cH / 2 + 0.025, 0);
        bP.translate(0, -pH / 2 - 0.025, 0);
        geometry = mergeGeometries([bG, bC, bP])!;
      }
    }
  }

  if (geometry.index !== null) {
    geometry = geometry.toNonIndexed();
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function GemScene({ params, contrast = 0.5, autoRotate = true, className, dynamicBackground = false, backgroundImage, disableDrag = false, cardMessage, senderName, maxChars }: GemSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<GemBackgroundHandle>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const disableDragRef = useRef(disableDrag);
  disableDragRef.current = disableDrag;

  // 컨테이너 크기 측정
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

    // 초기 측정
    updateDimensions();

    // ResizeObserver로 크기 변화 감지
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    gemstone: THREE.Mesh | null;
    animationId: number;
    isDragging: boolean;
    rotationVelocityX: number;
    rotationVelocityY: number;
    previousMouseX: number;
    previousMouseY: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    // Add renderer canvas with higher z-index
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '1';
    container.appendChild(renderer.domElement);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      gemstone: null,
      animationId: 0,
      isDragging: false,
      rotationVelocityX: 0,
      rotationVelocityY: 0.008,
      previousMouseX: 0,
      previousMouseY: 0,
    };

    // Create gem mesh after a short delay to let background texture load
    setTimeout(() => {
      createGemMesh(params);
    }, 100);

    // Drag rotation handlers - pointer events only on canvas
    const canvas = renderer.domElement;

    // 드래그 상태는 sceneRef.current.isDragging 단일 소스 사용
    let previousMouseX = 0;
    let previousMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      // canvas에서 직접 발생한 이벤트만 처리, disableDrag 체크
      if (e.target !== canvas || !sceneRef.current || disableDragRef.current) return;
      sceneRef.current.isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
      canvas.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current?.isDragging || disableDragRef.current) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;
      sceneRef.current.rotationVelocityY = deltaX * 0.008;
      sceneRef.current.rotationVelocityX = deltaY * 0.008;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      if (sceneRef.current) sceneRef.current.isDragging = false;
      canvas.style.cursor = 'grab';
    };

    // window focus 잃으면 드래그 해제 (컬러피커 팝업 대응)
    const onBlur = () => {
      if (sceneRef.current) sceneRef.current.isDragging = false;
      canvas.style.cursor = 'grab';
    };

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      if (e.target !== canvas || e.touches.length !== 1 || !sceneRef.current || disableDragRef.current) return;
      sceneRef.current.isDragging = true;
      previousMouseX = e.touches[0].clientX;
      previousMouseY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!sceneRef.current?.isDragging || e.touches.length !== 1 || disableDragRef.current) return;
      const deltaX = e.touches[0].clientX - previousMouseX;
      const deltaY = e.touches[0].clientY - previousMouseY;
      sceneRef.current.rotationVelocityY = deltaX * 0.008;
      sceneRef.current.rotationVelocityX = deltaY * 0.008;
      previousMouseX = e.touches[0].clientX;
      previousMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      if (sceneRef.current) sceneRef.current.isDragging = false;
    };

    // 모든 마우스 이벤트를 canvas에만 붙임
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    // 터치 이벤트
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);
    // blur는 window에
    window.addEventListener('blur', onBlur);

    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'none';

    // Animation loop
    const damping = 0.96;
    const baseAutoRotation = 0.003;

    const animate = () => {
      if (!sceneRef.current) return;

      const time = performance.now() * 0.001;
      const { gemstone, isDragging } = sceneRef.current;

      // Update dynamic background & sync texture
      if (backgroundRef.current) {
        if (dynamicBackground || cardMessage) {
          backgroundRef.current.update();
        }
        // 텍스처가 변경되었을 수 있으므로 항상 최신 텍스처로 동기화
        const currentTexture = backgroundRef.current.getTexture();
        if (gemstone && currentTexture) {
          const material = gemstone.material as THREE.ShaderMaterial;
          if (material.uniforms.tBackground.value !== currentTexture) {
            material.uniforms.tBackground.value = currentTexture;
          }
        }
      }

      if (gemstone) {
        // Inertia rotation
        if (!isDragging) {
          sceneRef.current.rotationVelocityX *= damping;
          sceneRef.current.rotationVelocityY *= damping;

          if (Math.abs(sceneRef.current.rotationVelocityY) < baseAutoRotation &&
              Math.abs(sceneRef.current.rotationVelocityX) < 0.001 && autoRotate) {
            sceneRef.current.rotationVelocityY = baseAutoRotation;
          }
        }
        gemstone.rotation.y += sceneRef.current.rotationVelocityY;
        gemstone.rotation.x += sceneRef.current.rotationVelocityX;
        gemstone.position.y = Math.sin(time * 0.4) * 0.05;

        const material = gemstone.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = time;
        material.uniforms.uLightPos.value.set(
          Math.sin(time * 2) * 5,
          5,
          Math.cos(time * 2) * 5
        );
      }

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!sceneRef.current || !containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.renderer.dispose();
        if (sceneRef.current.gemstone) {
          sceneRef.current.gemstone.geometry.dispose();
          (sceneRef.current.gemstone.material as THREE.Material).dispose();
        }
      }
      // Remove only renderer canvas, background component handles its own cleanup
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [dynamicBackground, backgroundImage, cardMessage, senderName]);

  useEffect(() => {
    if (sceneRef.current) {
      createGemMesh(params);
    }
  }, [params.shape, params.color, params.turbidity, params.detailLevel, contrast]);

  // contrast만 변경 시 uniform만 업데이트 (성능 최적화)
  useEffect(() => {
    if (sceneRef.current?.gemstone) {
      const material = sceneRef.current.gemstone.material as THREE.ShaderMaterial;
      material.uniforms.uContrast.value = contrast;
    }
  }, [contrast]);

  function createGemMesh(p: Omit<GemParams, 'id'>) {
    if (!sceneRef.current) return;

    const { scene, gemstone: oldGem } = sceneRef.current;

    if (oldGem) {
      scene.remove(oldGem);
      oldGem.geometry.dispose();
      (oldGem.material as THREE.Material).dispose();
    }

    // Get texture from background component
    let texture = backgroundRef.current?.getTexture();

    // Fallback texture if background not ready
    if (!texture) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#667eea');
      grad.addColorStop(0.5, '#764ba2');
      grad.addColorStop(1, '#f093fb');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }

    const geometry = createGemGeometry(p.shape, p.detailLevel);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tBackground: { value: texture },
        uColor: { value: new THREE.Color(p.color) },
        uThickness: { value: FIXED_THICKNESS },
        uDispersion: { value: FIXED_DISPERSION },
        uTurbidity: { value: p.turbidity },
        uContrast: { value: contrast },
        uTime: { value: 0 },
        uLightPos: { value: new THREE.Vector3(5, 5, 5) },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    sceneRef.current.gemstone = mesh;
  }

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {dimensions.width > 0 && dimensions.height > 0 && (
        <GemBackground
          ref={backgroundRef}
          width={dimensions.width}
          height={dimensions.height}
          dynamicBackground={dynamicBackground}
          backgroundImage={backgroundImage}
          cardMessage={cardMessage}
          senderName={senderName}
          maxChars={maxChars}
        />
      )}
    </div>
  );
}
