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

// ─── helpers ────────────────────────────────────────────────────────────────

async function setupManager() {
  const mgr = await registerAndLogin(app, makeUser('mgr'));
  const res = await request(app)
    .post(G)
    .set(authHeader(mgr.token))
    .send({ name: 'Test Group' });
  return { mgr, groupId: res.body.data.id as number };
}

async function setupMemberPending(groupId: number) {
  const mem = await registerAndLogin(app, makeUser('mem'));
  await request(app)
    .post(`${G}/${groupId}/join`)
    .set(authHeader(mem.token));
  return { mem };
}

async function setupMemberApproved(groupId: number, mgrToken: string) {
  const { mem } = await setupMemberPending(groupId);
  // get pending list to find memberId
  const pending = await request(app)
    .get(`${G}/${groupId}/members/pending`)
    .set(authHeader(mgrToken));
  const memberId = pending.body.data[0]?.memberId;
  await request(app)
    .patch(`${G}/${groupId}/members/${memberId}`)
    .set(authHeader(mgrToken))
    .send({ action: 'APPROVE' });
  return { mem, memberId };
}

// ─── create group ─────────────────────────────────────────────────────────

describe('POST /groups — tạo group', () => {
  it('tạo thành công → 201 + có joinCode', async () => {
    const { token } = await registerAndLogin(app);
    const res = await request(app)
      .post(G)
      .set(authHeader(token))
      .send({ name: 'Quán Cà Phê A' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Quán Cà Phê A' });
    expect(res.body.data).toHaveProperty('joinCode');
  });

  it('không có token → 401', async () => {
    const res = await request(app).post(G).send({ name: 'X' });
    expect(res.status).toBe(401);
  });

  it('thiếu name → 400', async () => {
    const { token } = await registerAndLogin(app);
    const res = await request(app).post(G).set(authHeader(token)).send({});
    expect(res.status).toBe(400);
  });
});

// ─── my groups ──────────────────────────────────────────────────────────────

describe('GET /groups/my-groups', () => {
  it('trả về group vừa tạo với myRole=MANAGER', async () => {
    const { mgr } = await setupManager();
    const res = await request(app)
      .get(`${G}/my-groups`)
      .set(authHeader(mgr.token));
    expect(res.status).toBe(200);
    const groups = res.body.data as Array<{ myRole: string }>;
    expect(groups.some((g) => g.myRole === 'MANAGER')).toBe(true);
  });
});

// ─── join group ─────────────────────────────────────────────────────────────

describe('POST /groups/:id/join', () => {
  it('user mới join → 200 + status PENDING', async () => {
    const { mgr, groupId } = await setupManager();
    const mem = await registerAndLogin(app, makeUser('j1'));
    const res = await request(app)
      .post(`${G}/${groupId}/join`)
      .set(authHeader(mem.token));
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: 'PENDING' });
  });

  it('join lần 2 cùng group → 409', async () => {
    const { groupId } = await setupManager();
    const mem = await registerAndLogin(app, makeUser('j2'));
    await request(app).post(`${G}/${groupId}/join`).set(authHeader(mem.token));
    const res = await request(app).post(`${G}/${groupId}/join`).set(authHeader(mem.token));
    expect(res.status).toBe(409);
  });

  it('group không tồn tại → 404', async () => {
    const { token } = await registerAndLogin(app);
    const res = await request(app).post(`${G}/99999/join`).set(authHeader(token));
    expect(res.status).toBe(404);
  });
});

// ─── join by code ────────────────────────────────────────────────────────────

describe('POST /groups/join-by-code', () => {
  it('mã hợp lệ → 200 + status PENDING', async () => {
    const { mgr, groupId } = await setupManager();
    const myGroupsRes = await request(app)
      .get(`${G}/my-groups`)
      .set(authHeader(mgr.token));
    const joinCode = (myGroupsRes.body.data as Array<{ groupId: number; joinCode: string }>)
      .find((g) => g.groupId === groupId)?.joinCode;

    const mem = await registerAndLogin(app, makeUser('jc'));
    const res = await request(app)
      .post(`${G}/join-by-code`)
      .set(authHeader(mem.token))
      .send({ joinCode });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: 'PENDING' });
  });

  it('mã sai → 404', async () => {
    const { token } = await registerAndLogin(app);
    const res = await request(app)
      .post(`${G}/join-by-code`)
      .set(authHeader(token))
      .send({ joinCode: 'XXXXXX' });
    expect(res.status).toBe(404);
  });
});

// ─── pending members (RBAC) ──────────────────────────────────────────────────

describe('GET /groups/:id/members/pending', () => {
  it('manager thấy danh sách pending → 200', async () => {
    const { mgr, groupId } = await setupManager();
    await setupMemberPending(groupId);
    const res = await request(app)
      .get(`${G}/${groupId}/members/pending`)
      .set(authHeader(mgr.token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('member thường không có quyền → 403', async () => {
    const { mgr, groupId } = await setupManager();
    await setupMemberApproved(groupId, mgr.token);
    const mem2 = await registerAndLogin(app, makeUser('m2'));
    await request(app).post(`${G}/${groupId}/join`).set(authHeader(mem2.token));

    // mem (APPROVED MEMBER) thử xem pending list
    const pendingAgain = await request(app)
      .get(`${G}/${groupId}/members/pending`)
      .set(authHeader(mgr.token));
    const approvedMemberId = pendingAgain.body.data[0]?.id;
    // approve mem2 first
    await request(app)
      .patch(`${G}/${groupId}/members/${approvedMemberId}`)
      .set(authHeader(mgr.token))
      .send({ action: 'APPROVE' });

    const { mem } = await setupMemberApproved(groupId, mgr.token);
    const res = await request(app)
      .get(`${G}/${groupId}/members/pending`)
      .set(authHeader(mem.token));
    expect(res.status).toBe(403);
  });
});

// ─── review member ───────────────────────────────────────────────────────────

describe('PATCH /groups/:id/members/:memberId — duyệt/từ chối', () => {
  it('manager duyệt → member status APPROVED', async () => {
    const { mgr, groupId } = await setupManager();
    await setupMemberPending(groupId);
    const pending = await request(app)
      .get(`${G}/${groupId}/members/pending`)
      .set(authHeader(mgr.token));
    const memberId = pending.body.data[0].memberId;

    const res = await request(app)
      .patch(`${G}/${groupId}/members/${memberId}`)
      .set(authHeader(mgr.token))
      .send({ action: 'APPROVE' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'APPROVED' });
  });

  it('manager từ chối → member status REJECTED', async () => {
    const { mgr, groupId } = await setupManager();
    await setupMemberPending(groupId);
    const pending = await request(app)
      .get(`${G}/${groupId}/members/pending`)
      .set(authHeader(mgr.token));
    const memberId = pending.body.data[0].memberId;

    const res = await request(app)
      .patch(`${G}/${groupId}/members/${memberId}`)
      .set(authHeader(mgr.token))
      .send({ action: 'REJECT' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'REJECTED' });
  });

  it('member thường không thể duyệt → 403', async () => {
    const { mgr, groupId } = await setupManager();
    const { mem, memberId: approvedMemberId } = await setupMemberApproved(groupId, mgr.token);

    // một user pending khác
    const user3 = await registerAndLogin(app, makeUser('u3'));
    await request(app).post(`${G}/${groupId}/join`).set(authHeader(user3.token));
    const pending = await request(app)
      .get(`${G}/${groupId}/members/pending`)
      .set(authHeader(mgr.token));
    const pendingMemberId = pending.body.data[0].memberId;

    const res = await request(app)
      .patch(`${G}/${groupId}/members/${pendingMemberId}`)
      .set(authHeader(mem.token))
      .send({ action: 'APPROVE' });
    expect(res.status).toBe(403);

    void approvedMemberId;
  });
});
