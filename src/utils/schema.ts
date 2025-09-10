import z from "zod";

// ===== AUTH SCHEMA ===== //

export const emailSchema = z.string().min(1).max(255);
export const passwordSchema = z.string();
export const verificatioCodeSchema = z.string().min(1).max(255);
export const stringSchema = z.string().min(1).max(255);

export const loginSchema = z.object({
  email: emailSchema,
  userAgent: z.string(),
  ipAddress: z.string(),
  password: passwordSchema.min(6, {
    message: "Please check your credentials and try again",
  }),
});

export const registerSchema = () =>
  loginSchema
    .extend({
      name: z.string().min(3).max(60),
      password: passwordSchema.min(6, {
        message: "Passwords must not be less than 6 digits",
      }),
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
    name: z.string(),
    phone: z.string(),
    type: z.enum(["BUSINESS", "PERSONAL"]),
  });

export const updateContactSchema = () => createContactSchema().partial();

export const reportContactSchema = () =>
  z.object({
    reason: z.string().max(30),
    phone: z.string().min(3).max(11),
    message: z.string().max(1024),
  });
