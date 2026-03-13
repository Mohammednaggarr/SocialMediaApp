import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { template } from "../Email/verify.email.template";
import { sendEmail } from "../Email/send.email";

export const emailEvent = new EventEmitter();

interface IEmailEvent extends Mail.Options {
  otp: number;
  username: string;
  subject?: string;
  html?: string;
}

emailEvent.on("confirmEmail", async (data: IEmailEvent) => {
  try {
    data.subject = "Please confirm your email";
    data.html = template(data.otp, data.username, data.subject || "Confirm Email");
    await sendEmail(data);
  } catch (error) {
    console.log(error);
  }
});