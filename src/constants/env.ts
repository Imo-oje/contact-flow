function getEnv(
  key: string | number,
  defaultValue?: string | number
): string | number {
  const value = process.env[key] || defaultValue;
  if (value === undefined)
    throw new Error(`Environment variable ${key} is not set`);
  return value;
}

export const PORT = getEnv("PORT", 3000);
export const APP_ORIGIN = getEnv("APP_ORIGIN") as string;
export const DATABASE_URL = getEnv("DATABASE_URL") as string;
export const RESEND_API_KEY = getEnv("RESEND_API_KEY") as string;
export const NODE_ENV = getEnv("NODE_ENV") as string;
export const EMAIL_SENDER = getEnv("EMAIL_SENDER") as string;
export const JWT_SECRET = getEnv("JWT_SECRET") as string;
