import nodemailer from "nodemailer";

function createTransporter() {
  const port = Number(
    process.env.SMTP_PORT || 587,
  );

  const secure =
    process.env.SMTP_SECURE === "true" ||
    port === 465;

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error(
      "SMTP configuration is incomplete",
    );
  }

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

export async function sendEmail({
  to,
  subject,
  text,
  html,
}) {
  const transporter =
    createTransporter();

  const from =
    process.env.MAIL_FROM ||
    `LearnFlow Academy <${process.env.SMTP_USER}>`;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}