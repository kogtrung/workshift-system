import request from 'supertest';
import { createApp } from '../../src/app';
import { startDb, stopDb, clearDb } from '../helpers/dbHelper';
import { registerAndLogin, authHeader, makeUser } from '../helpers/authHelper';

process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-chars-ok';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-chars';

const app = createApp();
const G = '/api/v1/groups';

beforeAll(async () => { await startDb(); });
afterAll(async () => { await stopDb(); });
afterEach(async () => { await clearDb(); });

// ─── shared setup ─────────────────────────────────────────────────────────────

interface Env {
  mgrToken: string;
  memToken: string;
  groupId: number;
  positionId: number;
  shiftId: number;
}

async function buildEnv(): Promise<Env> {
  const mgr = await registerAndLogin(app, makeUser('mgr'));
  const groupRes = await request(app)
    .post(G)
    .set(authHeader(mgr.token))
    .send({ name: 'Test Group' });
  const groupId: number = groupRes.body.data.id;

  const mem = await registerAndLogin(app, makeUser('mem'));
  await request(app).post(`${G}/${groupId}/join`).set(authHeader(mem.token));
  const pRes = await request(app)
    .get(`${G}/${groupId}/members/pending`)
    .set(authHeader(mgr.token));
  const memberId = pRes.body.data[0].memberId;
  await request(app)
    .patch(`${G}/${groupId}/members/${memberId}`)
    .set(authHeader(mgr.token))
    .send({ action: 'APPROVE' });

  const posRes = await request(app)
    .post(`${G}/${groupId}/positions`)
    .set(authHeader(mgr.token))
    .send({ name: 'Barista' });
  const positionId: number = posRes.body.data.id;

  // Availability for Tuesday (ISO day 2) — shift is 2030-01-15 (Tuesday)
  await request(app)
    .put('/api/v1/availability')
    .set(authHeader(mem.token))
    .send({ slots: [{ dayOfWeek: 2, startTime: '00:00:00', endTime: '23:59:59' }] });

  const shiftRes = await request(app)
    .post(`${G}/${groupId}/shifts`)
    .set(authHeader(mgr.token))
    .send({ date: '2030-01-15', startTime: '08:00:00', endTime: '16:00:00' });
  const shiftId: number = shiftRes.body.data.id;
  await request(app)
    .post(`/api/v1/shifts/${shiftId}/requirements`)
    .set(authHeader(mgr.token))
    .send({ positionId, quantity: 1 });

  const regRes = await request(app)
    .post(`/api/v1/shifts/${shiftId}/register`)
    .set(authHeader(mem.token))
    .send({ positionId });
  const regId: number = regRes.body.data.id;
  await request(app)
    .patch(`/api/v1/registrations/${regId}/approve`)
    .set(authHeader(mgr.token))
    .send({});

  return { mgrToken: mgr.token, memToken: mem.token, groupId, positionId, shiftId };
}

const PAYROLL = (groupId: number) => `${G}/${groupId}/payroll`;

// ─── get payroll ──────────────────────────────────────────────────────────────

describe('GET /groups/:groupId/payroll', () => {
  it('manager thấy toàn bộ payroll tháng → 200 + có item', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .get(PAYROLL(env.groupId))
      .set(authHeader(env.mgrToken))
      .query({ month: 1, year: 2030 });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ month: 1, year: 2030, groupId: env.groupId });
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].shiftsWorked).toBe(1);
    expect(res.body.data.items[0].totalHours).toBe(8);
  });

  it('member chỉ thấy payroll của chính mình → 200', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .get(PAYROLL(env.groupId))
      .set(authHeader(env.memToken))
      .query({ month: 1, year: 2030 });
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
  });

  it('tháng không có ca nào → items rỗng', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .get(PAYROLL(env.groupId))
      .set(authHeader(env.mgrToken))
      .query({ month: 2, year: 2030 });
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(0);
  });

  it('user không phải member → 403', async () => {
    const env = await buildEnv();
    const stranger = await registerAndLogin(app, makeUser('str'));
    const res = await request(app)
      .get(PAYROLL(env.groupId))
      .set(authHeader(stranger.token))
      .query({ month: 1, year: 2030 });
    expect(res.status).toBe(403);
  });

  it('không có token → 401', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .get(PAYROLL(env.groupId))
      .query({ month: 1, year: 2030 });
    expect(res.status).toBe(401);
  });
});

// ─── salary config ────────────────────────────────────────────────────────────

describe('POST/GET /groups/:groupId/salary-configs', () => {
  const SC = (groupId: number) => `${G}/${groupId}/salary-configs`;

  it('manager tạo salary config theo position → 201', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .post(SC(env.groupId))
      .set(authHeader(env.mgrToken))
      .send({ positionId: env.positionId, hourlyRate: 50000, effectiveDate: '2030-01-01' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ positionId: env.positionId, hourlyRate: 50000 });
  });

  it('tạo config với cả userId lẫn positionId → 400', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .post(SC(env.groupId))
      .set(authHeader(env.mgrToken))
      .send({ userId: 1, positionId: env.positionId, hourlyRate: 50000, effectiveDate: '2030-01-01' });
    expect(res.status).toBe(400);
  });

  it('manager lấy danh sách salary configs → 200', async () => {
    const env = await buildEnv();
    await request(app)
      .post(SC(env.groupId))
      .set(authHeader(env.mgrToken))
      .send({ positionId: env.positionId, hourlyRate: 50000, effectiveDate: '2030-01-01' });
    const res = await request(app)
      .get(SC(env.groupId))
      .set(authHeader(env.mgrToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('payroll với salary config → estimatedPay = 8 * hourlyRate', async () => {
    const env = await buildEnv();
    await request(app)
      .post(SC(env.groupId))
      .set(authHeader(env.mgrToken))
      .send({ positionId: env.positionId, hourlyRate: 50000, effectiveDate: '2030-01-01' });
    const res = await request(app)
      .get(PAYROLL(env.groupId))
      .set(authHeader(env.mgrToken))
      .query({ month: 1, year: 2030 });
    expect(res.status).toBe(200);
    expect(res.body.data.items[0].estimatedPay).toBe(400000);
  });
});
