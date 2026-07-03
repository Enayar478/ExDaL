// Génère les déclinaisons du logo ExDaL à partir du PNG brut haute résolution.
// Usage : node scripts/logo.mjs [left] [top] [size]
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "brand/logo-exdal-source.png";

// Cadrage de l'emblème (carré) — ajustable en argument pour caler le disque.
const left = Number(process.argv[2] ?? 1140);
const top = Number(process.argv[3] ?? 170);
const size = Number(process.argv[4] ?? 1200);

await mkdir("public", { recursive: true });
await mkdir("app", { recursive: true });

const emblem = () =>
  sharp(SRC).extract({ left, top, width: size, height: size });

// Emblème carré réutilisable (header, hero).
await emblem().resize(512, 512).png().toFile("public/emblem.png");

// Favicon et icône Apple (Next les détecte dans app/).
await emblem().resize(256, 256).png().toFile("app/icon.png");
await emblem().resize(180, 180).png().toFile("app/apple-icon.png");

// Image OpenGraph (1200x630) : emblème à droite, signature à gauche, fond noir.
const ogEmblem = await emblem().resize(560, 560).png().toBuffer();
const ogText = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <text x="90" y="292" font-family="Georgia, 'Times New Roman', serif" font-size="92" fill="#e8e9e6">Ex<tspan fill="#d9b26a">DaL</tspan></text>
  <text x="94" y="342" font-family="Georgia, serif" font-size="30" font-style="italic" fill="#a9b0b6">Ex Datis Lumen</text>
  <text x="96" y="404" font-family="monospace" font-size="19" letter-spacing="5" fill="#a8894f">DE LA DONNÉE, LA LUMIÈRE</text>
</svg>`);

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: "#090a0c",
  },
})
  .composite([
    { input: ogEmblem, top: 35, left: 620 },
    { input: ogText, top: 0, left: 0 },
  ])
  .png()
  .toFile("app/opengraph-image.png");

console.error(`emblem crop: left=${left} top=${top} size=${size} → done`);
