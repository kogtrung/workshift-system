# TASKS & ROADMAP (SOLO MODE)

> Tài liệu này thay thế bản phân chia theo nhiều thành viên.  
> Mục tiêu: theo dõi tiến độ thực tế của dự án khi phát triển bởi **1 người** và ưu tiên các hạng mục nâng chất lượng production.

**Cập nhật:** 2026-04  
**Phạm vi repo:** `workshift-backend/`, `workshift-frontend/`, `docs/`

**Kế hoạch nâng cấp realtime / Redis / MQ-ready / mở rộng sản phẩm (một file duy nhất):** [docs/MASTER_ROADMAP.md](MASTER_ROADMAP.md)

---

## 1) Snapshot hiện tại

### 1.1 Kiến trúc đã triển khai
- Backend: Express + TypeScript + Mongoose, API prefix `/api/v1`, JWT access/refresh, Zod validation.
- Frontend: React + Vite + React Router, fetch client có luồng refresh token.
- Domain: multi-group workshift (user có thể tham gia nhiều group; phân quyền theo group).

### 1.2 Trạng thái module nghiệp vụ (B01-B26)

| Nhóm | Mã | Trạng thái | Ghi chú |
|---|---|---|---|
| Auth | B01, B02, B02.1, B02.2 | Implemented | Register/Login/Refresh/Logout hoạt động |
| Group core | B03, B04, B05 | Implemented | Tạo group, join by id/code, duyệt thành viên |
| Group audit | B05.1 | Implemented | Audit logs + summary daily/monthly |
| Shift foundation | B06, B07, B09, B10 | Implemented | Position, Shift template, Shift, Requirement |
| Member flow | B08, B11, B12, B13, B19 | Implemented | Availability, available shifts, registration, calendar |
| Manager ops | B14, B15, B16, B17, B18, B20 | Implemented | Duyệt/từ chối/gán, cảnh báo thiếu người, gợi ý, lock shift |
| Shift change | B21, B22 | Implemented | Tạo yêu cầu đổi ca, manager duyệt/từ chối |
| Payroll/report | B24, B25, B26 | Implemented | Salary config, payroll month, weekly/monthly activity report |
| System admin | B23 | Implemented | User/group governance, metrics, admin audit |

### 1.3 Trạng thái Giai đoạn 0 (G0) — **Hoàn tất** ✅

| Phase | Trạng thái | Tóm tắt |
|-------|------------|---------|
| **A** — Frontend refactor | ✅ | Cấu trúc mới, lint 0 lỗi, build sạch |
| **B** — Backend tests | ✅ | 59 tests / 5 suites (auth, groups, registration, shiftChange, payroll) |
| **C** — CI/CD | ✅ | `.github/workflows/ci.yml` (build+test+lint) và `docker.yml` (image build) |
| **D** — Hardening | ✅ | Rate limit, pino logging, X-Correlation-ID, MongoDB compound indexes |
| **E** — Polish | ✅ | CSV export payroll, Admin UX (status badge, reject inline), RUNBOOK + RELEASE_CHECKLIST |

**G0 hoàn tất 2026-04-22 → sẵn sàng bắt đầu G1 (Realtime & Concurrency).**

---

## 2) Gap kỹ thuật còn lại (ưu tiên)

| Mức ưu tiên | Hạng mục | Trạng thái | Outcome mong muốn |
|---|---|---|---|
| P0 | Automated tests cho backend core flows | **Đạt** (59 tests) | auth, RBAC, registration approval, shift change, payroll — 59/59 pass |
| P0 | CI pipeline chuẩn (lint + test + build) | **Đạt** | `ci.yml` + `docker.yml` — gate trên `main`/`develop` và PR |
| P1 | Observability & vận hành | **Đạt** | pino structured logging, X-Correlation-ID per request, error context đầy đủ |
| P1 | Hardening security | **Đạt (auth)** | Rate limit login/register/refresh; CORS production cần cấu hình `.env` trước deploy |
| P1 | API governance | Một phần | Versioning discipline, changelog API, docs contract ổn định |
| P2 | Performance & indexing review | **Đạt** | Compound indexes: Registration (4), GroupMember (2); các model khác đã đủ |

---

## 3) Roadmap solo (12 tuần đề xuất)

## Giai đoạn A - Ổn định nền tảng (Tuần 1-2)
- Hoàn tất refactor cấu trúc frontend, giữ nguyên behavior.
- Chuẩn hóa import path, naming convention, shared UI/state patterns.
- Đảm bảo build/lint frontend sạch sau refactor.

**DoD**
- Không còn import cũ theo cấu trúc đã bỏ.
- Chạy local full flow login -> group -> shift -> payroll không lỗi.

## Giai đoạn B - Test hóa các luồng trọng yếu (Tuần 3-5)
- Thiết lập test framework backend (Jest/Vitest + test utilities).
- Viết test integration cho: auth session, group membership approval, registration actions, shift-change approval, payroll.

**DoD**
- Coverage meaningful ở service/controller trọng yếu.
- Test chạy ổn định trên local và CI.

## Giai đoạn C - CI/CD tối thiểu khả dụng (Tuần 6-7)
- Tạo workflow cho lint + test + build backend/frontend.
- Kiểm tra deploy path Docker backend/frontend.

**DoD**
- Mỗi PR phải pass checks trước merge.
- Build image thành công ở môi trường CI.

## Giai đoạn D - Production hardening (Tuần 8-9)
- Rate limiting cho auth endpoints.
- Tăng cường logs và chuẩn hóa error context.
- Rà soát index MongoDB cho query tần suất cao.

**DoD**
- P95 latency các endpoint list/report trong ngưỡng mục tiêu nội bộ.
- Có playbook xử lý sự cố cơ bản.

## Giai đoạn E - Product polish (Tuần 10-12)
- Nâng UX các trang admin/report/audit.
- Chuẩn hóa export/report format.
- Hoàn thiện tài liệu vận hành và release checklist.

**DoD**
- Demo end-to-end đầy đủ cho manager/member/admin.
- Tài liệu release + rollback sử dụng được ngay.

---

## 4) Quy ước nhánh và commit (solo)

### 4.1 Branching
- `main`: production-ready.
- `develop`: integration branch.
- `feature/<scope>`: tính năng.
- `refactor/<scope>`: tái cấu trúc không đổi behavior.
- `fix/<scope>`: sửa lỗi.
- `docs/<scope>`: tài liệu.

### 4.2 Commit format
- `<type>(<scope>): <description>`
- Loại khuyến nghị: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

### 4.3 Pull Request checklist
- [ ] Scope nhỏ, mô tả rõ mục tiêu và ảnh hưởng.
- [ ] Không trộn thay đổi không liên quan (backend + docs + frontend) nếu không cần.
- [ ] Đã chạy lint/build/test cần thiết trước khi mở PR.
- [ ] Cập nhật `docs/spec.md` nếu thay đổi API/behavior.

---

## 5) Definition of Done (project-level)

Một hạng mục được coi là hoàn thành khi:
- Code chạy được local và không phá vỡ luồng hiện có.
- Có test phù hợp mức độ rủi ro của thay đổi.
- Tài liệu liên quan được cập nhật cùng PR.
- Có khả năng rollback an toàn (revert hoặc migration strategy).

---

## 6) Nguyên tắc cập nhật tài liệu

- `docs/spec.md`: nguồn chuẩn về API contract, domain rules, model.
- `docs/tasks.md` (file này): nguồn chuẩn về trạng thái thực thi và roadmap 12 tuần.
- `docs/MASTER_ROADMAP.md`: nguồn chuẩn về tầm nhìn sản phẩm dài hạn (G0→G4, AI, License).
- Khi có chênh lệch giữa code và docs, ưu tiên cập nhật docs trong cùng nhánh thay đổi code.
