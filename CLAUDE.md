# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Tổng quan dự án

**Shiftalyst (Workshift Management System)** là hệ thống quản lý ca làm việc đa nhóm, phục vụ mô hình cửa hàng/chuỗi (F&B và tương tự). Một người dùng có thể thuộc nhiều **group** (quán/chi nhánh) với các vai trò khác nhau; toàn bộ dữ liệu nghiệp vụ được tách theo `groupId`.

**Monorepo:** hai package độc lập, không có root orchestration.

```
shiftalyst/
├── workshift-backend/   # Express 5 + TypeScript REST API  (port 8080)
├── workshift-frontend/  # React 19 + Vite SPA              (port 5173)
└── docs/
    ├── spec.md          # API contract, domain model, business rules (nguồn chuẩn)
    └── tasks.md         # Roadmap, trạng thái B01–B26, gap kỹ thuật
```

---

## Tech Stack

| Lớp | Công nghệ |
|-----|-----------|
| Backend | Node.js 20+, Express 5, TypeScript 6, Mongoose 9, Zod 4 |
| Auth | JWT HMAC-SHA256 (access + refresh token rotation) |
| Frontend | React 19, Vite 7, React Router 6, Tailwind CSS 3 |
| Database | MongoDB (local hoặc Atlas) |
| Container | Docker multi-stage (Nginx cho frontend) |

---

## Lệnh phát triển

### Backend (`workshift-backend/`)
```bash
npm run dev            # ts-node-dev, auto-respawn (port 8080)
npm run build          # rimraf dist && tsc
npm start              # node dist/index.js (production)
npm run rotate-secrets # Sinh JWT secrets mới (crypto-secure)
```

### Frontend (`workshift-frontend/`)
```bash
npm run dev     # Vite dev server (port 5173)
npm run build   # Bundle production
npm run lint    # ESLint 9 flat config
npm run preview # Xem trước production build
```

> Chưa có test suite — `npm test` trong backend hiện trả về placeholder error.

---

## Cài đặt môi trường

**Backend** — copy `workshift-backend/.env.example` → `.env`:

| Biến | Ghi chú |
|------|---------|
| `MONGODB_URI` | Mặc định: `mongodb://127.0.0.1:27017/workshift_db` |
| `JWT_SECRET` | 32+ ký tự; dùng `npm run rotate-secrets` để tạo |
| `JWT_REFRESH_SECRET` | Phải **khác** `JWT_SECRET` |
| `CORS_ORIGINS` | Comma-separated hoặc `*` cho local dev |
| `PORT` | Mặc định `8080` |

**Frontend** — copy `workshift-frontend/.env.example` → `.env`:

| Biến | Ghi chú |
|------|---------|
| `VITE_API_BASE_URL` | Phải bao gồm suffix `/api/v1`, ví dụ: `http://localhost:8080/api/v1` |

---

## Kiến trúc backend

**Layered architecture** — controller chỉ parse request và gọi service; toàn bộ business logic nằm ở service.

```
src/
├── config/       # env.ts (typed env), database.ts
├── models/       # 17 Mongoose schemas
├── validation/   # Zod schemas — dùng bởi validateBody/validateQuery middleware
├── middleware/   # authJwt, validateBody, validateQuery, errorHandler, notFound
├── controllers/  # Thin: parse → service → apiResponse
├── services/     # Business logic
├── routes/       # 1 router/domain, mount tại app.ts dưới /api/v1
├── common/       # apiResponse.ts, appError.ts, errorResponse.ts
└── utils/        # isoWeek, vnTime
```

**Response envelope:**
```ts
// Success
{ status: 200 | 201, message: string, data: T, timestamp: string }

// Error
{ status: 4xx|5xx, message: string, errors?: Record<string, string>, path: string, timestamp: string }
```

**Pagination:** query params `page` (zero-based, default `0`) và `size` (default `20`, max `200`).

**TypeScript gotcha:** backend dùng `"module": "NodeNext"` — imports phải có extension `.js` dù file nguồn là `.ts`.

---

## Kiến trúc frontend

**State management:** React Context API — không dùng Redux/Zustand.

| Thành phần | Vai trò |
|------------|---------|
| `api/apiClient.js` | Fetch wrapper: inject Bearer token, tự động refresh khi 401, retry request |
| `states/auth/AuthContext.jsx` | Global auth state; tokens lưu ở `localStorage` |
| `configs/router.jsx` | Route tree; `RequireAuth` và `RequireAdmin` guards |
| `layouts/` | `PublicLayout`, `AppLayout`, `GroupLayout`, `AdminLayout` |
| `services/` | API call modules theo domain (gọi từ pages/hooks) |

Token storage keys: `workshift.auth.tokens`, `workshift.auth.user`.

Group-scoped pages nhận `groupId` từ URL — **không có** global group context provider.

---

## Phân quyền

| Cấp | Giá trị | Mô tả |
|-----|---------|-------|
| Global | `USER` / `ADMIN` | Lưu trên `User.globalRole` |
| Group | `OWNER` / `MANAGER` / `MEMBER` | Lưu trên `GroupMember.role` |
| Group status | `APPROVED` / `PENDING` / `REJECTED` / `BANNED` | Lưu trên `GroupMember.status` |

Chỉ member `APPROVED` mới truy cập nghiệp vụ group. Chỉ `MANAGER` (đã APPROVED) mới thực hiện manager-level actions.

---

## Tiến độ nghiệp vụ (B01–B26)

Tất cả module đã được implement:

| Nhóm | Modules | Trạng thái |
|------|---------|------------|
| Auth | B01, B02, B02.1, B02.2 | ✅ Register / Login / Refresh / Logout |
| Group core | B03, B04, B05, B05.1 | ✅ Tạo group, join, duyệt thành viên, audit logs |
| Shift foundation | B06, B07, B09, B10 | ✅ Position, Shift template, Shift, Requirement |
| Member flow | B08, B11, B12, B13, B19 | ✅ Availability, đăng ký ca, lịch cá nhân |
| Manager ops | B14, B15, B16, B17, B18, B20 | ✅ Duyệt/gán ca, cảnh báo thiếu người, gợi ý, lock shift |
| Shift change | B21, B22 | ✅ Tạo & duyệt yêu cầu đổi ca |
| Payroll/report | B24, B25, B26 | ✅ Salary config, payroll tháng, báo cáo hoạt động |
| System admin | B23 | ✅ User/group governance, metrics, admin audit |

**Frontend** đang refactor cấu trúc thư mục từ `features/*` sang `components/`, `services/`, `configs/`, `states/`, `hooks/`.

---

## Gap kỹ thuật còn lại

| Mức | Hạng mục | Trạng thái |
|-----|----------|------------|
| **P0** | Automated tests backend (auth, RBAC, registration, shift change, payroll) | Chưa có |
| **P0** | CI pipeline (lint + test + build) | Chưa có |
| **P1** | Observability: structured logging, request correlation ID | Chưa có |
| **P1** | Rate limiting cho auth/refresh endpoints | Chưa có |
| **P2** | MongoDB index review cho query tần suất cao | Chưa làm |

---

## Roadmap (12 tuần)

| Giai đoạn | Tuần | Mục tiêu |
|-----------|------|----------|
| A — Ổn định nền | 1–2 | Hoàn tất frontend refactor, chuẩn hóa import/naming |
| B — Test | 3–5 | Thiết lập Jest/Vitest + integration tests cho luồng trọng yếu |
| C — CI/CD | 6–7 | GitHub Actions: lint + test + build + Docker |
| D — Hardening | 8–9 | Rate limit, structured logging, index MongoDB |
| E — Polish | 10–12 | UX admin/report, export format, release checklist |

---

## Git Workflow

**Branches:** `main` (production) ← `develop` (integration) ← `feature/<scope>` / `fix/<scope>` / `refactor/<scope>` / `docs/<scope>`

**Commit format:** `<type>(<scope>): <description>`
Các type: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**PR checklist:**
- [ ] Scope nhỏ, mô tả rõ mục tiêu
- [ ] Đã chạy lint/build
- [ ] Cập nhật `docs/spec.md` nếu thay đổi API/model/business rule

---

## Nguyên tắc tài liệu

- `docs/spec.md` — **nguồn chuẩn** về API contract, domain model, business rules. Cập nhật trong cùng PR với code.
- `docs/tasks.md` — nguồn chuẩn về tiến độ và roadmap hàng ngày.
- `docs/MASTER_ROADMAP.md` — nguồn chuẩn về tầm nhìn sản phẩm và lộ trình dài hạn (G0→G4, AI, License).
- Nếu code và spec lệch nhau: ưu tiên sửa spec theo behavior thực tế của code.

---

## Nhật ký session

### Session 2026-04-22 — Thiết lập Claude Code workspace

**Đã hoàn thành:**

- [x] Tạo `CLAUDE.md` (file này) — project guidance cho Claude Code
- [x] Tạo `.claude/rules/` (11 rule files, scope theo `paths`):
  - `commands.md` — lệnh dev/build/lint
  - `environment.md` — biến môi trường `.env`
  - `backend-architecture.md` — layer layout, API conventions, auth flow
  - `frontend-architecture.md` — cấu trúc frontend, auth state, routing
  - `business-rules.md` — toàn bộ quy tắc nghiệp vụ domain
  - `domain-models.md` — key Mongoose models
  - `api-routes.md` — bảng route đầy đủ
  - `git-workflow.md` — branch naming, commit format, PR checklist
  - `typescript-and-build.md` — NodeNext `.js` extension requirement
  - `docker.md` — multi-stage Dockerfile
  - `project-status.md` — gap kỹ thuật, roadmap
- [x] Tạo `~/.claude/CLAUDE.md` (global) — luôn trả lời tiếng Việt, không tự xóa file
- [x] Tạo `.claude/agents/researcher.md` — research agent
- [x] Tạo `.claude/commands/` (5 skill files):
  - `/new-api` — tạo backend endpoint mới (route+controller+service+validation)
  - `/new-page` — tạo frontend page mới (service+page+components)
  - `/update-spec` — cập nhật `docs/spec.md` sau thay đổi API
  - `/check-backend` — kiểm tra TypeScript build + conventions
  - `/check-frontend` — kiểm tra ESLint + conventions + API wiring
- [x] Viết lại `docs/MASTER_ROADMAP.md` — gộp 3 nguồn (MASTER_ROADMAP cũ + tasks.md + shift-management-system.md) thành một tài liệu duy nhất với G0→G4, AI roadmap, License model

---

## Việc cần làm — Session tiếp theo

### Ưu tiên cao (Giai đoạn A — Frontend refactor)

- [ ] Kiểm tra toàn bộ pages trong `workshift-frontend/src/pages/` đã dùng đúng cấu trúc mới (`components/`, `services/`, `hooks/`) chưa — chạy `/check-frontend` để rà soát
- [ ] Đảm bảo tất cả import paths trong frontend không còn trỏ vào cấu trúc `features/*` cũ
- [ ] Chạy `npm run build` và `npm run lint` trong `workshift-frontend/` — đảm bảo 0 lỗi
- [ ] Chạy full flow local: login → tạo group → tạo shift → đăng ký ca → duyệt → xem payroll

### Ưu tiên trung (dọn dẹp tài liệu)

- [ ] Quyết định xóa `docs/shift-management-system.md` (nội dung đã migrate vào MASTER_ROADMAP)
- [ ] Cập nhật `docs/tasks.md` để reference `docs/MASTER_ROADMAP.md` cho roadmap dài hạn
- [ ] Commit tất cả thay đổi session này lên `develop`

### Sau khi G0-A xong → bắt đầu G0-B (Tests)

- [ ] Chọn test framework: Jest hoặc Vitest cho backend
- [ ] Thiết lập test database (MongoDB in-memory hoặc test container)
- [ ] Viết test đầu tiên: auth flow (register → login → refresh → logout)
