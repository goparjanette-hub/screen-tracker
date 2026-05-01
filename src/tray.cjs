const { app, Tray, Menu, nativeImage } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

let tray = null;
let trackerProcess = null;

function createTrayIcon() {
  const size = 16;
  const data = Buffer.alloc(size * size * 4, 0);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Pantalla simple: rectángulo blanco
      if (x >= 2 && x <= 13 && y >= 3 && y <= 11) {
        data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 255;
      }
    }
  }
  return nativeImage.createFromBitmap(data, { width: size, height: size });
}

function isTrackerRunning() { return trackerProcess !== null; }

function startTracker() {
  if (isTrackerRunning()) return;
  trackerProcess = spawn('node', ['src/index.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  trackerProcess.on('exit', () => { trackerProcess = null; updateMenu(); });
  updateMenu();
}

function stopTracker() {
  if (!isTrackerRunning()) return;
  trackerProcess.kill();
  trackerProcess = null;
  updateMenu();
}

function updateMenu() {
  const running = isTrackerRunning();
  tray.setToolTip(running ? 'Screen Tracker — Activo' : 'Screen Tracker — Pausado');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: running ? '🟢 Activo' : '🔴 Pausado', enabled: false },
    { type: 'separator' },
    { label: '▶ Iniciar', enabled: !running, click: startTracker },
    { label: '⏹ Detener', enabled: running, click: stopTracker },
    { type: 'separator' },
    {
      label: '📊 Reporte ahora',
      click: () => {
        const { writeFileSync } = require('fs');
        const rootDir = path.join(__dirname, '..').replace(/\\/g, '/');
        const fileUrl = `file:///${rootDir}/src/report-html.js`;
        const reportScript = `import { openDailyReportInBrowser } from '${fileUrl}';\nawait openDailyReportInBrowser();\n`;
        const scriptPath = path.join(__dirname, '..', 'data', 'run-report.mjs');
        console.log('Escribiendo script en:', scriptPath);
        console.log('Contenido:', reportScript);
        writeFileSync(scriptPath, reportScript, 'utf8');
        const proc = spawn('node', [scriptPath], {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
          shell: false
        });
        proc.on('error', (err) => console.error('Error spawn:', err));
        proc.on('exit', (code) => console.log('Exit code:', code));
      }
    },
    { type: 'separator' },
    { label: '❌ Salir', click: () => { stopTracker(); app.quit(); } },
  ]));
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') app.dock?.hide();
  tray = new Tray(createTrayIcon());
  updateMenu();
  startTracker();
});

app.on('window-all-closed', (e) => e.preventDefault());
