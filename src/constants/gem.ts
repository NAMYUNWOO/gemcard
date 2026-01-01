// Gem rendering constants
export const GEM_CONSTANTS = {
  // Material properties
  FIXED_THICKNESS: 1.5,
  FIXED_DISPERSION: 0.05,
  REFRACTIVE_INDEX: 2.41,

  // Camera
  CAMERA_FOV: 35,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 100,
  CAMERA_Z: 7,

  // Animation
  DAMPING: 0.96,
  BASE_AUTO_ROTATION: 0.003,
  DRAG_SENSITIVITY: 0.008,
  FLOAT_SPEED: 0.4,
  FLOAT_AMPLITUDE: 0.05,

  // Light swing
  LIGHT_SWING_SPEED: 1.5,
  LIGHT_SWING_ANGLE: 1.5, // radians (~86 degrees)
  LIGHT_DISTANCE: 6,

  // Renderer
  TONE_MAPPING_EXPOSURE: 1.3,
} as const;

export type GemConstants = typeof GEM_CONSTANTS;
