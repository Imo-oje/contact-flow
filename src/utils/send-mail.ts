import mailersend from "../services/mailersend";
import { EMAIL_SENDER, SITE_NAME, EMAIL_TEST_RECEIVER } from "../constants/env";
import { EmailParams, Recipient, Sender } from "mailersend";

type Params = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const getFromEmail = new Sender(`${SITE_NAME}@${EMAIL_SENDER}`, SITE_NAME);

const getToEmail = [new Recipient(EMAIL_TEST_RECEIVER)];

export const sendMail = async ({ to, subject, text, html }: Params) => {
  console.log("from.email", getFromEmail);
  console.log("to.email", getToEmail);
  try {
    return await mailersend.email.send(
      new EmailParams()
        .setFrom(getFromEmail)
        .setTo(getToEmail)
        .setReplyTo(getFromEmail)
        .setSubject(subject)
        .setText(text)
        .setHtml(html)
    );
  } catch (error: any) {
    console.log("email.error", error);
    return;
  }
};
