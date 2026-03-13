import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export const sendEmail = async (data: Mail.Options) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    ...data,
    from: `"No Reply" <${process.env.EMAIL as string}>`,
  });

  console.log("message sent: %s", info.messageId);
};