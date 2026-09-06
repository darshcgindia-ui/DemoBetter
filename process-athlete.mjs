import fs from 'fs';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const inputJpg = 'C:/Users/maham/.gemini/antigravity-ide/brain/4a5e71ac-9cdf-481f-b981-6aed4d0d58d9/gym_hero_athlete_1788700111035.jpg';
const outputPng = 'G:/ApexlocalStudio/scrollcraft/builds/vajra-kinetics/assets/hero-athlete.png';

const jpegData = fs.readFileSync(inputJpg);
const raw = jpeg.decode(jpegData, { useTArray: true });
const width = raw.width;
const height = raw.height;

// BFS Flood Fill from edges to identify background
const isBg = new Uint8Array(width * height);
const queue = [];

// Seed edges
for (let x = 0; x < width; x++) {
  queue.push(x, 0);
  queue.push(x, height - 1);
  isBg[x] = 1;
  isBg[(height - 1) * width + x] = 1;
}
for (let y = 0; y < height; y++) {
  queue.push(0, y);
  queue.push(width - 1, y);
  isBg[y * width] = 1;
  isBg[y * width + (width - 1)] = 1;
}

let head = 0;
while (head < queue.length) {
  const cx = queue[head++];
  const cy = queue[head++];
  
  const neighbors = [
    [cx + 1, cy],
    [cx - 1, cy],
    [cx, cy + 1],
    [cx, cy - 1]
  ];
  
  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const idx = ny * width + nx;
      if (!isBg[idx]) {
        const pIdx = idx * 4;
        const r = raw.data[pIdx];
        const g = raw.data[pIdx + 1];
        const b = raw.data[pIdx + 2];
        const brightness = Math.max(r, g, b);
        
        // If it is dark background connected to boundary
        if (brightness < 28) {
          isBg[idx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
}

const outPng = new PNG({ width, height });

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    const pIdx = idx * 4;
    const r = raw.data[pIdx];
    const g = raw.data[pIdx + 1];
    const b = raw.data[pIdx + 2];
    const brightness = (r + g + b) / 3;

    outPng.data[pIdx] = r;
    outPng.data[pIdx + 1] = g;
    outPng.data[pIdx + 2] = b;

    if (isBg[idx]) {
      outPng.data[pIdx + 3] = 0; // completely transparent background
    } else {
      // Chalk particles on perimeter get smooth alpha blending
      if (x > width * 0.45 && brightness > 30 && brightness < 180) {
        outPng.data[pIdx + 3] = Math.min(255, Math.floor(brightness * 1.5));
      } else {
        outPng.data[pIdx + 3] = 255;
      }
    }
  }
}

fs.writeFileSync(outputPng, PNG.sync.write(outPng));
console.log('Saved perfect athlete alpha cutout to:', outputPng);
