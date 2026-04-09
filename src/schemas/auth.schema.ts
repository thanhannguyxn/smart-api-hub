import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: "Email không đúng định dạng" }),
  password: z.string().min(6, { message: "Mật khẩu phải dài ít nhất 6 ký tự" }),
  role: z.enum(['admin', 'user']).optional().default('user')
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Email không đúng định dạng" }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" })
});