import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import 'dotenv/config';

const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || './data/screenshots';

export async function captureScreen() {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const filepath = join(SCREENSHOTS_DIR, `screenshot-${timestamp}.jpg`);
  const abspath = resolve(filepath).replace(/\\/g, '\\\\');
  const py = `from PIL import ImageGrab; img=ImageGrab.grab(all_screens=True); img.convert('RGB').save(r'${abspath}','JPEG',quality=85)`;
  execSync(`python -c "${py}"`, { stdio: 'pipe' });
  const imgBuffer = readFileSync(filepath);
  console.log(`📸  Screenshot capturado`);

  const base64 = imgBuffer.toString('base64');

  // Borrar del disco inmediatamente — el análisis se guarda en SQLite
  unlinkSync(filepath);

  return { base64, capturedAt: now.toISOString(), mediaType: 'image/jpeg' };
}
