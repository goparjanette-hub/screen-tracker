import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendReportByEmail(htmlContent, dateStr) {
  const to = process.env.REPORT_TO || process.env.GMAIL_USER;

  await transporter.sendMail({
    from: `"Screen Tracker" <${process.env.GMAIL_USER}>`,
    to,
    subject: `📊 Screen Tracker — Reporte ${dateStr}`,
    html: htmlContent,
  });

  console.log(`📧  Reporte enviado a ${to}`);
}
