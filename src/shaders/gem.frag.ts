/**
 * Gem Fragment Shader
 *
 * Features:
 * - Chromatic dispersion (RGB separation for rainbow effect)
 * - Opacity control (turbidity)
 * - Dual light sources with specular highlights
 * - Fresnel rim lighting
 * - Contrast adjustment for facet distinction
 */
export const GEM_FRAGMENT_SHADER = `
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
    // Screen-space UV for background sampling
    vec2 uv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
    float dist = length(vLocalPos.xy);
    float displacementStrength = smoothStepFunc(1.5, 0.0, dist);

    // Refraction with chromatic dispersion
    vec3 refractVec = refract(vEye, vNormal, 1.0 / 2.41);
    vec2 refractOffset = refractVec.xy * 0.15 * uThickness * displacementStrength;

    float r = texture2D(tBackground, uv + refractOffset * (1.0 + uDispersion)).r;
    float g = texture2D(tBackground, uv + refractOffset).g;
    float b = texture2D(tBackground, uv + refractOffset * (1.0 - uDispersion)).b;

    // Opacity control: mix between refracted background and solid color
    vec3 refractedColor = vec3(r, g, b) * uColor * 1.1;
    vec3 solidColor = uColor * 0.9;
    vec3 baseColor = mix(refractedColor, solidColor, uTurbidity);

    // === FACET LIGHTING ===

    // Main light (animated position)
    vec3 lightDir1 = normalize(uLightPos);
    vec3 halfDir1 = normalize(lightDir1 - vEye);
    float NdotL1 = dot(vNormal, lightDir1);

    // Secondary light (fixed position, lower-left)
    vec3 lightDir2 = normalize(vec3(-3.0, -2.0, 4.0));
    float NdotL2 = dot(vNormal, lightDir2);

    // Internal contrast (adjusts shadow intensity between facets)
    float shadowMask = max(NdotL1, 0.3);
    float contrastStrength = mix(0.1, 0.5, uContrast);
    baseColor *= (1.0 - contrastStrength + contrastStrength * shadowMask);

    // Secondary light for depth
    baseColor *= (1.0 + max(NdotL2, 0.0) * mix(0.05, 0.2, uContrast));

    // Sharp specular highlights
    float spec1 = pow(max(dot(vNormal, halfDir1), 0.0), 512.0);
    baseColor = mix(baseColor, vec3(1.3), spec1 * 0.8);

    // Secondary specular
    vec3 halfDir2 = normalize(lightDir2 - vEye);
    float spec2 = pow(max(dot(vNormal, halfDir2), 0.0), 512.0);
    baseColor = mix(baseColor, vec3(1.1), spec2 * 0.4);

    // Fresnel rim lighting
    float fresnel = pow(1.0 - max(dot(vNormal, -vEye), 0.0), 3.0);
    baseColor += vec3(0.12, 0.18, 0.25) * fresnel * 0.4;

    // Extra contrast for white/bright gems
    float colorBrightness = (uColor.r + uColor.g + uColor.b) / 3.0;
    if (colorBrightness > 0.85) {
      float facetTint = dot(vNormal, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
      baseColor *= mix(0.92, 1.08, facetTint);
    }

    gl_FragColor = vec4(baseColor, 1.0);
  }
`;
