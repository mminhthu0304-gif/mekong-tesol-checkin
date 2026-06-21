# Mekong TESOL 2026 — Hệ thống Check-in: Tổng kết & Bối cảnh

> Tài liệu này dùng để đóng gói trạng thái hệ thống tại thời điểm kết thúc giai đoạn 1.  
> Cập nhật lần cuối: 21/06/2026

---

## 1. Bối cảnh sự kiện

**Mekong TESOL 2026** — Hội nghị ngôn ngữ học, dự kiến kéo dài **3+ ngày** (từ khoảng 19/07/2026).  
Quy mô: vài trăm người tham dự, check-in mỗi ngày, có nhiều nhóm (Keynote, Presenter, Participant...).

**Người dùng hệ thống:**
| Tên | Vai trò | PIN |
|-----|---------|-----|
| Minh Thư (quản lý) | Admin | `abc` (email: mminhthu.0304@gmail.com) |
| Hữu Bằng | Staff | `STAFF001` |
| Hồng Xuyến | Staff | `STAFF002` |
| Phương Trúc | Staff | `STAFF003` |
| Gia Linh | Staff | `STAFF004` |
| Mỷ Thảo | Staff | `STAFF005` |

> **Lưu ý:** PIN trong GAS được lưu trong Google Sheets tab `Users`. Admin có thể thay đổi qua giao diện web (Admin → Users).

---

## 2. Kiến trúc hệ thống

```
┌─────────────────────────────────┐    POST (text/plain + JSON)    ┌──────────────────────────┐
│  GitHub Pages (Frontend)        │ ──────────────────────────────▶ │  Google Apps Script (GAS) │
│  index.html (Single Page App)   │                                │  doPost() API endpoint    │
│  https://mminhthu0304-gif.       │ ◀────────────────────────────── │  Google Sheets database   │
│  github.io/mekong-tesol-checkin/ │    JSON response               └──────────────────────────┘
└─────────────────────────────────┘
```

**Lý do chọn kiến trúc này:** GAS không thể truy cập webcam trực tiếp (sandbox iframe). Giải pháp là đưa frontend ra GitHub Pages (HTTPS) — nơi `getUserMedia` hoạt động đầy đủ.

---

## 3. URLs & Credentials

| Thứ | URL / ID |
|-----|---------|
| **App (GitHub Pages)** | https://mminhthu0304-gif.github.io/mekong-tesol-checkin/ |
| **GAS API endpoint** | https://script.google.com/macros/s/AKfycbwmCY43mSD3GWzVBL2zRQgvUQcchp8HVoOoik1_yBjsOFdJ2AvWMZayGmK1BwdCw4Ih8g/exec |
| **GAS Editor** | https://script.google.com/d/127C4Sk7oXRYM0Uw1H0Qkspq6lCUAvRJBXCLSBwBnAIwLgxQ6xtA14pEx/edit |
| **Google Sheet (database)** | spreadsheetId: `1L2u9vwKjRe-dOev_OwUIKG05CVrc3Bxv88z4HKrgXtk` |
| **GitHub Repo** | https://github.com/mminhthu0304-gif/mekong-tesol-checkin |

---

## 4. Cấu trúc file dự án

```
Check-in Mekong TESOL/
├── index.html                  ← Toàn bộ frontend (Single Page App)
├── SYSTEM_CONTEXT.md           ← File này
└── GAS/
    ├── appsscript.json         ← Cấu hình GAS (access: ANYONE_ANONYMOUS)
    ├── Code.gs                 ← Entry point: doPost(), router, PIN auth, API handlers
    ├── Config.gs               ← Hằng số: GROUPS, PARTICIPANT_HEADERS, SETTINGS_DEFAULTS
    ├── Database.gs             ← CRUD functions, seedGroups, seedStaffUsers
    ├── CheckinService.gs       ← Logic check-in, undo, batch reset
    ├── DashboardService.gs     ← Thống kê tổng + theo ngày
    ├── ParticipantService.gs   ← CRUD participant, search, import
    ├── ImportService.gs        ← Review & commit CSV import
    ├── QrService.gs            ← Tạo QR payload
    ├── BackupExportService.gs  ← Backup Google Sheet, export CSV
    ├── UserService.gs          ← User management, role check
    └── Utils.gs                ← Helpers: nowIso_, normalizeText_, etc.
```

---

## 5. Database — Google Sheets

Spreadsheet có các tab sau:

| Sheet | Mục đích |
|-------|---------|
| **Participants** | Danh sách người tham dự (39 cột) |
| **Groups** | Cấu hình nhóm và màu sắc |
| **Users** | Tài khoản staff với PIN |
| **CheckinLogs** | Lịch sử mọi check-in |
| **AuditLogs** | Lịch sử thay đổi hệ thống |
| **Settings** | Cài đặt hệ thống (bao gồm quản lý ngày) |
| **ImportBatches** | Lịch sử import CSV |
| **Backups** | Lịch sử backup |

### Cột quan trọng trong Participants:
```
candidate_id | title | full_name | email | phone | affiliation | province
media_consent | main_group | detailed_group | on_site_status
checkin_status | checkin_time | checkin_by | checkin_method | checkin_count
pre_checkin_note | post_checkin_note | qr_payload | deleted
```

### Cột trong Settings (quản lý ngày):
```
current_day_label    → "Ngày 1 · 19/07/2026"
current_day_open     → "true" / "false"
current_day_start    → ISO timestamp khi mở ngày
```

---

## 6. Phân loại nhóm (Groups)

| detailed_group | main_group | Màu |
|---------------|-----------|-----|
| Participant | Participant | #5aa7e8 (xanh) |
| Delegate | Delegate | #0f7895 (xanh đậm) |
| Oral presenter | Presenter | #2703a6 (tím) |
| Poster presenter | Presenter | #dd9a4a (vàng) |
| Workshop presenter | Presenter | #1a8f45 (xanh lá) |
| Invited speaker | Speaker | #6a2ea6 (tím đậm) |
| Keynote speaker | Speaker | #b4235a (đỏ) |

> **Quan trọng:** Cột import CSV phải là `detailed_group` với giá trị khớp chính xác (phân biệt hoa thường).

---

## 7. Quy trình Auth

1. Người dùng nhập PIN → gọi `api('login', { pin })`
2. GAS tìm PIN trong sheet `Users` → trả về `{ email, name, role, pin }`
3. Mọi API call sau đó đều gửi `pin` trong body → GAS verify lại mỗi lần
4. **Admin** có toàn quyền. **Staff** không thể xoá, không thể bỏ check-in, không thấy tab Dashboard/Admin.

---

## 8. Luồng check-in (QR)

```
Camera bật tự động → jsQR quét liên tục (150ms) 
  → Phát hiện QR → Rung điện thoại + tạm dừng scan
  → Match với participant (qr_payload hoặc email)
  → Hiện Person Card (tên to, nhóm màu, affiliation, province, media consent, ghi chú BTC)
  → Bấm "Xác nhận check-in" → Flash màu toàn màn hình
  → Bấm "Đóng & quét tiếp" → camera tiếp tục
```

**Chặn trùng:** Cùng người, cùng ngày calendar → báo "Đã check-in hôm nay rồi". Ngày mới → cho phép check-in lại.

---

## 9. Quản lý ngày check-in (Multi-day)

**Flow mỗi sáng (Admin):**
1. Vào tab **Admin → 📅 Ngày**
2. Nhập tên ngày: `Ngày 1 · 19/07/2026`
3. Bấm **Mở ngày check-in** → tất cả participant reset về "Chưa check-in"
4. Staff bắt đầu scan bình thường
5. Cuối ngày: Admin bấm **Đóng** → khóa check-in

**Dữ liệu lịch sử:** CheckinLogs giữ nguyên toàn bộ. Dashboard → "Thống kê theo ngày" hiện bar chart mỗi ngày.

---

## 10. Tất cả API actions (GAS doPost)

| Action | Auth | Mô tả |
|--------|------|--------|
| `login` | Public | Verify PIN |
| `bootstrap` | Staff+ | Tải toàn bộ data khi login |
| `checkin` | Staff+ | Check-in 1 người |
| `undo_checkin` | Admin | Bỏ check-in |
| `search` | Staff+ | Tìm kiếm participant |
| `save_participant` | Staff+ | Tạo/sửa participant |
| `delete_participants` | Admin | Xoá participant(s) |
| `add_note` | Staff+ | Thêm ghi chú sau check-in |
| `dashboard` | Admin | Lấy thống kê tổng |
| `export` | Admin | Xuất CSV |
| `review_import` | Admin | Preview CSV import |
| `commit_import` | Admin | Xác nhận import |
| `generate_qr` | Admin | Tạo QR cho 1 người |
| `generate_missing_qr` | Admin | Tạo QR cho tất cả chưa có |
| `generate_all_qr` | Admin | Tạo lại tất cả QR |
| `backup` | Admin | Backup Google Sheet |
| `list_users` | Admin | Xem danh sách staff |
| `save_user` | Admin | Tạo/sửa staff |
| `delete_user` | Admin | Xoá staff |
| `open_day` | Admin | Mở ngày check-in + reset |
| `close_day` | Admin | Đóng ngày check-in |
| `day_stats` | Admin | Thống kê theo ngày |
| `get_settings` | Staff+ | Lấy settings |
| `groups` | Staff+ | Lấy danh sách nhóm |

---

## 11. Tính năng frontend (index.html)

### Tab Check-in (Staff + Admin)
- Day badge: hiện ngày đang mở (xanh/đỏ/xám)
- Camera tự động bật, scan line animation
- Chạm vào frame → bật camera
- QR phát hiện → rung + pause + hiện Person Card
- **Person Card:** header màu nhóm, tên to, affiliation, province, media consent, ghi chú BTC (trước HN), ghi chú trong HN
- Nút: Check-in → Thêm ghi chú | Sửa | Bỏ check-in (admin) → Đóng & quét tiếp | Người mới
- Flash màu toàn màn hình khi check-in thành công
- Search thủ công theo tên/email/SĐT/đơn vị

### Tab Danh sách (Staff + Admin)
- Bảng: checkbox · ✅/⏳ · Tên + đơn vị · Nhóm chip · Tỉnh · ✏️ 🗑️
- Filter: dropdown nhóm + chips (Tất cả / Đã check-in / Chưa)
- Multi-select → xoá hàng loạt (admin)
- Nút Thêm và Xuất CSV ở đầu trang

### Tab Dashboard (Admin)
- Stat cards: Tổng / Đã check-in hôm nay / Chưa / Tỉ lệ %
- Bar chart thống kê theo ngày (từ CheckinLogs)
- Bar chart theo nhóm

### Tab Admin (Admin)
- **📅 Ngày:** Mở/đóng ngày, cảnh báo reset, hiện trạng thái
- **📥 Import:** Kéo thả CSV, preview, xử lý trùng lặp
- **🔲 QR:** Tạo QR payload cho người chưa có / tất cả
- **👥 Users:** Quản lý staff + PIN
- **📤 Export:** Xuất CSV (tất cả / đã check-in / chưa / on-site)
- **💾 Backup:** Tạo bản sao Google Sheet

---

## 12. Import CSV — Format

File CSV cần có các cột sau (header row đầu tiên):

```
title, title_other_text, full_name*, email*, phone, affiliation*, nationality,
country, province, job, job_other_institution, institution, years_expe,
first_attend, source, source_oth, media_consent, ecert_cons, post_conference,
notes, detailed_group*
```
`*` = bắt buộc | `detailed_group` phải khớp chính xác với danh sách nhóm

---

## 13. Deploy & CI

**Frontend:** Push lên `main` branch → GitHub Pages tự cập nhật (~1 phút).

**GAS backend:** Dùng `clasp` để push code:
```bash
cd GAS/
clasp push --force
```
Sau khi push code → vào GAS Editor → **Deploy → Manage deployments → chỉnh sửa deployment** (không tạo mới — tạo mới sẽ thay đổi URL).

**Quan trọng:** GAS deployment URL **không được thay đổi** sau khi đã cài vào `index.html` tại dòng:
```js
const GAS_URL = 'https://script.google.com/macros/s/AKfycby...exec';
```

---

## 14. Những việc cần làm trước sự kiện

- [ ] Import danh sách người tham dự (Admin → Import CSV)
- [ ] Tạo QR cho tất cả (Admin → QR → "Tạo QR cho người chưa có")
- [ ] Gửi QR code cho từng người tham dự (email riêng)
- [ ] Test quét QR từ điện thoại thật trên cả iOS và Android
- [ ] Thêm ghi chú BTC (`pre_checkin_note`) cho những người VIP/đặc biệt (Admin → Sửa participant)
- [ ] Kiểm tra PIN của từng staff (đăng nhập thử)
- [ ] Test quy trình "Mở ngày" → Check-in → "Đóng ngày"

---

## 15. Những ràng buộc kỹ thuật cần biết

1. **GAS redirect:** POST đến exec URL → 302 → `script.googleusercontent.com`. Browser xử lý tự động, `curl` thì không. Đây là hành vi bình thường.
2. **CORS:** GAS trả về `access-control-allow-origin: *`. POST với `Content-Type: text/plain` (không phải `application/json`) để tránh preflight.
3. **Camera trên iOS Safari:** `jsQR` được chọn thay `BarcodeDetector` vì `BarcodeDetector` không hỗ trợ iOS.
4. **Xoá user:** Delete theo email (không phải PIN). Staff không có email thì không thể xoá qua API — phải xoá thủ công trong Sheet.
5. **Batch reset:** Khi mở ngày mới, GAS đọc toàn bộ sheet rồi ghi lại một lần (batch) — tránh 300+ API calls riêng lẻ.
6. **Thống kê ngày:** Tính từ `timestamp` trong CheckinLogs (không có cột riêng). Day label được nhúng vào cột `method` dạng `[Ngày 1] QR`.
