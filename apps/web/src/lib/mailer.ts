import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'localhost',
  port: Number(process.env.SMTP_PORT ?? 25),
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendVerificationEmail(to: string, code: string, name: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'noreply@leetcot.ru',
    to,
    subject: '🐱 Код подтверждения ЛитКот',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, sans-serif; background: #09090b; color: #fafafa; margin: 0; padding: 0; }
          .container { max-width: 480px; margin: 40px auto; padding: 40px; background: #18181b; border-radius: 16px; border: 1px solid #27272a; }
          .logo { font-size: 28px; font-weight: 900; color: #ec4899; margin-bottom: 8px; }
          .greeting { font-size: 16px; color: #a1a1aa; margin-bottom: 32px; }
          .code-box { background: #09090b; border: 1px solid #ec489940; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .code { font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #ec4899; font-family: monospace; }
          .hint { font-size: 13px; color: #71717a; margin-top: 8px; }
          .footer { font-size: 12px; color: #52525b; margin-top: 32px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🐱 ЛитКот</div>
          <div class="greeting">Привет, ${name}! Вот твой код для завершения регистрации:</div>
          <div class="code-box">
            <div class="code">${code}</div>
            <div class="hint">Код действителен 15 минут</div>
          </div>
          <div class="footer">Если ты не регистрировался — просто проигнорируй это письмо.</div>
        </div>
      </body>
      </html>
    `,
  });
}
