import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { google } from "googleapis";
import {
  OAUTH_CLIENTID,
  SMTP_USER,
  SMTP_PORT,
  OAUTH_REFRESH_TOKEN,
  SMTP_HOST,
  OAUTH_CLIENT_SECRET,
  REDIRECT_URI,
} from "../../constants/env";

const OAuth2 = new google.auth.OAuth2(
  OAUTH_CLIENTID,
  OAUTH_CLIENT_SECRET,
  REDIRECT_URI
);
OAuth2.setCredentials({ refresh_token: OAUTH_REFRESH_TOKEN });

export const sendMail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  const accessToken = await OAuth2.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      type: "OAuth2",
      user: SMTP_USER,
      clientId: OAUTH_CLIENTID,
      clientSecret: OAUTH_CLIENT_SECRET,
      refreshToken: OAUTH_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  } as SMTPTransport.Options);

  return await transporter.sendMail({
    from: `Contact Flow <${SMTP_USER}>`, // sender address
    to,
    subject,
    text,
    html,
  });
};
