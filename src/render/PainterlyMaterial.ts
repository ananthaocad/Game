import * as THREE from 'three';

// Soft 4-step lighting ramp so shading reads as painted bands rather than
// a hard photoreal gradient, without the harsh black-outline look of
// classic cel-shading.
const RAMP_STEPS = [0.34, 0.58, 0.8, 1.0];

let sharedGradientMap: THREE.DataTexture | null = null;

function getGradientMap(): THREE.DataTexture {
  if (sharedGradientMap) return sharedGradientMap;
  const size = RAMP_STEPS.length;
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = Math.round(RAMP_STEPS[i] * 255);
  }
  const tex = new THREE.DataTexture(data, size, 1, THREE.RedFormat);
  tex.needsUpdate = true;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  sharedGradientMap = tex;
  return tex;
}

export interface PainterlyMaterialOptions {
  color: THREE.ColorRepresentation;
  map?: THREE.Texture;
  emissive?: THREE.ColorRepresentation;
  rimColor?: THREE.ColorRepresentation;
  rimIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

/**
 * MeshToonMaterial quantizes lighting via the gradient map, then we inject a
 * fresnel rim term in the fragment shader for the soft edge-glow that sells
 * the BOTW/TOTK "painted" look.
 */
export function createPainterlyMaterial(opts: PainterlyMaterialOptions): THREE.MeshToonMaterial {
  const material = new THREE.MeshToonMaterial({
    color: opts.color,
    ...(opts.map ? { map: opts.map } : {}),
    gradientMap: getGradientMap(),
    emissive: opts.emissive ?? 0x000000,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
  });

  const rimColor = new THREE.Color(opts.rimColor ?? 0xfff6e0);
  const rimIntensity = opts.rimIntensity ?? 0.45;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.rimColor = { value: rimColor };
    shader.uniforms.rimIntensity = { value: rimIntensity };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRimViewDir;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvRimViewDir = normalize(-(modelViewMatrix * vec4(transformed, 1.0)).xyz);'
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vRimViewDir;\nuniform vec3 rimColor;\nuniform float rimIntensity;'
      )
      .replace(
        '#include <dithering_fragment>',
        `{
          float rim = 1.0 - max(dot(vRimViewDir, normalize(vNormal)), 0.0);
          rim = pow(rim, 2.5) * rimIntensity;
          gl_FragColor.rgb += rimColor * rim;
        }
        #include <dithering_fragment>`
      );
  };

  return material;
}
