import 'dotenv/config';

export async function sendSlackReport(text) {
  const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  const USER_ID = process.env.SLACK_USER_ID || '';
  if (!WEBHOOK_URL) { console.warn('⚠️  SLACK_WEBHOOK_URL not set'); return; }
  const payload = { text: USER_ID ? `<@${USER_ID}>\n${text}` : text, unfurl_links: false };
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`);
  console.log('📨  Slack DM sent!');
}
