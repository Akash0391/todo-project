import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: EmailOptions): Promise<void> {
  // Use a real SMTP service in production
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email", // Ethereal is for testing (no real delivery)
    port: 587,
    secure: false,
    auth: {
      user: "your_ethereal_user", // Replace with real Ethereal credentials
      pass: "your_ethereal_pass",
    },
  });

  const info = await transporter.sendMail({
    from: '"To-Do Reminder" <no-reply@todoapp.com>',
    to,
    subject,
    text,
  });

  console.log("Email sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}
