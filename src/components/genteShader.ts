// Cada pessoa é um quadrado com este shader: o pixel some quando o render do Blender está mais perto da câmera.
import { GlProgram, Mesh, MeshGeometry, Shader, UniformGroup, type Texture, type TextureSource } from 'pixi.js';

const vertex = `
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
out vec2 vPos;
uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;
void main() {
  mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
  gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
  vUV = aUV;
  vPos = aPosition;
}`;

const fragment = `
in vec2 vUV;
in vec2 vPos;
out vec4 finalColor;
uniform sampler2D uAtlas;
uniform sampler2D uDepth;
uniform vec2 uFeet;
uniform float uFeetDepth;
uniform float uKz;
uniform float uDz;
uniform vec2 uSize;
uniform vec2 uProf;
uniform float uAlpha;
uniform float uFolga;
void main() {
  vec4 c = texture(uAtlas, vUV);
  if (c.a < 0.02) discard;
  vec4 d = texture(uDepth, (floor(vPos) + 0.5) / uSize);
  float fundo = uProf.x + (d.r * 65280.0 + d.g * 255.0) / 65535.0 * (uProf.y - uProf.x);
  float altura = max(0.0, (uFeet.y - vPos.y) * uKz);
  if (fundo < uFeetDepth - altura * uDz - uFolga) discard;
  finalColor = c * uAlpha;
}`;

let programa: GlProgram | null = null;

export type Comum = { atlas: Texture; folga?: number; profundidade: TextureSource; kz: number; dz: number; larg: number; alt: number; prof: [number, number] };

export function criaPessoa(comum: Comum) {
  programa ??= GlProgram.from({ vertex, fragment, name: 'pessoa-profundidade' });
  const u = new UniformGroup({
    uFeet: { value: new Float32Array([0, 0]), type: 'vec2<f32>' },
    uFeetDepth: { value: 0, type: 'f32' },
    uKz: { value: comum.kz, type: 'f32' },
    uDz: { value: comum.dz, type: 'f32' },
    uSize: { value: new Float32Array([comum.larg, comum.alt]), type: 'vec2<f32>' },
    uProf: { value: new Float32Array(comum.prof), type: 'vec2<f32>' },
    uAlpha: { value: 1, type: 'f32' },
    uFolga: { value: comum.folga ?? 0.3, type: 'f32' },
  });
  const shader = new Shader({ glProgram: programa, resources: { uAtlas: comum.atlas.source, uDepth: comum.profundidade, u } });
  const geometry = new MeshGeometry({ positions: new Float32Array(8), uvs: new Float32Array(8), indices: new Uint32Array([0, 1, 2, 0, 2, 3]) });
  const mesh = new Mesh({ geometry, shader });
  const W = comum.atlas.source.width, H = comum.atlas.source.height;
  /** quadro = [sx, sy, w, h, ax, ay] no atlas; escala = pixels do mundo por pixel do atlas */
  function poe(fx: number, fy: number, profPe: number, q: number[], flip: boolean, escala: number, alfa = 1, inclina = 0) {
    const [sx, sy, w, h, ax, ay] = q;
    const oxa = flip ? w - ax : ax;
    const x0 = fx - oxa * escala, y0 = fy - ay * escala, x1 = x0 + w * escala, y1 = y0 + h * escala;
    const pos = geometry.positions;
    pos[0] = x0 + inclina; pos[1] = y0; pos[2] = x1 + inclina; pos[3] = y0; pos[4] = x1; pos[5] = y1; pos[6] = x0; pos[7] = y1;
    let u0 = sx / W, u1 = (sx + w) / W; const v0 = sy / H, v1 = (sy + h) / H;
    if (flip) [u0, u1] = [u1, u0];
    const uv = geometry.uvs;
    uv[0] = u0; uv[1] = v0; uv[2] = u1; uv[3] = v0; uv[4] = u1; uv[5] = v1; uv[6] = u0; uv[7] = v1;
    geometry.getBuffer('aPosition').update(); geometry.getBuffer('aUV').update();
    (u.uniforms.uFeet as Float32Array)[0] = fx; (u.uniforms.uFeet as Float32Array)[1] = fy;
    u.uniforms.uFeetDepth = profPe; u.uniforms.uAlpha = alfa; u.update();
  }
  return { mesh, poe };
}
