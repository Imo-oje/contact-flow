function getEnv(
  key: string | number,
  defaultValue?: string | number
): string | number {
  const value = process.env[key] || defaultValue;
  if (value === undefined)
    throw new Error(`Environment variable ${key} is not set`);
  return value;
}

export const PORT = getEnv("PORT", 8000);
export const APP_ORIGIN = getEnv("APP_ORIGIN") as string;
export const DATABASE_URL = getEnv("DATABASE_URL") as string;
export const NODE_ENV = getEnv("NODE_ENV") as string;
export const EMAIL_SENDER = getEnv("EMAIL_SENDER") as string;
export const JWT_SECRET = getEnv("JWT_SECRET") as string;
export const SITE_NAME = getEnv("SITE_NAME") as string;
export const MAILER_SEND_API_KEY = getEnv("MAILER_SEND_API_KEY") as string;
export const EMAIL_TEST_RECEIVER = getEnv("EMAIL_TEST_RECEIVER") as string;
// nodemailer
export const SMTP_HOST = getEnv("SMTP_HOST") as string;
export const SMTP_PORT = Number(getEnv("SMTP_PORT", 465));
export const SMTP_USER = getEnv("SMTP_USER") as string;
export const OAUTH_CLIENTID = getEnv("OAUTH_CLIENTID") as string;
export const OAUTH_CLIENT_SECRET = getEnv("OAUTH_CLIENT_SECRET") as string;
export const OAUTH_REFRESH_TOKEN = getEnv("OAUTH_REFRESH_TOKEN") as string;
export const REDIRECT_URI = getEnv("REDIRECT_URI", "") as string;
