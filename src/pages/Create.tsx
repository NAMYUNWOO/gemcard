import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { GemScene } from '../components/GemScene';
import { useCardStore } from '../stores/cardStore';
import { DEFAULT_GEM_PARAMS, COLOR_OPTIONS, getRandomShape, getCutName, type GemShape } from '../types/card';
import styles from './Create.module.css';

export function Create() {
  const navigate = useNavigate();
  const { createCard } = useCardStore();

  // 랜덤 초기값 생성
  const getRandomColor = () => COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
  const getRandomTurbidity = () => Math.random(); // 0 ~ 1
  const getRandomContrast = () => 0.5 + Math.random() * 0.5; // 0.5 ~ 1

  const [shape, setShape] = useState<GemShape | null>(null);
  const [cutName, setCutName] = useState<string>('');
  const [color, setColor] = useState(getRandomColor);
  const [turbidity, setTurbidity] = useState(getRandomTurbidity);
  const [contrast, setContrast] = useState(getRandomContrast);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'shape' | 'color' | 'turbidity' | 'contrast'>('shape');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // 초기 shape를 랜덤으로 설정
  useEffect(() => {
    getRandomShape().then(setShape);
  }, []);

  // shape 변경 시 컷 이름 로드
  useEffect(() => {
    if (shape) {
      getCutName(shape).then(setCutName);
    }
  }, [shape]);

  // shape 로딩 전에는 렌더링하지 않음
  if (!shape) {
    return <div className={styles.fullscreen} style={{ background: '#1a1a2e' }} />;
  }

  const gemParams = {
    shape,
    color,
    turbidity,
    detailLevel: DEFAULT_GEM_PARAMS.detailLevel,
    dispersion: DEFAULT_GEM_PARAMS.dispersion,
    thickness: DEFAULT_GEM_PARAMS.thickness,
  };

  const handleCreate = () => {
    if (!message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    const card = createCard(gemParams, message.trim(), senderName.trim() || undefined);
    navigate(`/card/${card.id}`);
  };

  return (
    <div className={styles.fullscreen}>
      {/* Fullscreen Gem Preview */}
      <div className={styles.gemContainer}>
        <GemScene
          params={gemParams}
          contrast={contrast}
          autoRotate
          dynamicBackground
          disableDrag={colorPickerOpen}
        />
      </div>

      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← 뒤로
      </button>

      {/* Cut Name Display */}
      {cutName && (
        <div className={styles.cutName}>{cutName}</div>
      )}

      {/* Bottom Editor Area */}
      <div className={styles.bottomEditor}>
        {!showMessagePanel ? (
          <>
            {/* Active Control Slider/Options */}
            <div className={styles.controlArea}>
              {activeTab === 'shape' && (
                <div className={styles.shapeControl}>
                  <button
                    className={styles.changeShapeBtn}
                    onClick={() => getRandomShape().then(setShape)}
                  >
                    🔄 다른 모양으로 변경
                  </button>
                </div>
              )}

              {activeTab === 'color' && (
                <div className={styles.colorSection}>
                  {!colorPickerOpen ? (
                    <div className={styles.colorOptions}>
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          className={`${styles.colorBtn} ${color === c ? styles.active : ''}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setColor(c)}
                        />
                      ))}
                      <button
                        className={styles.customColorBtn}
                        onClick={() => setColorPickerOpen(true)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div
                      className={styles.colorPickerWrapper}
                      onPointerDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      <div className={styles.colorPickerHeader}>
                        <span>색상 선택</span>
                        <button
                          className={styles.colorPickerClose}
                          onClick={() => setColorPickerOpen(false)}
                        >
                          ✓
                        </button>
                      </div>
                      <HexColorPicker color={color} onChange={setColor} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'turbidity' && (
                <div className={styles.sliderControl}>
                  <span className={styles.sliderLabel}>불투명도</span>
                  <input
                    type="range"
                    className={styles.slider}
                    min="0"
                    max="1"
                    step="0.01"
                    value={turbidity}
                    onChange={(e) => setTurbidity(parseFloat(e.target.value))}
                  />
                </div>
              )}

              {activeTab === 'contrast' && (
                <div className={styles.sliderControl}>
                  <span className={styles.sliderLabel}>내부 대비</span>
                  <input
                    type="range"
                    className={styles.slider}
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={contrast}
                    onChange={(e) => setContrast(parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className={styles.tabNav}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'shape' ? styles.active : ''}`}
                onClick={() => setActiveTab('shape')}
              >
                <span className={styles.tabIcon}>💎</span>
                <span className={styles.tabLabel}>모양</span>
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'color' ? styles.active : ''}`}
                onClick={() => setActiveTab('color')}
              >
                <span className={styles.tabIcon}>🎨</span>
                <span className={styles.tabLabel}>색상</span>
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'turbidity' ? styles.active : ''}`}
                onClick={() => setActiveTab('turbidity')}
              >
                <span className={styles.tabIcon}>🔮</span>
                <span className={styles.tabLabel}>불투명도</span>
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'contrast' ? styles.active : ''}`}
                onClick={() => setActiveTab('contrast')}
              >
                <span className={styles.tabIcon}>🔲</span>
                <span className={styles.tabLabel}>대비</span>
              </button>
            </div>

            {/* Message Button */}
            <button
              className={styles.messageToggleBtn}
              onClick={() => setShowMessagePanel(true)}
            >
              💌 메시지 작성하기
            </button>
          </>
        ) : (
          <div className={styles.messagePanel}>
            <div className={styles.messagePanelHeader}>
              <span>메시지 작성</span>
              <button
                className={styles.closeBtn}
                onClick={() => setShowMessagePanel(false)}
              >
                ✕
              </button>
            </div>
            <textarea
              className={styles.messageInput}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="소중한 마음을 담아 메시지를 작성하세요..."
              maxLength={500}
            />
            <span className={styles.charCount}>{message.length}/500</span>
            <input
              type="text"
              className={styles.nameInput}
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="보내는 사람 (선택)"
              maxLength={50}
            />
            <button className={styles.createBtn} onClick={handleCreate}>
              카드 만들기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
