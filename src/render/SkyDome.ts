import * as THREE from 'three';

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vWorldPosition;
  uniform vec3 topColor;
  uniform vec3 horizonColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;

  void main() {
    float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
    vec3 sky = mix(horizonColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
    sky = mix(bottomColor, sky, smoothstep(-0.15, 0.05, h));
    gl_FragColor = vec4(sky, 1.0);
  }
`;

/**
 * Large inverted sphere with a hand-tunable vertical gradient, standing in
 * for the soft watercolor-banded skies of BOTW/TOTK instead of a photoreal
 * HDRI.
 */
export function createSkyDome(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(500, 32, 16);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x7a7568) },
      horizonColor: { value: new THREE.Color(0xc9a878) },
      bottomColor: { value: new THREE.Color(0x4a4238) },
      offset: { value: 20 },
      exponent: { value: 0.6 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = -1000;
  return mesh;
}
