import request from 'supertest';
import { createApp } from '../../src/app';
import { startDb, stopDb, clearDb } from '../helpers/dbHelper';
import { registerAndLogin, authHeader, makeUser } from '../helpers/authHelper';

process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-chars-ok';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-chars';

const app = createApp();
const G = '/api/v1/groups';
const REG = '/api/v1/registrations';

beforeAll(async () => { await startDb(); });
afterAll(async () => { await stopDb(); });
afterEach(async () => { await clearDb(); });

// ─── shared setup ────────────────────────────────────────────────────────────

interface Env {
  mgrToken: string;
  memToken: string;
  groupId: number;
  positionId: number;
  shiftId: number;
}

async function buildEnv(quota = 1): Promise<Env> {
  // Manager tạo group
  const mgr = await registerAndLogin(app, makeUser('mgr'));
  const groupRes = await request(app)
    .post(G)
    .set(authHeader(mgr.token))
    .send({ name: 'Test Group' });
  const groupId: number = groupRes.body.data.id;

  // Member join + approve
  const mem = await registerAndLogin(app, makeUser('mem'));
  await request(app).post(`${G}/${groupId}/join`).set(authHeader(mem.token));
  const pendingRes = await request(app)
    .get(`${G}/${groupId}/members/pending`)
    .set(authHeader(mgr.token));
  const memberId = pendingRes.body.data[0].memberId;
  await request(app)
    .patch(`${G}/${groupId}/members/${memberId}`)
    .set(authHeader(mgr.token))
    .send({ action: 'APPROVE' });

  // Tạo position
  const posRes = await request(app)
    .post(`${G}/${groupId}/positions`)
    .set(authHeader(mgr.token))
    .send({ name: 'Barista' });
  const positionId: number = posRes.body.data.id;

  // Tạo shift
  const shiftRes = await request(app)
    .post(`${G}/${groupId}/shifts`)
    .set(authHeader(mgr.token))
    .send({ date: '2030-01-15', startTime: '08:00:00', endTime: '16:00:00' });
  const shiftId: number = shiftRes.body.data.id;

  // Tạo requirement
  await request(app)
    .post(`/api/v1/shifts/${shiftId}/requirements`)
    .set(authHeader(mgr.token))
    .send({ positionId, quantity: quota });

  // Đặt availability cho member (2030-01-15 là Thứ 3 = ISO day 2)
  await request(app)
    .put('/api/v1/availability')
    .set(authHeader(mem.token))
    .send({ slots: [{ dayOfWeek: 2, startTime: '00:00:00', endTime: '23:59:59' }] });

  return { mgrToken: mgr.token, memToken: mem.token, groupId, positionId, shiftId };
}

// ─── register for shift ───────────────────────────────────────────────────────

describe('POST /shifts/:shiftId/register — đăng ký ca', () => {
  it('member đăng ký hợp lệ → 201', async () => {
    const { memToken, shiftId, positionId } = await buildEnv();
    const res = await request(app)
      .post(`/api/v1/shifts/${shiftId}/register`)
      .set(authHeader(memToken))
      .send({ positionId });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: 'PENDING' });
  });

  it('đăng ký 2 lần cùng ca → 409', async () => {
    const { memToken, shiftId, positionId } = await buildEnv(2);
    await request(app)
      .post(`/api/v1/shifts/${shiftId}/register`)
      .set(authHeader(memToken))
      .send({ positionId });
    const res = await request(app)
      .post(`/api/v1/shifts/${shiftId}/register`)
      .set(authHeader(memToken))
      .send({ positionId });
    expect(res.status).toBe(409);
  });

  it('user chưa phải member approved → 403', async () => {
    const { shiftId, positionId } = await buildEnv();
    const stranger = await registerAndLogin(app, makeUser('str'));
    const res = await request(app)
      .post(`/api/v1/shifts/${shiftId}/register`)
      .set(authHeader(stranger.token))
      .send({ positionId });
    expect(res.status).toBe(403);
  });

  it('positionId không có trong requirement → 400', async () => {
    const { memToken, shiftId } = await buildEnv();
    const res = await request(app)
      .post(`/api/v1/shifts/${shiftId}/register`)
      .set(authHeader(memToken))
      .send({ positionId: 99999 });
    expect(res.status).toBe(400);
  });
});

// ─── approve / reject ─────────────────────────────────────────────────────────

describe('PATCH /registrations/:id/approve + reject', () => {
  async function createPendingReg(env: Env): Promise<number> {
    const res = await request(app)
      .post(`/api/v1/shifts/${env.shiftId}/register`)
      .set(authHeader(env.memToken))
      .send({ positionId: env.positionId });
    return res.body.data.id as number;
  }

  it('manager duyệt → status APPROVED', async () => {
    const env = await buildEnv();
    const regId = await createPendingReg(env);
    const res = await request(app)
      .patch(`${REG}/${regId}/approve`)
      .set(authHeader(env.mgrToken))
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'APPROVED' });
  });

  it('manager từ chối → status REJECTED', async () => {
    const env = await buildEnv();
    const regId = await createPendingReg(env);
    const res = await request(app)
      .patch(`${REG}/${regId}/reject`)
      .set(authHeader(env.mgrToken))
      .send({ managerNote: 'Không phù hợp' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'REJECTED' });
  });

  it('member thường không được duyệt → 403', async () => {
    const env = await buildEnv();
    const regId = await createPendingReg(env);
    const res = await request(app)
      .patch(`${REG}/${regId}/approve`)
      .set(authHeader(env.memToken))
      .send({});
    expect(res.status).toBe(403);
  });

  it('quota đầy → duyệt thêm → 400', async () => {
    const env = await buildEnv(1); // quota = 1
    const regId = await createPendingReg(env);

    // Approve first registration to fill quota
    await request(app).patch(`${REG}/${regId}/approve`).set(authHeader(env.mgrToken)).send({});

    // Second member tries to register + approve
    const mem2 = await registerAndLogin(app, makeUser('m2'));
    await request(app).post(`${G}/${env.groupId}/join`).set(authHeader(mem2.token));
    const pRes = await request(app)
      .get(`${G}/${env.groupId}/members/pending`)
      .set(authHeader(env.mgrToken));
    await request(app)
      .patch(`${G}/${env.groupId}/members/${pRes.body.data[0].memberId}`)
      .set(authHeader(env.mgrToken))
      .send({ action: 'APPROVE' });

    await request(app)
      .put('/api/v1/availability')
      .set(authHeader(mem2.token))
      .send({ slots: [{ dayOfWeek: 2, startTime: '00:00:00', endTime: '23:59:59' }] });

    const reg2Res = await request(app)
      .post(`/api/v1/shifts/${env.shiftId}/register`)
      .set(authHeader(mem2.token))
      .send({ positionId: env.positionId });
    const reg2Id = reg2Res.body.data.id as number;

    const res = await request(app)
      .patch(`${REG}/${reg2Id}/approve`)
      .set(authHeader(env.mgrToken))
      .send({});
    expect(res.status).toBe(409);
  });
});

// ─── cancel ───────────────────────────────────────────────────────────────────

describe('PATCH /registrations/:id/cancel', () => {
  it('member hủy đăng ký PENDING của chính mình → 200', async () => {
    const env = await buildEnv();
    const regRes = await request(app)
      .post(`/api/v1/shifts/${env.shiftId}/register`)
      .set(authHeader(env.memToken))
      .send({ positionId: env.positionId });
    const regId = regRes.body.data.id as number;
    const res = await request(app)
      .patch(`${REG}/${regId}/cancel`)
      .set(authHeader(env.memToken))
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'CANCELLED' });
  });

  it('member khác không thể hủy đăng ký của người khác → 403', async () => {
    const env = await buildEnv();
    const regRes = await request(app)
      .post(`/api/v1/shifts/${env.shiftId}/register`)
      .set(authHeader(env.memToken))
      .send({ positionId: env.positionId });
    const regId = regRes.body.data.id as number;

    // Tạo member2 approved
    const mem2 = await registerAndLogin(app, makeUser('m2c'));
    await request(app).post(`${G}/${env.groupId}/join`).set(authHeader(mem2.token));
    const pRes = await request(app)
      .get(`${G}/${env.groupId}/members/pending`)
      .set(authHeader(env.mgrToken));
    await request(app)
      .patch(`${G}/${env.groupId}/members/${pRes.body.data[0].memberId}`)
      .set(authHeader(env.mgrToken))
      .send({ action: 'APPROVE' });

    const res = await request(app)
      .patch(`${REG}/${regId}/cancel`)
      .set(authHeader(mem2.token))
      .send({});
    expect(res.status).toBe(403);
  });
});

// ─── pending list ─────────────────────────────────────────────────────────────

describe('GET /shifts/:shiftId/registrations/pending', () => {
  it('manager thấy registrations pending → 200', async () => {
    const env = await buildEnv();
    await request(app)
      .post(`/api/v1/shifts/${env.shiftId}/register`)
      .set(authHeader(env.memToken))
      .send({ positionId: env.positionId });
    const res = await request(app)
      .get(`/api/v1/shifts/${env.shiftId}/registrations/pending`)
      .set(authHeader(env.mgrToken));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('member thường không xem được → 403', async () => {
    const env = await buildEnv();
    const res = await request(app)
      .get(`/api/v1/shifts/${env.shiftId}/registrations/pending`)
      .set(authHeader(env.memToken));
    expect(res.status).toBe(403);
  });
});
