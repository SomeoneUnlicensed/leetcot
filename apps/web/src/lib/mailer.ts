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

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

const brandHeader = `
  <div class="brand">
    <div class="product">lentatech</div>
  </div>
`;

export async function sendArlistLinkedEmail(to: string, name: string) {
  const safeName = escapeHtml(name);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'noreply@arlist.ru',
    to,
    subject: '🐱 Твой аккаунт привязан к Arlist ID',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, sans-serif; background: #09090b; color: #fafafa; margin: 0; padding: 0; }
          .container { max-width: 480px; margin: 40px auto; padding: 40px; background: #18181b; border-radius: 16px; border: 1px solid #27272a; }
          .brand { margin-bottom: 20px; }
          .brand-mark { margin-bottom: 14px; color: #fafafa; font-family: Arial Black, Arial, sans-serif; font-size: 22px; font-weight: 900; letter-spacing: 0; line-height: 1; text-transform: lowercase; }
          .product { font-size: 22px; font-weight: 900; color: #fafafa; }
          .greeting { font-size: 16px; color: #a1a1aa; margin-bottom: 24px; }
          .box { background: #09090b; border: 1px solid #ec489940; border-radius: 12px; padding: 20px; margin: 24px 0; font-size: 14px; color: #fafafa; }
          .footer { font-size: 12px; color: #52525b; margin-top: 32px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${brandHeader}
          <div class="greeting">Привет, ${safeName}!</div>
          <div class="box">
            Твой аккаунт ЛитКот теперь привязан к <strong>Arlist ID</strong>. С этого момента входи на сайт только через кнопку «Войти с Arlist ID» — вход по email и паролю для этого аккаунта больше не доступен.
          </div>
          <div class="footer">Если это не ты — напиши нам на hello@arlist.ru.</div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendVerificationEmail(to: string, code: string, name: string) {
  const safeCode = escapeHtml(code);
  const safeName = escapeHtml(name);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'noreply@leetcot.ru',
    to,
    subject: 'Код подтверждения — Дебаг-Симулятор',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, sans-serif; background: #F5F9FF; color: #131722; margin: 0; padding: 0; }
          .container { max-width: 480px; margin: 40px auto; padding: 40px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; }
          .brand { margin-bottom: 20px; }
          .product { font-size: 22px; font-weight: 900; color: #00A0FF; }
          .greeting { font-size: 16px; color: #131722; margin-bottom: 32px; }
          .code-box { background: #F5F9FF; border: 1px solid #00A0FF40; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .code { font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #00A0FF; font-family: monospace; }
          .hint { font-size: 13px; color: #64748b; margin-top: 8px; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${brandHeader}
          <div class="greeting">Привет, ${safeName}! Вот твой код для завершения регистрации:</div>
          <div class="code-box">
            <div class="code">${safeCode}</div>
            <div class="hint">Код действителен 15 минут</div>
          </div>
          <div class="footer">Если ты не регистрировался — просто проигнорируй это письмо.</div>
        </div>
      </body>
      </html>
    `,
  });
}
