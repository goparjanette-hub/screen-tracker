import { getSnapshotsForDate, saveDailyReport } from './db.js';
import { openDailyReportInBrowser } from './report-html.js';
import 'dotenv/config';

const INTERVAL = Number(process.env.CAPTURE_INTERVAL_MINUTES) || 5;

export async function generateDailyReport(dateStr) {
  const today = dateStr || new Date().toISOString().slice(0, 10);
  const snapshots = getSnapshotsForDate(today);
  if (!snapshots.length) { console.log(`📭  No snapshots for ${today}`); return null; }

  const totalMinutes = snapshots.length * INTERVAL;
  const prodMinutes  = snapshots.filter(s => s.productive === 1).length * INTERVAL;
  const pct = Math.round((prodMinutes / totalMinutes) * 100);

  const appMap = {}, catMap = {}, taskMap = {};
  for (const s of snapshots) {
    const app = s.app || 'Unknown';
    appMap[app] = appMap[app] || { minutes: 0, productive: s.productive === 1 };
    appMap[app].minutes += INTERVAL;
    let cat = 'other';
    try { cat = JSON.parse(s.raw_analysis || '{}').category || 'other'; } catch {}
    catMap[cat] = (catMap[cat] || 0) + INTERVAL;
    const t = s.task || 'Unknown';
    taskMap[t] = (taskMap[t] || 0) + INTERVAL;
  }

  const appLines  = Object.entries(appMap).sort((a,b)=>b[1].minutes-a[1].minutes).map(([a,d])=>`  • ${a}: ${d.minutes} min ${d.productive?'✅':'🎮'}`).join('\n');
  const catLines  = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([c,m])=>`  • ${c}: ${m} min`).join('\n');
  const taskLines = Object.entries(taskMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([t,m])=>`  • ${t} (${m} min)`).join('\n');

  const summary = [
    `📊 *Screen Tracker — Daily Report ${today}*`, '',
    `🕐 *Total tracked:* ${totalMinutes} min (${snapshots.length} snapshots)`,
    `⚡ *Productivo:* ${prodMinutes} min (${pct}%)`,
    `🎮 *Distracción:* ${totalMinutes - prodMinutes} min (${100 - pct}%)`, '',
    `*🖥️ Por App:*`, appLines, '',
    `*🗂️ Por Categoría:*`, catLines, '',
    `*📝 Top Tareas:*`, taskLines, '',
    pct >= 70 ? '🔥 *Gran día, lo lograste!*' : pct >= 50 ? '👍 *Día decente. Mañana más!*' : '⚠️ *Muchas distracciones hoy. Mañana es nuevo día!*'
  ].join('\n');

  saveDailyReport({ report_date: today, total_minutes: totalMinutes, prod_minutes: prodMinutes, summary, sent_to_slack: 0 });
  console.log('\n' + summary + '\n');
  return { today, totalMinutes, prodMinutes, pct, summary };
}

if (process.argv[1].endsWith('report.js')) {
  const result = await generateDailyReport(process.argv[2]);
  if (result) await openDailyReportInBrowser(process.argv[2], true); // true = emailMode
}
