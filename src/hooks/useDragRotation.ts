import { useRef, useCallback } from 'react';
import { GEM_CONSTANTS } from '../constants/gem';

interface DragRotationState {
  isDragging: boolean;
  velocityX: number;
  velocityY: number;
}

interface UseDragRotationOptions {
  /** Whether dragging is disabled */
  disabled?: boolean;
  /** Callback when rotation velocity changes */
  onRotationChange?: (velocityX: number, velocityY: number) => void;
  /** Whether auto-rotation is enabled when not dragging */
  autoRotate?: boolean;
}

interface UseDragRotationReturn {
  /** Current drag/rotation state */
  state: React.MutableRefObject<DragRotationState>;
  /** Attach event listeners to this element */
  attachTo: (element: HTMLElement) => () => void;
  /** Update rotation (call in animation loop) */
  update: () => { rotationX: number; rotationY: number };
}

/**
 * Custom hook for handling drag-to-rotate interaction with inertia
 */
export function useDragRotation(options: UseDragRotationOptions = {}): UseDragRotationReturn {
  const { disabled = false, autoRotate = true } = options;

  const stateRef = useRef<DragRotationState>({
    isDragging: false,
    velocityX: 0,
    velocityY: GEM_CONSTANTS.DRAG_SENSITIVITY,
  });

  const previousMouseRef = useRef({ x: 0, y: 0 });
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const attachTo = useCallback((element: HTMLElement) => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.target !== element || disabledRef.current) return;
      stateRef.current.isDragging = true;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
      element.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isDragging || disabledRef.current) return;
      const deltaX = e.clientX - previousMouseRef.current.x;
      const deltaY = e.clientY - previousMouseRef.current.y;
      stateRef.current.velocityY = deltaX * GEM_CONSTANTS.DRAG_SENSITIVITY;
      stateRef.current.velocityX = deltaY * GEM_CONSTANTS.DRAG_SENSITIVITY;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      stateRef.current.isDragging = false;
      element.style.cursor = 'grab';
    };

    const onBlur = () => {
      stateRef.current.isDragging = false;
      element.style.cursor = 'grab';
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.target !== element || e.touches.length !== 1 || disabledRef.current) return;
      stateRef.current.isDragging = true;
      previousMouseRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!stateRef.current.isDragging || e.touches.length !== 1 || disabledRef.current) return;
      const deltaX = e.touches[0].clientX - previousMouseRef.current.x;
      const deltaY = e.touches[0].clientY - previousMouseRef.current.y;
      stateRef.current.velocityY = deltaX * GEM_CONSTANTS.DRAG_SENSITIVITY;
      stateRef.current.velocityX = deltaY * GEM_CONSTANTS.DRAG_SENSITIVITY;
      previousMouseRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchEnd = () => {
      stateRef.current.isDragging = false;
    };

    // Attach event listeners
    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseup', onMouseUp);
    element.addEventListener('mouseleave', onMouseUp);
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: true });
    element.addEventListener('touchend', onTouchEnd);
    window.addEventListener('blur', onBlur);

    element.style.cursor = 'grab';
    element.style.touchAction = 'none';

    // Return cleanup function
    return () => {
      element.removeEventListener('mousedown', onMouseDown);
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('mouseup', onMouseUp);
      element.removeEventListener('mouseleave', onMouseUp);
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const update = useCallback(() => {
    const state = stateRef.current;

    if (!state.isDragging) {
      // Apply damping
      state.velocityX *= GEM_CONSTANTS.DAMPING;
      state.velocityY *= GEM_CONSTANTS.DAMPING;

      // Return to auto-rotation when velocity is low
      if (
        autoRotate &&
        Math.abs(state.velocityY) < GEM_CONSTANTS.BASE_AUTO_ROTATION &&
        Math.abs(state.velocityX) < 0.001
      ) {
        state.velocityY = GEM_CONSTANTS.BASE_AUTO_ROTATION;
      }
    }

    return {
      rotationX: state.velocityX,
      rotationY: state.velocityY,
    };
  }, [autoRotate]);

  return {
    state: stateRef,
    attachTo,
    update,
  };
}
