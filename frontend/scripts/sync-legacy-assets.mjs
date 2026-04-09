import { access, copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, '..');
const projectRoot = resolve(frontendRoot, '..');
const publicDir = resolve(frontendRoot, 'public');

const legacyAssets = [
  'lecanal-hotel.html',
  'index.css',
  'lecanal-hotel.css',
  'bookingcom-apr-2026.js',
];

await mkdir(publicDir, { recursive: true });

for (const assetName of legacyAssets) {
  const sourcePath = resolve(projectRoot, assetName);
  const targetPath = resolve(publicDir, assetName);

  await access(sourcePath);
  await copyFile(sourcePath, targetPath);
  console.log(`[sync:legacy-assets] copied ${assetName}`);
}
