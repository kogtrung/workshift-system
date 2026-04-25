# RUNBOOK — Shiftalyst Operations

**Phạm vi:** hướng dẫn triển khai, vận hành, xử lý sự cố, và rollback.  
**Đọc cùng với:** `docs/spec.md` (API contract), `docs/MASTER_ROADMAP.md` (lộ trình).

---

## 1. Yêu cầu môi trường

| Thành phần | Phiên bản tối thiểu |
|------------|---------------------|
| Node.js | 20 LTS |
| MongoDB | 7.0 |
| npm | 10 |
| Docker | 24 (nếu dùng container) |

---

## 2. Cài đặt lần đầu

### Backend

```bash
cd workshift-backend
cp .env.example .env       # Điền các biến môi trường (xem mục 3)
npm install
npm run rotate-secrets     # Sinh JWT_SECRET + JWT_REFRESH_SECRET ngẫu nhiên, in ra stdout
# Copy giá trị vào .env
npm run dev                # Dev server: http://localhost:8080
```

### Frontend

```bash
cd workshift-frontend
cp .env.example .env       # Điền VITE_API_BASE_URL
npm install
npm run dev                # Dev server: http://localhost:5173
```

---

## 3. Biến môi trường

### Backend (`workshift-backend/.env`)

| Biến | Bắt buộc | Ghi chú |
|------|----------|---------|
| `MONGODB_URI` | ✅ | Ví dụ: `mongodb://127.0.0.1:27017/workshift_db` |
| `JWT_SECRET` | ✅ | 32+ ký tự; dùng `npm run rotate-secrets` để tạo |
| `JWT_REFRESH_SECRET` | ✅ | Phải **khác** `JWT_SECRET` |
| `PORT` | ❌ | Mặc định `8080` |
| `CORS_ORIGINS` | ❌ | Comma-separated origins hoặc `*`; ví dụ: `https://app.example.com` |
| `NODE_ENV` | ❌ | `production` để tắt pino-pretty; `test` để tắt rate limiter |
| `LOG_LEVEL` | ❌ | `info` (mặc định), `debug`, `warn`, `error` |

### Frontend (`workshift-frontend/.env`)

| Biến | Bắt buộc | Ghi chú |
|------|----------|---------|
| `VITE_API_BASE_URL` | ✅ | Phải có suffix `/api/v1`, ví dụ: `http://localhost:8080/api/v1` |

---

## 4. Build production

```bash
# Backend
cd workshift-backend
npm run build              # Output: dist/
node dist/index.js         # Production server

# Frontend
cd workshift-frontend
npm run build              # Output: dist/ (static files, serve qua Nginx)
```

---

## 5. Docker (Backend only)

Frontend deploy qua **Vercel** (không dùng Docker).

```bash
# Backend
docker build -t shiftalyst-backend ./workshift-backend
docker run -p 8080:8080 --env-file workshift-backend/.env shiftalyst-backend
```

---

## 6. Kiểm tra sức khoẻ

```bash
curl http://localhost:8080/api/health
# Expected: {"status":"OK","message":"Workshift API is running"}
```

---

## 7. Chạy tests

```bash
cd workshift-backend
npm test                   # Jest: 5 suites, 59 tests
npm run test:watch         # Watch mode khi đang phát triển
```

---

## 8. Rate Limiting

Áp dụng trên auth endpoints (per IP):

| Endpoint | Giới hạn |
|----------|----------|
| `POST /api/v1/auth/login` | 10 lần / 15 phút |
| `POST /api/v1/auth/register` | 5 lần / giờ |
| `POST /api/v1/auth/refresh` | 20 lần / 15 phút |

Response khi vượt giới hạn: **HTTP 429** với header `Retry-After`.

> Rate limiter bị tắt khi `NODE_ENV=test`.

---

## 9. Logging

Logs xuất ra **stdout** dạng JSON (production) hoặc pretty-print màu (dev).

Mỗi request log gồm: `method`, `url`, `statusCode`, `responseTime`, `reqId` (correlation ID).  
Header `X-Correlation-ID` được trả về trong mỗi response — dùng để tra cứu log theo request cụ thể.

```bash
# Lọc log theo correlation ID
node dist/index.js | grep '"reqId":"abc-123"'

# Lọc lỗi 5xx
node dist/index.js | grep '"level":50'  # pino: 50=error
```

---

## 10. Rollback

### Rollback code (git)

```bash
# Xem danh sách tags production
git tag -l "v*" --sort=-version:refname | head -5

# Rollback về tag cụ thể
git checkout v1.2.3
cd workshift-backend && npm install && npm run build && node dist/index.js
```

### Rollback database

MongoDB không có schema migration tự động — rollback DB cần:
1. Restore từ snapshot/backup trước khi deploy
2. Hoặc viết script migration ngược thủ công

> **Không** chạy `db.dropDatabase()` trên production. Luôn backup trước khi deploy model thay đổi.

---

## 11. Xử lý sự cố thường gặp

### Backend không kết nối được MongoDB

```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

Kiểm tra: MongoDB có đang chạy không? `mongod --version` và `ps aux | grep mongod`.  
Kiểm tra: `MONGODB_URI` trong `.env` đúng chưa?

---

### JWT lỗi "invalid signature"

Xảy ra khi `JWT_SECRET` hoặc `JWT_REFRESH_SECRET` bị thay đổi sau khi đã có token active.  
Giải quyết: người dùng cần login lại. Nếu dùng `npm run rotate-secrets`, **toàn bộ** session hiện tại bị invalidate.

---

### Rate limit bị trigger sai (test/staging)

Đặt `NODE_ENV=test` trong môi trường staging để tắt rate limiter, hoặc điều chỉnh `max` trong `src/middleware/rateLimiter.ts`.

---

### Frontend không gọi được API (CORS error)

Kiểm tra `CORS_ORIGINS` trong backend `.env` có bao gồm origin của frontend không.  
Kiểm tra `VITE_API_BASE_URL` trong frontend `.env` trỏ đúng host:port.

---

### Mongoose deprecation warning: `new` option

```
Warning: mongoose: the `new` option for findOneAndUpdate() is deprecated
```

Đây là warning không ảnh hưởng runtime. Sẽ được fix khi upgrade Mongoose lên v10+.

---

## 12. MongoDB — index hiện có

Các collection quan trọng đã có compound indexes:

| Collection | Indexes |
|------------|---------|
| `registrations` | `{shiftId,status}`, `{shiftId,positionId,status}`, `{userId,status}`, `{shiftId,userId,status}` |
| `groupmembers` | `{groupId,userId}` (unique), `{groupId,status}`, `{userId,status}` |
| `shifts` | `{groupId,date}` |
| `shiftrequirements` | `{shiftId,positionId}` (unique) |
| `shiftchangerequests` | `{groupId,status}` |
| `salaryconfigs` | `{groupId,effectiveDate:-1}` |
| `groupauditlogs` | `{groupId,occurredAt:-1}` |

---

## 13. Release Checklist (tóm tắt nhanh)

Xem đầy đủ tại `docs/RELEASE_CHECKLIST.md`.

Pre-deploy:
- [ ] `npm test` — 59/59 pass
- [ ] `npm run build` — 0 lỗi TypeScript
- [ ] `npm run lint` (frontend) — 0 errors
- [ ] Biến môi trường production đã cập nhật
- [ ] Backup MongoDB

Post-deploy:
- [ ] `GET /api/health` trả về 200
- [ ] Login flow hoạt động
- [ ] Kiểm tra log không có lỗi 5xx

---

*Cập nhật: 2026-04-22*
