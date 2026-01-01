/**
 * Gem Vertex Shader
 *
 * Calculates:
 * - vNormal: View-space normal for lighting calculations
 * - vEye: View direction for refraction and specular
 * - vScreenPos: Screen position for background texture sampling
 * - vLocalPos: Local position for displacement effects
 */
export const GEM_VERTEX_SHADER = `
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
