const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#4f46e5"/>
  <g transform="translate(256,256)">
    <circle cx="0" cy="-20" r="120" fill="none" stroke="white" stroke-width="24"/>
    <text x="0" y="10" text-anchor="middle" font-family="Arial,sans-serif" font-size="140" font-weight="bold" fill="white">$</text>
    <circle cx="70" cy="-100" r="32" fill="#10b981"/>
    <path d="M58,-112 L70,-96 L86,-116" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

async function generate() {
  const svgBuffer = Buffer.from(svgContent);
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }
  // Also generate apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, `apple-touch-icon.png`));
  console.log("Generated apple-touch-icon.png");

  // Favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(iconsDir, `favicon-32x32.png`));
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(iconsDir, `favicon-16x16.png`));
  console.log("Generated favicons");
  console.log("All icons generated successfully!");
}

generate().catch(console.error);
