import request from 'supertest';
import { createApp } from '../../src/app';
import { startDb, stopDb, clearDb } from '../helpers/dbHelper';

// JWT secrets cần có trước khi createApp() gọi loadAuthEnv()
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-chars-ok';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-chars';

const app = createApp();

const BASE = '/api/v1/auth';

const USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User',
};

beforeAll(async () => { await startDb(); });
afterAll(async () => { await stopDb(); });
afterEach(async () => { await clearDb(); });

// ─── helpers ────────────────────────────────────────────────────────────────

async function registerAndLogin(u = USER) {
  await request(app).post(`${BASE}/register`).send(u);
  const res = await request(app).post(`${BASE}/login`).send({
    usernameOrEmail: u.username,
    password: u.password,
  });
  // API trả về { token, refreshToken, ... }
  return res.body.data as { token: string; refreshToken: string };
}

// ─── register ───────────────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  it('tạo user mới thành công → 201', async () => {
    const res = await request(app).post(`${BASE}/register`).send(USER);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ username: USER.username, email: USER.email });
  });

  it('username trùng → 409', async () => {
    await request(app).post(`${BASE}/register`).send(USER);
    const res = await request(app).post(`${BASE}/register`).send(USER);
    expect(res.status).toBe(409);
  });

  it('email trùng → 409', async () => {
    await request(app).post(`${BASE}/register`).send(USER);
    const res = await request(app).post(`${BASE}/register`).send({
      ...USER,
      username: 'other',
    });
    expect(res.status).toBe(409);
  });

  it('thiếu field bắt buộc → 400', async () => {
    const res = await request(app).post(`${BASE}/register`).send({ username: 'x' });
    expect(res.status).toBe(400);
  });
});

// ─── login ───────────────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(USER);
  });

  it('đăng nhập bằng username → 200 + tokens', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      usernameOrEmail: USER.username,
      password: USER.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('đăng nhập bằng email → 200 + tokens', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      usernameOrEmail: USER.email,
      password: USER.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('mật khẩu sai → 401', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      usernameOrEmail: USER.username,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('user không tồn tại → 401', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      usernameOrEmail: 'nobody',
      password: 'whatever',
    });
    expect(res.status).toBe(401);
  });
});

// ─── refresh ─────────────────────────────────────────────────────────────────

describe('POST /auth/refresh', () => {
  it('refresh token hợp lệ → 200 + tokens mới', async () => {
    const { refreshToken } = await registerAndLogin();
    const res = await request(app).post(`${BASE}/refresh`).send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('refresh token cũ bị revoke sau khi đã dùng → 401', async () => {
    const { refreshToken } = await registerAndLogin();
    await request(app).post(`${BASE}/refresh`).send({ refreshToken });
    const res = await request(app).post(`${BASE}/refresh`).send({ refreshToken });
    expect(res.status).toBe(401);
  });

  it('token giả → 401', async () => {
    const res = await request(app).post(`${BASE}/refresh`).send({ refreshToken: 'fake.token.here' });
    expect(res.status).toBe(401);
  });
});

// ─── logout ──────────────────────────────────────────────────────────────────

describe('POST /auth/logout', () => {
  it('logout với access token hợp lệ → 200', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post(`${BASE}/logout`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('không có token → 401', async () => {
    const res = await request(app).post(`${BASE}/logout`);
    expect(res.status).toBe(401);
  });
});
