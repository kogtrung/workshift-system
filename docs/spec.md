# SPECIFICATION - SHIFTALYST PLATFORM

> Tài liệu đặc tả kỹ thuật chính thức cho codebase hiện tại.  
> Mục tiêu: mô tả đúng contract API, dữ liệu, phân quyền và quy tắc nghiệp vụ đang chạy trong hệ thống.

**Version:** 2.0  
**Updated:** 2026-04  
**Source of truth:** mã nguồn trong `workshift-backend/` và router frontend trong `workshift-frontend/`

---

## 1. Tổng quan hệ thống

### 1.1 Mục tiêu sản phẩm
Shiftalyst là hệ thống quản lý phân ca đa nhóm (multi-group) cho mô hình vận hành theo cửa hàng/chi nhánh:
- Một người dùng có thể tham gia nhiều group.
- Quyền nghiệp vụ được kiểm soát theo membership trong từng group.
- Backend cung cấp REST API chuẩn hóa qua prefix `/api/v1`.

### 1.2 Kiến trúc
- **Backend:** Node.js + Express + TypeScript + Mongoose.
- **Frontend:** React + Vite + React Router.
- **Database:** MongoDB.
- **Auth:** JWT access token + refresh token rotation (refresh token lưu hash ở DB).

---

## 2. Nguyên tắc API contract

### 2.1 Success envelope
Mọi API thành công trả về:

```json
{
  "status": 200,
  "message": "string",
  "data": {},
  "timestamp": "ISO-8601"
}
```

`status=201` cho các API tạo mới.

### 2.2 Error envelope
Mọi lỗi nghiệp vụ/hệ thống trả về:

```json
{
  "status": 400,
  "message": "string",
  "errors": {
    "field": "message"
  },
  "path": "/api/v1/...",
  "timestamp": "ISO-8601"
}
```

### 2.3 Auth header
- Header chuẩn: `Authorization: Bearer <access_token>`.
- API public: register, login, refresh.
- API còn lại yêu cầu access token hợp lệ; admin endpoints yêu cầu thêm `globalRole=ADMIN`.

### 2.4 Pagination convention
Các list endpoint có phân trang dùng:
- `page` (zero-based), mặc định `0`.
- `size`, mặc định `20`, tối đa `200`.

---

## 3. Domain model (theo implementation hiện tại)

Lưu ý: tất cả model dùng `id` dạng số tăng dần nội bộ (sequence service), không dùng trực tiếp `_id` Mongo cho contract API.

### 3.1 Core identity
- **User**: `username`, `email`, `password(hash)`, `status(ACTIVE|BANNED)`, `globalRole(USER|ADMIN)`.
- **RefreshToken**: `tokenHash`, `expiresAt`, `revokedAt`.

### 3.2 Multi-group
- **Group**: `name`, `joinCode(6 ký tự, unique)`, `status(ACTIVE|INACTIVE)`, `createdByUserId`.
- **GroupMember**: `groupId`, `userId`, `role(MANAGER|MEMBER)`, `status(PENDING|APPROVED|REJECTED|BANNED)`, unique `(groupId,userId)`.

### 3.3 Shift planning
- **Position**: vị trí trong group, unique `(groupId,name)`.
- **ShiftTemplate**: ca mẫu theo group.
- **TemplateRequirement**: nhu cầu vị trí theo template.
- **Shift**: ca theo ngày, `status(OPEN|LOCKED|COMPLETED)`.
- **ShiftRequirement**: nhu cầu vị trí theo shift, unique `(shiftId,positionId)`.

### 3.4 Scheduling & execution
- **Availability**: lịch rảnh theo user (`dayOfWeek`, `startTime`, `endTime`).
- **MemberPosition**: vị trí mà member được phép làm trong từng group.
- **Registration**: đăng ký ca với trạng thái `PENDING|APPROVED|REJECTED|CANCELLED`.
- **ShiftChangeRequest**: yêu cầu đổi ca `PENDING|APPROVED|REJECTED`.

### 3.5 Governance & reporting
- **SalaryConfig**: cấu hình lương theo `userId` hoặc `positionId` (XOR), có `effectiveDate`.
- **GroupAuditLog**: audit cho manager-level operations (group/member/registration).
- **AdminAuditLog**: audit cho admin-level user/group status toggles.

---

## 4. Quy tắc nghiệp vụ chính

### 4.1 Auth & session
- Register yêu cầu unique username/email.
- Login từ `usernameOrEmail + password`; user bị `BANNED` không được đăng nhập.
- Refresh token rotation: refresh cũ bị revoke ngay khi refresh thành công.
- Logout revoke toàn bộ refresh token còn hiệu lực của user.

### 4.2 Membership & RBAC
- Chỉ manager đã `APPROVED` mới có quyền thao tác manager-level trong group.
- Member phải `APPROVED` mới truy cập các nghiệp vụ group tương ứng.
- Admin endpoints chỉ cho `globalRole=ADMIN`.

### 4.3 Shift & registration constraints
- Shift tạo mới phải có khung giờ hợp lệ (`start < end`), không overlap với shift khác cùng group/cùng ngày.
- Chỉ đăng ký khi shift ở trạng thái `OPEN`.
- Đăng ký ca phải đúng position có trong `ShiftRequirement`.
- Duyệt/gán ca không được vượt quota (`approved < quantity`).
- Không được có 2 ca `APPROVED` overlap thời gian trong cùng group cho cùng user.
- Hủy đăng ký:
  - `PENDING`: hủy được.
  - `APPROVED`: chỉ hủy trước giờ bắt đầu ca.
  - Không hủy được nếu shift `LOCKED` hoặc `COMPLETED`.

### 4.4 Availability & recommendation
- Available shifts = shift `OPEN` + khớp availability + còn nhu cầu.
- Recommendation lọc theo:
  - khớp availability,
  - không trùng lịch approved,
  - đúng vị trí được phép làm (nếu user có cấu hình member positions),
  - chưa có registration pending/approved trên ca đích.

### 4.5 Shift change
- User chỉ tạo request khi có registration `APPROVED` ở ca nguồn.
- Có thể đổi sang ca đích hoặc xin nghỉ (`toShiftId = null`).
- Approve đổi ca:
  - hủy registration ca nguồn,
  - tạo registration approved cho ca đích (nếu có),
  - kiểm tra quota, overlap, availability, permissions.

### 4.6 Salary & payroll
- Salary config hỗ trợ 2 kiểu:
  - theo user,
  - theo position,
  - tại cùng mốc hiệu lực: ưu tiên user > position.
- Payroll tổng hợp từ registrations `APPROVED` trong tháng theo timezone VN range.
- Member chỉ xem payroll của chính mình; manager xem toàn group.

### 4.7 Audit
- Group audit ghi các action type đang dùng:
  - `GROUP_CREATED`, `GROUP_UPDATED`, `GROUP_CLOSED`, `GROUP_REOPENED`, `GROUP_DELETE`, `GROUP_DELETED`,
  - `GROUP_MEMBER_JOIN_REQUESTED`, `GROUP_MEMBER_APPROVED`, `GROUP_MEMBER_REJECTED`,
  - `REGISTRATION_CREATED`, `REGISTRATION_APPROVED`, `REGISTRATION_REJECTED`, `REGISTRATION_CANCELLED`.
- Admin audit ghi:
  - `USER_STATUS_TOGGLED`,
  - `GROUP_STATUS_TOGGLED`.

---

## 5. API inventory (actual backend routes)

## 5.1 Health
| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/health` | Public | Health check service |

## 5.2 Auth
| Method | Path | Auth | Payload/query chính |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | `username,email,password,fullName,phone?` |
| POST | `/api/v1/auth/login` | Public | `usernameOrEmail,password` |
| POST | `/api/v1/auth/refresh` | Public | `refreshToken` |
| POST | `/api/v1/auth/logout` | Bearer | Empty body |

## 5.3 Groups & membership
| Method | Path | Auth | Payload/query chính |
|---|---|---|---|
| GET | `/api/v1/groups/my-groups` | Bearer | - |
| POST | `/api/v1/groups` | Bearer | `name,description?` |
| PUT | `/api/v1/groups/:id` | Bearer (MANAGER) | `name,description?` |
| PATCH | `/api/v1/groups/:id/status` | Bearer (MANAGER) | Empty body |
| DELETE | `/api/v1/groups/:id` | Bearer (MANAGER) | - |
| POST | `/api/v1/groups/:id/join` | Bearer | - |
| POST | `/api/v1/groups/join-by-code` | Bearer | `joinCode` |
| GET | `/api/v1/groups/:id/members` | Bearer | - |
| GET | `/api/v1/groups/:id/members/pending` | Bearer (MANAGER) | - |
| PATCH | `/api/v1/groups/:id/members/:memberId` | Bearer (MANAGER) | `action=APPROVE|REJECT` |
| DELETE | `/api/v1/groups/:id/leave` | Bearer | - |

## 5.4 Group audit
| Method | Path | Auth | Query |
|---|---|---|---|
| GET | `/api/v1/groups/:id/audit-logs` | Bearer (MANAGER) | `from,to,actionType,actorUserId,entityType,entityId,page,size` |
| GET | `/api/v1/groups/:id/audit-logs/summary/daily` | Bearer (MANAGER) | `date` |
| GET | `/api/v1/groups/:id/audit-logs/summary/monthly` | Bearer (MANAGER) | `month,year` |

## 5.5 Positions, templates, shifts
| Method | Path | Auth | Payload/query chính |
|---|---|---|---|
| POST | `/api/v1/groups/:groupId/positions` | Bearer (MANAGER) | `name,colorCode?` |
| GET | `/api/v1/groups/:groupId/positions` | Bearer | - |
| PUT | `/api/v1/groups/:groupId/positions/:positionId` | Bearer (MANAGER) | `name,colorCode?` |
| DELETE | `/api/v1/groups/:groupId/positions/:positionId` | Bearer (MANAGER) | - |
| POST | `/api/v1/groups/:groupId/shift-templates` | Bearer (MANAGER) | `name,startTime,endTime,description?,requirements?` |
| GET | `/api/v1/groups/:groupId/shift-templates` | Bearer | - |
| PUT | `/api/v1/groups/:groupId/shift-templates/:templateId` | Bearer (MANAGER) | cùng schema create |
| DELETE | `/api/v1/groups/:groupId/shift-templates/:templateId` | Bearer (MANAGER) | - |
| GET | `/api/v1/groups/:groupId/shifts` | Bearer | `from?,to?` |
| GET | `/api/v1/groups/:groupId/shifts/available` | Bearer | - |
| POST | `/api/v1/groups/:groupId/shifts` | Bearer (MANAGER) | `date + (templateId hoặc startTime/endTime)` |
| POST | `/api/v1/groups/:groupId/shifts/bulk` | Bearer (MANAGER) | `{ shifts: [...] }` |
| DELETE | `/api/v1/groups/:groupId/shifts/:shiftId` | Bearer (MANAGER) | - |
| PATCH | `/api/v1/groups/:groupId/shifts/:shiftId/lock` | Bearer (MANAGER) | Empty body |
| GET | `/api/v1/groups/:groupId/shifts/:shiftId/recommendations` | Bearer (MANAGER) | `positionId` |

## 5.6 Shift requirement & registration actions
| Method | Path | Auth | Payload/query chính |
|---|---|---|---|
| POST | `/api/v1/shifts/:shiftId/requirements` | Bearer (MANAGER) | `positionId,quantity` |
| GET | `/api/v1/shifts/:shiftId/requirements` | Bearer | - |
| PATCH | `/api/v1/shifts/:shiftId/requirements/:requirementId` | Bearer (MANAGER) | `positionId,quantity` |
| DELETE | `/api/v1/shifts/:shiftId/requirements/:requirementId` | Bearer (MANAGER) | - |
| POST | `/api/v1/shifts/:shiftId/register` | Bearer | `positionId,note?` |
| GET | `/api/v1/shifts/:shiftId/registrations/pending` | Bearer (MANAGER) | - |
| POST | `/api/v1/shifts/:shiftId/assign` | Bearer (MANAGER) | `userId,positionId` |
| PATCH | `/api/v1/registrations/:registrationId/approve` | Bearer (MANAGER) | Empty body |
| PATCH | `/api/v1/registrations/:registrationId/reject` | Bearer (MANAGER) | `managerNote?` |
| PATCH | `/api/v1/registrations/:registrationId/cancel` | Bearer | `note?` |

## 5.7 Member profile data
| Method | Path | Auth | Payload/query chính |
|---|---|---|---|
| GET | `/api/v1/availability` | Bearer | - |
| PUT | `/api/v1/availability` | Bearer | `{ slots:[{dayOfWeek,startTime,endTime}] }` |
| GET | `/api/v1/me/calendar` | Bearer | `from,to,range(week|month)` |
| GET | `/api/v1/groups/:groupId/my-positions` | Bearer | - |
| PUT | `/api/v1/groups/:groupId/my-positions` | Bearer | `positionIds[]` |

## 5.8 Salary, payroll, alerts, shift change, reports
| Method | Path | Auth | Payload/query chính |
|---|---|---|---|
| POST | `/api/v1/groups/:groupId/salary-configs` | Bearer (MANAGER) | `userId xor positionId, hourlyRate, effectiveDate` |
| GET | `/api/v1/groups/:groupId/salary-configs` | Bearer (MANAGER) | - |
| DELETE | `/api/v1/groups/:groupId/salary-configs/:configId` | Bearer (MANAGER) | - |
| GET | `/api/v1/groups/:groupId/payroll` | Bearer | `month,year` |
| GET | `/api/v1/groups/:groupId/alerts/understaffed` | Bearer (MANAGER) | - |
| POST | `/api/v1/groups/:groupId/shift-change-requests` | Bearer | `fromShiftId,toShiftId?,reason?` |
| GET | `/api/v1/groups/:groupId/shift-change-requests/pending` | Bearer (MANAGER) | - |
| PATCH | `/api/v1/groups/:groupId/shift-change-requests/:requestId/approve` | Bearer (MANAGER) | Empty body |
| PATCH | `/api/v1/groups/:groupId/shift-change-requests/:requestId/reject` | Bearer (MANAGER) | `managerNote?` |
| GET | `/api/v1/groups/:groupId/reports/weekly` | Bearer (MANAGER) | `year,week` |
| GET | `/api/v1/groups/:groupId/reports/monthly` | Bearer (MANAGER) | `year,month` |

## 5.9 Admin
| Method | Path | Auth | Payload/query chính |
|---|---|---|---|
| GET | `/api/v1/admin/ping` | Bearer (ADMIN) | - |
| GET | `/api/v1/admin/users` | Bearer (ADMIN) | `page,size,search` |
| PATCH | `/api/v1/admin/users/:userId/toggle-status` | Bearer (ADMIN) | Empty body |
| GET | `/api/v1/admin/groups` | Bearer (ADMIN) | `page,size,search` |
| PATCH | `/api/v1/admin/groups/:groupId/toggle-status` | Bearer (ADMIN) | Empty body |
| GET | `/api/v1/admin/metrics` | Bearer (ADMIN) | - |
| GET | `/api/v1/admin/audit-logs` | Bearer (ADMIN) | `page,size` |

---

## 6. Frontend route map (high-level)

Frontend đã có route cho các mảng chính:
- Public: login, register.
- App: groups/create/join.
- Group: home, members, pending-members, shifts, shift-templates, positions, availability, my-schedule, audit-logs, profile, salary-configs, payroll, performance, alerts, shift-change-requests, settings.
- Admin: dashboard, users, groups, audit-logs.

---

## 7. Non-functional requirements (chuẩn production)

### 7.1 Security
- Bắt buộc tách secret access/refresh, rotate định kỳ.
- Rate limit cho auth/refresh endpoints (khuyến nghị bắt buộc khi production).
- Audit bắt buộc cho thay đổi trạng thái quan trọng.

### 7.2 Reliability
- API phải deterministic theo contract envelope.
- Mọi endpoint mutation cần idempotency strategy ở client (retry-safe).
- Có health endpoint và startup validation cho biến môi trường bắt buộc.

### 7.3 Performance
- List/audit/report endpoints phải hỗ trợ pagination hoặc filter thời gian.
- Chỉ số mục tiêu nội bộ: API list/report giữ ổn định khi tăng dữ liệu theo tháng.

### 7.4 Observability
- Chuẩn hóa log format và trace context (request-id) cho production.
- Theo dõi lỗi 5xx và latency P95 theo nhóm endpoint.

---

## 8. Changelog chính sách tài liệu

- Mọi thay đổi endpoint/model/rule nghiệp vụ phải cập nhật file này trong cùng PR.
- Nếu code và spec lệch nhau, ưu tiên sửa spec ngay khi xác nhận hành vi thực tế của code.
- `docs/tasks.md` theo dõi tiến độ; `docs/spec.md` là chuẩn contract kỹ thuật.
