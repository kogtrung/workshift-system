import request from 'supertest';
import { Express } from 'express';

export interface Tokens {
  token: string;
  refreshToken: string;
}

let _userCounter = 0;

export function makeUser(suffix?: string) {
  const id = suffix ?? String(++_userCounter);
  return {
    username: `user${id}`,
    email: `user${id}@test.com`,
    password: 'password123',
    fullName: `User ${id}`,
  };
}

export async function registerAndLogin(app: Express, user = makeUser()): Promise<Tokens & { username: string }> {
  await request(app).post('/api/v1/auth/register').send(user);
  const res = await request(app).post('/api/v1/auth/login').send({
    usernameOrEmail: user.username,
    password: user.password,
  });
  return { ...res.body.data, username: user.username };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
