// common/helpers/jwt.helper.ts
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { jwtConstants } from '../constants/jwt.constants';

export const generateToken = (user: {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
}) => {
  const payload = {
    sub: user.userId,
    userId: user.userId,
    email: user.email,
    roleId: user.roleId,
    roleName: user.roleName,
  };

  return jwt.sign(payload, jwtConstants.secret, {
    expiresIn: jwtConstants.expiresIn,
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, jwtConstants.secret);
  } catch (error) {
    return null;
  }
};

// Thêm hàm set cookie
export const setTokenCookie = (res: Response, user: any) => {
  const token = generateToken(user);
  
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    path: '/',
  });
  
  return token;
};

export const clearTokenCookie = (res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};