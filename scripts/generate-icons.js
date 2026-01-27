const sharp = require('sharp');
const fs = require('fs');

// Crear un icono simple con el emoji ✨
async function generateIcons() {
  // Crear un SVG como buffer
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#8b5cf6"/>
      <text x="256" y="340" font-size="300" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">✨</text>
    </svg>
  `;

  // Generar icono de 512x512
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');

  // Generar icono de 192x192
  await sharp(Buffer.from(svg))
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');

  console.log('✅ Icons generated successfully!');
}

generateIcons().catch(console.error);
