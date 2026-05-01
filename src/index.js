import cron from 'node-cron';
import 'dotenv/config';
import { captureScreen }      from './capture.js';
import { analyzeScreenshot }  from './analyze.js';
import { saveSnapshot }       from './db.js';
import { generateDailyReport } from './report.js';
import { openDailyReportInBrowser } from './report-html.js';

const INTERVAL    = Number(process.env.CAPTURE_INTERVAL_MINUTES) || 5;
const REPORT_HOUR = Number(process.env.REPORT_HOUR) || 18;

async function runCapture() {
  console.log(`\n🔄  [${new Date().toLocaleTimeString()}] Capturando...`);
  try {
    const { base64, mediaType, capturedAt } = await captureScreen();
    console.log('🤖  Analizando con Claude Vision...');
    const a = await analyzeScreenshot({ base64, mediaType });
    console.log(`${a.productive ? '✅' : '🎮'}  ${a.app} — ${a.task} (${Math.round(a.confidence * 100)}%)`);
    saveSnapshot({
      captured_at: capturedAt,
      screenshot: null,
      app: a.app || 'Unknown',
      task: a.task || 'Unknown',
      productive: a.productive ? 1 : 0,
      confidence: a.confidence || 0,
      raw_analysis: a.rawAnalysis || null,
    });
    console.log('💾  Guardado.');
  } catch (err) {
    console.error('❌  Error en ciclo:', err.message);
  }
}

async function runReport() {
  console.log('\n📊  Generando reporte diario...');
  try {
    const result = await generateDailyReport();
    if (result) await openDailyReportInBrowser(null, true); // true = emailMode
  } catch (err) {
    console.error('❌  Error en reporte:', err.message);
  }
}

console.log('\n╔══════════════════════════════════════╗');
console.log('║      🖥️  Screen Tracker Iniciado      ║');
console.log('╚══════════════════════════════════════╝');
console.log(`📸  Captura cada ${INTERVAL} min | 📊  Reporte a las ${REPORT_HOUR}:00\n`);

await runCapture();
cron.schedule(`*/${INTERVAL} * * * *`, runCapture);
cron.schedule(`0 ${REPORT_HOUR} * * *`, runReport);
process.on('SIGINT', () => { console.log('\n👋  Screen Tracker detenido.'); process.exit(0); });
