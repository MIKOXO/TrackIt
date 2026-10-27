import { z } from 'zod';

const emailSchema = z
  .string({ message: 'Valid email is required.' })
  .trim()
  .toLowerCase()
  .email('Valid email is required.');

const passwordSchema = z
  .string({ message: 'Password is required.' })
  .min(1, 'Password is required.');

const nameSchema = z
  .string({ message: 'Name is required.' })
  .trim()
  .min(1, 'Name is required.')
  .max(120, 'Name must be at most 120 characters.');

const currencySchema = z
  .string({ message: 'Currency must be a 3-letter code.' })
  .trim()
  .toUpperCase()
  .length(3, 'Currency must be a 3-letter code.');

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    currency: currencySchema.optional(),
  });

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string().optional(),
});

export const deleteAccountSchema = z.object({
  password: passwordSchema,
});
