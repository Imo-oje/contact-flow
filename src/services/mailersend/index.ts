import "dotenv/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { MAILER_SEND_API_KEY } from "../../constants/env";

const mailerSend = new MailerSend({
  apiKey: MAILER_SEND_API_KEY,
});

export default mailerSend;
