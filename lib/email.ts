import nodemailer from "nodemailer";

export function hasEmailConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

export function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true") === "true";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getVerificationMailContent(email: string, code: string) {
  return {
    from: `Memory的小破站 <${process.env.SMTP_USER}>`,
    to: email,
    subject: "邮箱验证码",
    text: `您的验证码是：${code}，10分钟内有效。`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.8;color:#111">
      <h2>邮箱验证码</h2>
      <p>您的验证码是 <strong style="font-size:24px;letter-spacing:4px;">${code}</strong></p>
      <p>验证码 10 分钟内有效，请尽快完成验证。</p>
    </div>`,
  };
}
