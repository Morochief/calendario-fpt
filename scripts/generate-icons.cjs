const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, '..', 'public', 'logo.png');
const sizes = [192, 384, 512];

async function generate() {
  const info = await sharp(input).metadata();
  console.log('Logo dimensions:', info.width, 'x', info.height);

  for (const size of sizes) {
    const outPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`);
    await sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`Generated: icons/icon-${size}x${size}.png`);
  }
}

generate().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
