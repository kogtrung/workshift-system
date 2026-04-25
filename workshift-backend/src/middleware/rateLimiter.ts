import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

const isTest = process.env.NODE_ENV === 'test';
const windowMs15 = 15 * 60 * 1000;
const windowMs60 = 60 * 60 * 1000;

const passThrough: RequestHandler = (_req, _res, next) => next();

export const loginLimiter = isTest
  ? passThrough
  : rateLimit({
      windowMs: windowMs15,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 429, message: 'Quá nhiều lần đăng nhập, thử lại sau 15 phút.' },
    });

export const registerLimiter = isTest
  ? passThrough
  : rateLimit({
      windowMs: windowMs60,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 429, message: 'Quá nhiều lần đăng ký, thử lại sau 1 giờ.' },
    });

export const refreshLimiter = isTest
  ? passThrough
  : rateLimit({
      windowMs: windowMs15,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 429, message: 'Quá nhiều yêu cầu refresh token, thử lại sau 15 phút.' },
    });
