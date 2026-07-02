import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const extensionDir = path.resolve('./chrome-extension');
const iconsDir = path.join(extensionDir, 'icons');
const publicDir = path.resolve('./public');

// Ensure directories exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Standard 1x1 pixel transparent PNG block base64 for general chrome plugin compatibility
const standardBase64Png = 'iVBOR0e5KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const pngBuffer = Buffer.from(standardBase64Png, 'base64');

// Write the essential Chrome icons
fs.writeFileSync(path.join(iconsDir, 'icon16.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), pngBuffer);

console.log("[Nexus Build] Chrome extension icon generation complete.");

// Initialize AdmZip and compress
const zip = new AdmZip();
zip.addLocalFolder(extensionDir);

// Output target zip
const targetZipPath = path.join(publicDir, 'nexus_chrome_extension.zip');
zip.writeZip(targetZipPath);

console.log(`[Nexus Build] Chrome extension compiled successfully into a ZIP: ${targetZipPath}`);
