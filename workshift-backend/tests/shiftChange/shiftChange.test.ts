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
  fromShiftId: number;
  toShiftId: number;
  fromRegId: number;
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

  // Availability for Tuesday (ISO day 2) — both test shifts fall on Tuesdays
  await request(app)
    .put('/api/v1/availability')
    .set(authHeader(mem.token))
    .send({ slots: [{ dayOfWeek: 2, startTime: '00:00:00', endTime: '23:59:59' }] });

  // fromShift: 2030-01-15 (Tuesday)
  const fromShiftRes = await request(app)
    .post(`${G}/${groupId}/shifts`)
    .set(authHeader(mgr.token))
    .send({ date: '2030-01-15', startTime: '08:00:00', endTime: '16:00:00' });
  const fromShiftId: number = fromShiftRes.body.data.id;
  await request(app)
    .post(`/api/v1/shifts/${fromShiftId}/requirements`)
    .set(authHeader(mgr.token))
    .send({ positionId, quantity: 2 });

  const regRes = await request(app)
    .post(`/api/v1/shifts/${fromShiftId}/register`)
    .set(authHeader(mem.token))
    .send({ positionId });
  const fromRegId: number = regRes.body.data.id;
  await request(app)
    .patch(`/api/v1/registrations/${fromRegId}/approve`)
    .set(authHeader(mgr.token))
    .send({});

  // toShift: 2030-01-22 (Tuesday) — different date, same day of week
  const toShiftRes = await request(app)
    .post(`${G}/${groupId}/shifts`)
    .set(authHeader(mgr.token))
    .send({ date: '2030-01-22', startTime: '08:00:00', endTime: '16:00:00' });
  const toShiftId: number = toShiftRes.body.data.id;
  await request(app)
    .post(`/api/v1/shifts/${toShiftId}/requirements`)
    .set(authHeader(mgr.token))
    .send({ positionId, quantity: 1 });

  return { mgrToken: mgr.token, memToken: mem.token, groupId, positionId, fromShiftId, toShiftId, fromRegId };
}

const SCR = (groupId: number) => `${G}/${groupId}/shift-change-requests`;

// ─── create request ───────────────────────────────────────────────────────────

describe('POST /groups/:groupId/shift-change-requests — tạo yêu cầu đổi ca', () => {
  it('member tạo yêu cầu đổi sang ca khác → 201', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .post(SCR(env.groupId))
      .set(authHeader(env.memToken))
      .send({ fromShiftId: env.fromShiftId, toShiftId: env.toShiftId });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: 'PENDING', fromShiftId: env.fromShiftId, toShiftId: env.toShiftId });
  });

  it('member tạo yêu cầu xin nghỉ (toShiftId null) → 201', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .post(SCR(env.groupId))
      .set(authHeader(env.memToken))
      .send({ fromShiftId: env.fromShiftId, toShiftId: null });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: 'PENDING', toShiftId: null });
  });

  it('không có đăng ký approved cho ca nguồn → 400', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .post(SCR(env.groupId))
      .set(authHeader(env.memToken))
      .send({ fromShiftId: env.toShiftId, toShiftId: null });
    expect(res.status).toBe(400);
  });

  it('ca nguồn không tồn tại → 404', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .post(SCR(env.groupId))
      .set(authHeader(env.memToken))
      .send({ fromShiftId: 99999, toShiftId: null });
    expect(res.status).toBe(404);
  });

  it('yêu cầu trùng lặp (đã có PENDING) → 409', async () => {
    const env = await buildEnv();
    await request(app)
      .post(SCR(env.groupId))
      .set(authHeader(env.memToken))
      .send({ fromShiftId: env.fromShiftId, toShiftId: null });
    const res = await request(app)
      .post(SCR(env.groupId))
      .set(authHeader(env.memToken))
      .send({ fromShiftId: env.fromShiftId, toShiftId: null });
    expect(res.status).toBe(409);
  });
});

// ─── approve / reject ─────────────────────────────────────────────────────────

describe('PATCH .../approve + reject', () => {
  async function createPendingRequest(env: Env): Promise<number> {
    const res = await request(app)
      .post(SCR(env.groupId))
      .set(authHeader(env.memToken))
      .send({ fromShiftId: env.fromShiftId, toShiftId: null });
    return res.body.data.id as number;
  }

  it('manager duyệt xin nghỉ → status APPROVED', async () => {
    const env = await buildEnv();
    const reqId = await createPendingRequest(env);
    const res = await request(app)
      .patch(`${SCR(env.groupId)}/${reqId}/approve`)
      .set(authHeader(env.mgrToken))
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'APPROVED' });
  });

  it('manager duyệt đổi ca → status APPROVED', async () => {
    const env = await buildEnv();
    const createRes = await request(app)
      .post(SCR(env.groupId))
      .set(authHeader(env.memToken))
      .send({ fromShiftId: env.fromShiftId, toShiftId: env.toShiftId });
    const reqId = createRes.body.data.id as number;
    const res = await request(app)
      .patch(`${SCR(env.groupId)}/${reqId}/approve`)
      .set(authHeader(env.mgrToken))
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'APPROVED' });
  });

  it('manager từ chối → status REJECTED', async () => {
    const env = await buildEnv();
    const reqId = await createPendingRequest(env);
    const res = await request(app)
      .patch(`${SCR(env.groupId)}/${reqId}/reject`)
      .set(authHeader(env.mgrToken))
      .send({ managerNote: 'Không thể xếp lịch' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'REJECTED' });
  });

  it('member thường không được duyệt → 403', async () => {
    const env = await buildEnv();
    const reqId = await createPendingRequest(env);
    const res = await request(app)
      .patch(`${SCR(env.groupId)}/${reqId}/approve`)
      .set(authHeader(env.memToken))
      .send({});
    expect(res.status).toBe(403);
  });
});

// ─── list pending ─────────────────────────────────────────────────────────────

describe('GET /groups/:groupId/shift-change-requests/pending', () => {
  it('manager thấy danh sách pending → 200', async () => {
    const env = await buildEnv();
    await request(app)
      .post(SCR(env.groupId))
      .set(authHeader(env.memToken))
      .send({ fromShiftId: env.fromShiftId, toShiftId: null });
    const res = await request(app)
      .get(`${SCR(env.groupId)}/pending`)
      .set(authHeader(env.mgrToken));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('member thường không xem được → 403', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .get(`${SCR(env.groupId)}/pending`)
      .set(authHeader(env.memToken));
    expect(res.status).toBe(403);
  });
});
