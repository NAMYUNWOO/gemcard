import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';

interface GemBackgroundProps {
  width: number;
  height: number;
  dynamicBackground?: boolean;
  backgroundImage?: string;
  cardMessage?: string;
  senderName?: string;
  maxChars?: number;
}

interface FloatingChar {
  char: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rotation: number;
  rotationSpeed: number;
  fontSize: number;
}

export interface GemBackgroundHandle {
  getTexture: () => THREE.Texture | null;
  update: () => void;
}

// 편지 메시지 42개
const LETTER_MESSAGES = [
  "보석과 함께 소중한 분에게 편지를..",
  "어머니에게 사랑하고 고맙다는 말씀을..",
  "아버지에게 존경하고 든든하다는 말씀을..",
  "아내에게 사랑하고 평생 행복하자는 말을..",
  "남편에게 사랑하고 평생 행복하자는 말을..",
  "친구에게 고맙고 앞으로도 잘 부탁한다는 말을..",
  "이모에게 항상 챙겨주셔서 감사하다는 말을..",
  "삼촌에게 어릴 때 잘 놀아주셔서 고맙다는 말을..",
  "은사님에게 가르침에 감사드린다는 말을..",
  "후배에게 응원하고 믿는다는 말을..",
  "선배에게 존경하고 배우고 싶다는 말을..",
  "할머니에게 오래오래 건강하시라는 말을..",
  "할아버지에게 보고 싶고 사랑한다는 말을..",
  "동생에게 항상 곁에 있어줘서 고맙다는 말을..",
  "형에게 듬직해서 좋다는 말을..",
  "오빠에게 항상 챙겨줘서 고맙다는 말을..",
  "누나에게 다정해서 좋다는 말을..",
  "언니에게 롤모델이라는 말을..",
  "조카에게 사랑하고 응원한다는 말을..",
  "사촌에게 어릴 때 추억이 좋았다는 말을..",
  "직장 동료에게 함께해서 힘이 된다는 말을..",
  "첫사랑에게 그때 행복했다는 말을..",
  "나 자신에게 수고했고 사랑한다는 말을..",
  "사장님에게 많이 배우고 있다는 말을..",
  "대표님에게 존경하고 따르겠다는 말을..",
  "팀장님에게 이끌어주셔서 감사하다는 말을..",
  "직원분에게 함께해서 든든하다는 말을..",
  "남자친구에게 만나서 행복하다는 말을..",
  "여자친구에게 세상에서 제일 예쁘다는 말을..",
  "전남친에게 좋은 추억 고맙다는 말을..",
  "전여친에게 덕분에 성장했다는 말을..",
  "짝사랑에게 용기내서 고백한다는 말을..",
  "소꿉친구에게 오래 알아서 편하다는 말을..",
  "룸메이트에게 같이 살아서 좋다는 말을..",
  "담임선생님에게 잘 가르쳐주셔서 감사하다는 말을..",
  "교수님에게 지도해주셔서 감사하다는 말을..",
  "고마운 이웃에게 늘 인사해주셔서 좋다는 말을..",
  "주치의 선생님에게 건강 챙겨주셔서 감사하다는 말을..",
  "오랜 단골 사장님에게 맛있는 음식 감사하다는 말을..",
  "군대 전우에게 같이 고생해서 고맙다는 말을..",
  "반려동물에게 곁에 있어줘서 고맙다는 말을..",
  "하늘에 계신 분에게 보고 싶고 사랑한다는 말을..",
];

// Fisher-Yates 셔플
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const GemBackground = forwardRef<GemBackgroundHandle, GemBackgroundProps>(
  ({ width, height, dynamicBackground = false, backgroundImage, cardMessage, senderName, maxChars = 30 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const textureRef = useRef<THREE.CanvasTexture | THREE.Texture | null>(null);
    const animationDataRef = useRef<{
      messages: string[];
      scrollY: number;
      lineHeight: number;
      floatingChars: FloatingChar[];
    }>({ messages: [], scrollY: 0, lineHeight: 60, floatingChars: [] });

    // 편지지 배경 초기화
    const initLetterBackground = (w: number, h: number) => {
      const canvas = document.createElement('canvas');
      const dpr = window.devicePixelRatio;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvasRef.current = canvas;

      // 메시지 셔플
      animationDataRef.current.messages = shuffleArray(LETTER_MESSAGES);
      animationDataRef.current.scrollY = 0;
      animationDataRef.current.lineHeight = 50 * dpr;

      // 텍스처 생성
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      textureRef.current = texture;

      return canvas;
    };

    // 편지지 배경 업데이트 (스크롤 애니메이션)
    const updateLetterBackground = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio;
      const { messages, lineHeight } = animationDataRef.current;

      // 1. 크림색 배경
      ctx.fillStyle = '#FDF8E8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. 손글씨 스타일 텍스트
      const fontSize = 24 * dpr;
      ctx.font = `${fontSize}px 'Nanum Pen Script', cursive`;
      ctx.fillStyle = '#4A4A4A';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';

      const padding = 30 * dpr;
      const totalTextHeight = messages.length * lineHeight;

      // 스크롤 위치 계산
      let startY = -animationDataRef.current.scrollY;

      // 메시지 두 번 반복해서 무한 스크롤 효과
      const allMessages = [...messages, ...messages];

      allMessages.forEach((msg, index) => {
        const y = startY + (index * lineHeight) + lineHeight - 10 * dpr;
        if (y > -lineHeight && y < canvas.height + lineHeight) {
          ctx.fillText(msg, padding, y);
        }
      });

      // 스크롤 속도
      animationDataRef.current.scrollY += 0.8 * dpr;

      // 첫 번째 세트가 완전히 지나가면 리셋
      if (animationDataRef.current.scrollY >= totalTextHeight) {
        animationDataRef.current.scrollY = 0;
      }

      // 텍스처 업데이트
      if (textureRef.current instanceof THREE.CanvasTexture) {
        textureRef.current.needsUpdate = true;
      }
    };

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
        });
      }

      animationDataRef.current.floatingChars = chars;

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

    // 부모에게 메서드 노출
    useImperativeHandle(ref, () => ({
      getTexture: () => textureRef.current,
      update: cardMessage ? updateFloatingMessage : updateLetterBackground,
    }), [cardMessage]);

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
        // 편지지 배경 (기본)
        const canvas = initLetterBackground(width, height);
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

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
        }}
      />
    );
  }
);

GemBackground.displayName = 'GemBackground';
