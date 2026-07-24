import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from '../validators';

export const signUpDto = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const signInDto = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type SignUpInput = z.infer<typeof signUpDto>;
export type SignInInput = z.infer<typeof signInDto>;
