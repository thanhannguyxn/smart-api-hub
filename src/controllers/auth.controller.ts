import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/knex';
import { catchAsync } from '../utils/catchAsync';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  
  const existingUser = await db('users').where({ email }).first();
  if (existingUser) throw { statusCode: 400, message: 'Email này đã được sử dụng' };

  
  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db('users')
    .insert({ email, password: hashedPassword, role: role || 'user' })
    .returning(['id', 'email', 'role']);

  res.status(201).json({ success: true, data: user });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  
  const user = await db('users').where({ email }).first();
  if (!user) throw { statusCode: 401, message: 'Sai thông tin đăng nhập' };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { statusCode: 401, message: 'Sai thông tin đăng nhập' };

  
  const token = jwt.sign(
    { id: user.id, role: user.role },
    (process.env.JWT_SECRET as string) || 'defaultsecret',
    { expiresIn: (process.env.JWT_EXPIRES_IN as string) || '1h' } as jwt.SignOptions
  );

  res.status(200).json({ success: true, data: { token } });
});