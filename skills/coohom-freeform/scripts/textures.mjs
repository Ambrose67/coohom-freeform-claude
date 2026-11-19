// Generates tileable wood-grain and marble-vein PNG textures for Coohom materials (no dependencies).
// Usage: S=384 node textures.mjs <outDir>   (S = size in px; 384 wood / 512 marble stay under the 204,800-char script limit)
import fs from 'node:fs';
import zlib from 'node:zlib';
const out = process.argv[2] || ".";
const S = Number(process.env.S) || 384;
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); }
function png(px) { const raw = Buffer.alloc(S * (S * 3 + 1)); for (let y = 0; y < S; y++) { raw[y * (S * 3 + 1)] = 0; px.copy(raw, y * (S * 3 + 1) + 1, y * S * 3, (y + 1) * S * 3); }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(S, 0); ih.writeUInt32BE(S, 4); ih[8] = 8; ih[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]); }
// tileable value noise
const G = 64, grid = Array.from({ length: G * G }, (_, i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); });
const sm = t => t * t * (3 - 2 * t);
function vn(x, y, f) { x = x * f; y = y * f; const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi), m = f;
  const g = (a, b) => grid[((((b % m) + m) % m) % G) * G + ((((a % m) + m) % m) % G)];
  const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf; }
const fbm = (x, y, f, o = 5) => { let v = 0, a = 0.5; for (let i = 0; i < o; i++) { v += a * vn(x, y, f << i); a *= 0.5; } return v; };
const mix = (a, b, t) => a + (b - a) * t;
// wood: honey walnut, grain runs along X
const wood = Buffer.alloc(S * S * 3);
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
  const u = x / S, v = y / S;
  const warp = fbm(u, v, 4) * 2.2;
  const rings = Math.sin((v * 34 + warp * 3) * Math.PI);
  const fine = fbm(u * 0.25, v, 64, 3);
  let t = 0.5 + 0.32 * rings + 0.35 * (fine - 0.5);
  const knot = Math.max(0, 1 - Math.hypot(u - 0.68, (v - 0.35) * 1.6) * 9) + Math.max(0, 1 - Math.hypot(u - 0.22, (v - 0.8) * 1.6) * 11);
  t -= knot * 0.6;
  t = Math.min(1, Math.max(0, t));
  const r = mix(0.28, 0.70, t), g = mix(0.14, 0.42, t), b = mix(0.05, 0.20, t);
  const i = (y * S + x) * 3; wood[i] = r * 255; wood[i + 1] = g * 255; wood[i + 2] = b * 255;
}
// marble: warm cream with thin golden-brown veins
const marble = Buffer.alloc(S * S * 3);
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
  const u = x / S, v = y / S;
  const n = fbm(u, v, 3, 6);
  const vein1 = Math.abs(Math.sin((u * 2.5 + v * 1.2 + n * 2.8) * Math.PI));
  const vein2 = Math.abs(Math.sin((u * -1.3 + v * 3.1 + fbm(u + 0.3, v, 5, 5) * 3.2) * Math.PI));
  const vein = Math.max(Math.pow(1 - vein1, 40), 0.7 * Math.pow(1 - vein2, 60));
  const base = 0.9 + 0.08 * (fbm(u, v, 8, 4) - 0.5);
  const r = mix(base * 0.97, 0.45, vein), g = mix(base * 0.92, 0.32, vein), b = mix(base * 0.84, 0.18, vein);
  const i = (y * S + x) * 3; marble[i] = r * 255; marble[i + 1] = g * 255; marble[i + 2] = b * 255;
}
fs.writeFileSync(out + '/wood.png', png(wood));
fs.writeFileSync(out + '/marble.png', png(marble));
console.log('ok');
