import z from "zod";

// ===== AUTH SCHEMA ===== //

export const emailSchema = z.string().min(1).max(255);
export const passwordSchema = z.string().min(6).max(255);
export const verificatioCodeSchema = z.string().min(1).max(255);
export const stringSchema = z.string().min(1).max(255);

export const loginSchema = z.object({
  email: emailSchema,
  userAgent: z.string(),
  ipAddress: z.string(),
  password: passwordSchema,
});

export const registerSchema = () =>
  loginSchema
    .extend({
      name: z.string().min(3).max(60),
      confirmPassword: passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

export const passwordResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
    verificationCode: verificatioCodeSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ===== CONTACT SCHEMA ===== //

export const createContactSchema = () =>
  z.object({
    fullName: z.string(),
    phoneNumber: z.string(),
    type: z.enum(["BUSINESS", "PERSONAL"]),
  });

export const updateContactSchema = () => createContactSchema().partial();
