import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';

interface FloatingChar {
  char: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rotation: number;
  rotationSpeed: number;
  fontSize: number;
  opacity: number;
  glowPhase: number;
  glowSpeed: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface EnergyParticle {
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  hue: number;
}

interface EnergyRing {
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  thickness: number;
}

interface GeometricSigil {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'hexagon' | 'triangle' | 'pentagram' | 'square' | 'circle';
  drawProgress: number; // 0-1 그려지는 진행도
  lifePhase: 'drawing' | 'glowing' | 'fading';
  alpha: number;
  maxAlpha: number;
  lifetime: number;
  age: number;
}

// 신성한 룬 문자
const RUNE_CHARS = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ',
  'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ',
  '✧', '⟡', '◈', '✴', '❋'
];

interface GemBackgroundProps {
  width: number;
  height: number;
  dynamicBackground?: boolean;
  backgroundImage?: string;
  cardMessage?: string;
  senderName?: string;
  maxChars?: number;
  magicCircle?: number; // 1-20 for circle SVG
}

export interface GemBackgroundHandle {
  getTexture: () => THREE.Texture | null;
  update: () => void;
}

export const GemBackground = forwardRef<GemBackgroundHandle, GemBackgroundProps>(
  ({ width, height, dynamicBackground = false, backgroundImage, cardMessage, senderName, maxChars = 30, magicCircle }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const textureRef = useRef<THREE.CanvasTexture | THREE.Texture | null>(null);
    const magicCircleImgRef = useRef<HTMLImageElement | null>(null);
    const animationDataRef = useRef<{
      floatingChars: FloatingChar[];
      particles: EnergyParticle[];
      rings: EnergyRing[];
      sigils: GeometricSigil[];
      time: number;
      centerPulse: number;
      nextSigilTime: number;
    }>({ floatingChars: [], particles: [], rings: [], sigils: [], time: 0, centerPulse: 0, nextSigilTime: 2 });

    // 카드 메시지 플로팅 배경 초기화
    const initFloatingMessage = (w: number, h: number, message: string, sender?: string) => {
      const canvas = document.createElement('canvas');
      const dpr = window.devicePixelRatio;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvasRef.current = canvas;

      // 메시지 + 보내는 사람 합치기 (maxChars로 제한)
      const fullText = (message + (sender ? ` - ${sender}` : '')).slice(0, maxChars);

      // 각 글자에 대해 FloatingChar 생성
      const chars: FloatingChar[] = [];
      for (let i = 0; i < fullText.length; i++) {
        const char = fullText[i];
        if (char === ' ') continue; // 공백은 스킵

        chars.push({
          char,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          dx: (Math.random() - 0.5) * 1.2 * dpr,
          dy: (Math.random() - 0.5) * 1.2 * dpr,
          rotation: (Math.random() - 0.5) * 30, // -15 ~ +15도
          rotationSpeed: (Math.random() - 0.5) * 0.5,
          fontSize: (24 + Math.random() * 8) * dpr, // 24-32px
          opacity: 0.6 + Math.random() * 0.3,
          glowPhase: Math.random() * Math.PI * 2,
          glowSpeed: 0.02,
          trail: [],
        });
      }

      animationDataRef.current = {
        floatingChars: chars,
        particles: [],
        rings: [],
        sigils: [],
        time: 0,
        centerPulse: 0,
        nextSigilTime: 0,
      };

      // 텍스처 생성
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      textureRef.current = texture;

      return canvas;
    };

    // 카드 메시지 플로팅 배경 업데이트
    const updateFloatingMessage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { floatingChars } = animationDataRef.current;

      // 1. 크림색 배경
      ctx.fillStyle = '#FDF8E8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. 각 글자 업데이트 및 렌더링
      ctx.fillStyle = '#4A4A4A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const charData of floatingChars) {
        // 위치 업데이트
        charData.x += charData.dx;
        charData.y += charData.dy;
        charData.rotation += charData.rotationSpeed;

        // 경계 충돌 처리 (튕겨나감)
        if (charData.x < 0 || charData.x > canvas.width) {
          charData.dx *= -1;
          charData.x = Math.max(0, Math.min(canvas.width, charData.x));
        }
        if (charData.y < 0 || charData.y > canvas.height) {
          charData.dy *= -1;
          charData.y = Math.max(0, Math.min(canvas.height, charData.y));
        }

        // 글자 렌더링
        ctx.save();
        ctx.translate(charData.x, charData.y);
        ctx.rotate((charData.rotation * Math.PI) / 180);
        ctx.font = `${charData.fontSize}px 'Nanum Pen Script', cursive`;
        ctx.fillText(charData.char, 0, 0);
        ctx.restore();
      }

      // 텍스처 업데이트
      if (textureRef.current instanceof THREE.CanvasTexture) {
        textureRef.current.needsUpdate = true;
      }
    };

    // 동적 마법 배경 업데이트 - The Arcane Inscription
    const updateDynamicRunes = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const data = animationDataRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.min(w, h) * 0.48;

      data.time += 0.008;
      data.centerPulse += 0.015;

      // === 1. 밝은 아이보리-라벤더 그라데이션 배경 ===
      const bgGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.8);
      bgGradient.addColorStop(0, '#FDFCFA');
      bgGradient.addColorStop(0.3, '#FAF8F5');
      bgGradient.addColorStop(0.6, '#F4F1EC');
      bgGradient.addColorStop(1, '#EBE7F0');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, w, h);

      // === 1.5 마법진 SVG 그리기 (회전 애니메이션) ===
      if (magicCircleImgRef.current) {
        const img = magicCircleImgRef.current;
        const circleSize = Math.min(w, h) * 0.9;
        const rotation = data.time * 0.1; // 천천히 회전

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.globalAlpha = 0.4;
        // 색상 반전 효과를 위한 globalCompositeOperation
        ctx.drawImage(img, -circleSize / 2, -circleSize / 2, circleSize, circleSize);
        ctx.restore();
      }

      // === 2. 룬 문자 - 작게, 배경 전체에 퍼져서 ===
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const runeCount = data.floatingChars.length;
      for (let i = 0; i < runeCount; i++) {
        const rune = data.floatingChars[i];

        // 그리드 기반 위치 + 부드러운 움직임
        const gridX = (i % 5) / 4;
        const gridY = Math.floor(i / 5) / 2;
        const baseX = w * 0.1 + gridX * w * 0.8;
        const baseY = h * 0.1 + gridY * h * 0.8;

        // 부드러운 부유 움직임
        const floatX = Math.sin(data.time * 0.3 + i * 1.2) * 15;
        const floatY = Math.cos(data.time * 0.25 + i * 0.9) * 12;

        rune.x = baseX + floatX;
        rune.y = baseY + floatY;

        // 천천히 회전
        rune.rotation += 0.1;
        rune.glowPhase += rune.glowSpeed;

        // 페이드 인/아웃 효과
        const fadePhase = Math.sin(data.time * 0.4 + i * 0.7);
        const runeAlpha = 0.12 + 0.08 * fadePhase;

        // 룬 렌더링 (작고 은은하게)
        ctx.save();
        ctx.translate(rune.x, rune.y);
        ctx.rotate((rune.rotation * Math.PI) / 180);
        ctx.globalAlpha = runeAlpha;

        ctx.shadowColor = 'rgba(100, 90, 140, 0.3)';
        ctx.shadowBlur = 4;

        ctx.fillStyle = '#8B85A0';
        ctx.font = `${14}px serif`; // 작은 크기
        ctx.fillText(rune.char, 0, 0);
        ctx.restore();
      }

      // === 4. 중앙 미스틱 코어 글로우 ===
      const coreAlpha = 0.15 + 0.1 * Math.sin(data.centerPulse);
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.2);
      coreGlow.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`);
      coreGlow.addColorStop(0.5, `rgba(230, 220, 245, ${coreAlpha * 0.5})`);
      coreGlow.addColorStop(1, 'rgba(200, 190, 220, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // === 5. 미세 파티클 (마법진 위에 떠다니는 빛) ===
      ctx.globalAlpha = 1;
      for (const p of data.particles) {
        p.angle += p.speed * 0.3;
        const pRadius = maxRadius * (0.2 + (p.radius / 200) * 0.7);
        p.x = cx + Math.cos(p.angle) * pRadius;
        p.y = cy + Math.sin(p.angle) * pRadius;

        const pAlpha = 0.3 + 0.2 * Math.sin(data.time * 2 + p.angle);

        ctx.fillStyle = `rgba(180, 170, 210, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // === 6. 부드러운 비네트 ===
      const vignette = ctx.createRadialGradient(cx, cy, w * 0.3, cx, cy, w * 0.75);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(70, 60, 90, 0.04)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // 텍스처 업데이트
      if (textureRef.current instanceof THREE.CanvasTexture) {
        textureRef.current.needsUpdate = true;
      }
    };

    // 부모에게 메서드 노출
    useImperativeHandle(ref, () => ({
      getTexture: () => textureRef.current,
      update: cardMessage ? updateFloatingMessage : (dynamicBackground ? updateDynamicRunes : () => {}),
    }), [cardMessage, dynamicBackground]);

    // 마법진 SVG 이미지 로드
    useEffect(() => {
      if (!magicCircle) {
        magicCircleImgRef.current = null;
        return;
      }

      const img = new Image();
      img.src = `/magiccircle/circles/circle-${String(magicCircle).padStart(2, '0')}.svg`;
      img.onload = () => {
        magicCircleImgRef.current = img;
      };

      return () => {
        magicCircleImgRef.current = null;
      };
    }, [magicCircle]);

    useEffect(() => {
      if (!containerRef.current) return;
      const container = containerRef.current;

      if (backgroundImage) {
        // 사용자 업로드 이미지
        const bgImg = document.createElement('img');
        bgImg.src = backgroundImage;
        bgImg.style.position = 'absolute';
        bgImg.style.top = '0';
        bgImg.style.left = '0';
        bgImg.style.width = '100%';
        bgImg.style.height = '100%';
        bgImg.style.objectFit = 'cover';
        container.appendChild(bgImg);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(backgroundImage, (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          textureRef.current = tex;
        });

        return () => {
          container.innerHTML = '';
          if (textureRef.current) {
            textureRef.current.dispose();
            textureRef.current = null;
          }
        };
      } else if (cardMessage) {
        // 카드 메시지 플로팅 배경
        const canvas = initFloatingMessage(width, height, cardMessage, senderName);
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        container.appendChild(canvas);

        return () => {
          container.innerHTML = '';
          if (textureRef.current) {
            textureRef.current.dispose();
            textureRef.current = null;
          }
          canvasRef.current = null;
        };
      } else if (dynamicBackground) {
        // === Arcane Sanctum 마법 배경 초기화 ===
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio;
        canvas.width = Math.max(width * dpr, 512);
        canvas.height = Math.max(height * dpr, 512);
        canvasRef.current = canvas;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        // 룬 문자 초기화 (15개 - 글로우 & 트레일 포함)
        const runes: FloatingChar[] = [];
        for (let i = 0; i < 15; i++) {
          const angle = (i / 15) * Math.PI * 2;
          const radius = 100 + Math.random() * 200;
          runes.push({
            char: RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)],
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            dx: (Math.random() - 0.5) * 1.0 * dpr,
            dy: (Math.random() - 0.5) * 1.0 * dpr,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 1.5,
            fontSize: (24 + Math.random() * 20) * dpr,
            opacity: 0.6 + Math.random() * 0.3,
            glowPhase: Math.random() * Math.PI * 2,
            glowSpeed: 0.02 + Math.random() * 0.03,
            trail: [],
          });
        }

        // 에너지 파티클 초기화 (20개 - 중심 주위 공전)
        const particles: EnergyParticle[] = [];
        for (let i = 0; i < 20; i++) {
          particles.push({
            x: cx,
            y: cy,
            angle: (i / 20) * Math.PI * 2,
            radius: 60 + Math.random() * 150,
            speed: 0.005 + Math.random() * 0.015,
            size: (3 + Math.random() * 4) * dpr,
            alpha: 0.4 + Math.random() * 0.4,
            hue: Math.random() * 40,
          });
        }

        // 에너지 링 초기화 (3개 - 확장하는 마법진)
        const rings: EnergyRing[] = [];
        for (let i = 0; i < 3; i++) {
          rings.push({
            radius: i * 100,
            maxRadius: Math.min(w, h) * 0.45,
            alpha: 0.5,
            speed: 0.8 + i * 0.3,
            thickness: (2 + i) * dpr,
          });
        }

        animationDataRef.current = {
          floatingChars: runes,
          particles,
          rings,
          sigils: [],
          time: 0,
          centerPulse: 0,
          nextSigilTime: 1.5,
        };

        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        container.appendChild(canvas);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        textureRef.current = texture;

        return () => {
          container.innerHTML = '';
          if (textureRef.current) {
            textureRef.current.dispose();
            textureRef.current = null;
          }
          canvasRef.current = null;
        };
      } else {
        // 폴백: 단순 그라데이션
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

        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        textureRef.current = texture;

        return () => {
          container.innerHTML = '';
          if (textureRef.current) {
            textureRef.current.dispose();
            textureRef.current = null;
          }
        };
      }
    }, [backgroundImage, cardMessage, senderName, dynamicBackground, width, height]);

    // 리사이즈 처리
    useEffect(() => {
      if ((!dynamicBackground && !cardMessage) || backgroundImage || !canvasRef.current) return;

      const dpr = window.devicePixelRatio;
      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
    }, [width, height, dynamicBackground, cardMessage, backgroundImage]);

    // dynamicBackground용 The Arcane Inscription 배경
    const bgStyle = dynamicBackground && !backgroundImage && !cardMessage
      ? 'radial-gradient(circle at center, #FDFCFA 0%, #FAF8F5 30%, #F4F1EC 60%, #EBE7F0 100%)'
      : undefined;

    return (
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: bgStyle,
        }}
      />
    );
  }
);

GemBackground.displayName = 'GemBackground';
