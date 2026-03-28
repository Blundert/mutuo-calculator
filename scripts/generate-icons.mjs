#!/usr/bin/env node
/**
 * Generates PNG icons for the PWA using pngjs (pure JS, no native deps).
 * Creates simple colored square icons with rounded corners.
 */
import { PNG } from 'pngjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.join(__dirname, '../public/icons')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Blue color: #1e40af = rgb(30, 64, 175)
const BG_R = 30, BG_G = 64, BG_B = 175

function isInsideRoundedRect(x, y, size, radius) {
  // Check if point is inside rounded rectangle
  const cx = Math.min(Math.max(x, radius), size - radius)
  const cy = Math.min(Math.max(y, radius), size - radius)
  return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= radius ||
    (x >= radius && x <= size - radius) ||
    (y >= radius && y <= size - radius)
}

function isInsideRoundedRectStrict(x, y, size, radius) {
  if (x < 0 || x >= size || y < 0 || y >= size) return false
  // Four corner regions
  if (x < radius && y < radius) {
    return Math.sqrt((x - radius) ** 2 + (y - radius) ** 2) <= radius
  }
  if (x >= size - radius && y < radius) {
    return Math.sqrt((x - (size - radius)) ** 2 + (y - radius) ** 2) <= radius
  }
  if (x < radius && y >= size - radius) {
    return Math.sqrt((x - radius) ** 2 + (y - (size - radius)) ** 2) <= radius
  }
  if (x >= size - radius && y >= size - radius) {
    return Math.sqrt((x - (size - radius)) ** 2 + (y - (size - radius)) ** 2) <= radius
  }
  return true
}

// Simple bitmap font for letter "M" - 5x7 pixel grid scaled up
// We'll draw an "M" shape manually
function drawM(data, size, scale) {
  const color = { r: 255, g: 255, b: 255 } // white

  // Define M shape as relative coordinates (0-4 x, 0-6 y) in a 5x7 grid
  const mPixels = [
    [0,0],[4,0],                    // top corners
    [0,1],[1,1],[3,1],[4,1],         // second row
    [0,2],[1,2],[2,2],[3,2],[4,2],   // middle row with center
    [0,3],[2,3],[4,3],               // row with gaps
    [0,4],[4,4],                     // row
    [0,5],[4,5],                     // row
    [0,6],[4,6],                     // bottom
  ]

  const gridW = 5
  const gridH = 7
  const padding = size * 0.2
  const availW = size - padding * 2
  const availH = size - padding * 2
  const cellW = availW / gridW
  const cellH = availH / gridH

  for (const [gx, gy] of mPixels) {
    const px = Math.round(padding + gx * cellW)
    const py = Math.round(padding + gy * cellH)
    const pw = Math.round(cellW)
    const ph = Math.round(cellH)

    for (let dy = 0; dy < ph; dy++) {
      for (let dx = 0; dx < pw; dx++) {
        const x = px + dx
        const y = py + dy
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const idx = (size * y + x) * 4
          data[idx] = color.r
          data[idx + 1] = color.g
          data[idx + 2] = color.b
          data[idx + 3] = 255
        }
      }
    }
  }
}

async function createIcon(size) {
  const png = new PNG({ width: size, height: size, colorType: 6 }) // 6 = RGBA
  const radius = Math.round(size * 0.2)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) * 4

      if (isInsideRoundedRectStrict(x, y, size, radius)) {
        // Blue background
        png.data[idx] = BG_R
        png.data[idx + 1] = BG_G
        png.data[idx + 2] = BG_B
        png.data[idx + 3] = 255
      } else {
        // Transparent
        png.data[idx] = 0
        png.data[idx + 1] = 0
        png.data[idx + 2] = 0
        png.data[idx + 3] = 0
      }
    }
  }

  // Draw letter M
  drawM(png.data, size, 1)

  return new Promise((resolve, reject) => {
    const chunks = []
    png.pack()
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', reject)
  })
}

const sizes = [192, 512]

for (const size of sizes) {
  const buffer = await createIcon(size)
  const outPath = path.join(outputDir, `icon-${size}.png`)
  fs.writeFileSync(outPath, buffer)
  console.log(`Generated ${outPath} (${buffer.length} bytes)`)
}

console.log('Icons generated successfully!')
