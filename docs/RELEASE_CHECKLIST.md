# Release Checklist — Shiftalyst

Dùng checklist này trước mỗi lần deploy lên production.

---

## Trước khi deploy

### Code quality
- [ ] Tất cả tests pass: `cd workshift-backend && npm test` → 59/59
- [ ] TypeScript build sạch: `npm run build` → 0 lỗi
- [ ] Frontend lint sạch: `cd workshift-frontend && npm run lint` → 0 errors
- [ ] Frontend build thành công: `npm run build` → không lỗi

### Database
- [ ] Backup MongoDB (snapshot hoặc `mongodump`) đã được tạo
- [ ] Nếu có thay đổi schema: đã kiểm tra backward compatibility
- [ ] Không có migration cần chạy thủ công (ghi rõ nếu có)

### Môi trường
- [ ] File `.env` production đã cập nhật các biến mới (nếu có thêm)
- [ ] `JWT_SECRET` và `JWT_REFRESH_SECRET` còn hiệu lực (không rotate nếu không cần)
- [ ] `CORS_ORIGINS` bao gồm đúng domain frontend production
- [ ] `NODE_ENV=production` đã được set

### Review code
- [ ] PR đã được review (hoặc self-review kỹ lưỡng)
- [ ] Không có `console.log` debug còn sót
- [ ] Không có hardcoded secret hoặc credential

---

## Trong khi deploy

- [ ] Thông báo downtime (nếu có) cho người dùng
- [ ] Backend: push code → GitHub Actions build Docker → Render redeploy tự động
- [ ] Frontend: Vercel tự deploy khi detect push (kiểm tra Vercel dashboard)
- [ ] Theo dõi logs trong ít nhất 5 phút sau khi backend khởi động

---

## Sau khi deploy

### Kiểm tra health
- [ ] `GET /api/health` → `{"status":"OK"}`
- [ ] Response header có `X-Correlation-ID`

### Kiểm tra luồng quan trọng
- [ ] Login bằng username và email → nhận token
- [ ] Refresh token → nhận token mới, token cũ bị revoke
- [ ] Tạo group → join → duyệt thành viên
- [ ] Tạo shift → đăng ký ca → manager duyệt
- [ ] Xem payroll tháng hiện tại

### Monitoring
- [ ] Không có lỗi 500 trong logs 15 phút đầu
- [ ] Rate limiter không trigger với traffic bình thường
- [ ] Thời gian response các endpoint list/report < 500ms

---

## Rollback

Nếu phát hiện lỗi nghiêm trọng sau deploy:

1. Revert code: `git checkout <previous-tag>`
2. Rebuild: `npm install && npm run build`
3. Restart service
4. Nếu có thay đổi DB: restore từ backup trước deploy
5. Ghi lại incident vào `docs/incidents/` (tạo file nếu chưa có)

---

*Template này áp dụng cho mọi release từ G0 trở đi.*  
*Cập nhật: 2026-04-22*
