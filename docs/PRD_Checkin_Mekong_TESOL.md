# PRD Web App Check-in Mekong TESOL

## 1. Tong quan

### 1.1. Ten san pham

Web App Check-in Mekong TESOL

### 1.2. Muc tieu

Xay dung mot web app nho chay tren Google Apps Script va HTML, su dung Google Sheet lam database trung tam de quan ly danh sach nguoi tham du Mekong TESOL, quet QR check-in bang webcam/camera dien thoai, tim kiem thu cong khi khong quet duoc QR, nhap bo sung nguoi tham du tai quay, quan ly QR code, thong ke check-in va luu log moi thao tac.

### 1.3. Nen tang

- Backend: Google Apps Script.
- Frontend: HTML, CSS, JavaScript trong GAS Web App.
- Database: Google Sheet.
- Dang nhap: Google account/Gmail.
- Thiet bi: laptop co webcam, dien thoai, tablet.
- Ngon ngu giao dien: song ngu Viet - Anh.

### 1.4. Pham vi PRD

PRD nay bao gom ca yeu cau san pham va kien truc ky thuat muc cao cho GAS + HTML + Google Sheet. Tai lieu dung de chot chuc nang truoc khi tao database va trien khai web app.

## 2. Doi tuong nguoi dung

### 2.1. Admin

Nguoi quan tri he thong check-in.

Quyen:

- Xem tat ca view.
- Tao/cap lai/xoa QR code.
- Tao QR hang loat.
- Them, sua, xoa nguoi tham du.
- Check-in nguoi tham du.
- Xem dashboard.
- Xuat danh sach ra Excel.
- Quan ly backup/sao luu.
- Xem log thao tac.
- Quan ly cau hinh nhom, mau, role.

### 2.2. Check-in staff

Nhan su truc quay check-in.

Quyen:

- Xem view noi bo.
- Quet QR.
- Tim kiem nguoi tham du.
- Xac nhan check-in.
- Them nguoi dang ky tai quay.
- Sua thong tin can thiet.
- Xoa ban ghi neu duoc Admin cap quyen.
- Them ghi chu sau check-in.
- Xem danh sach da check-in/chua check-in.

Moi thao tac them, sua, xoa, check-in, bo check-in, tao/cap lai QR phai duoc ghi log.

### 2.3. Khach/nguoi tham du

Nguoi tham du su kien.

Quyen:

- Xem view khach.
- Nhap thong tin ca nhan de bo sung vao danh sach neu chua co trong he thong.
- Khong duoc xem danh sach nguoi tham du khac.
- Khong duoc sua thong tin nguoi khac.

## 3. Phan loai nguoi tham du

He thong can phan biet ro nhom nguoi tham du bang ten nhom, mau hien thi va chip phan loai tren giao dien.

### 3.1. Thu tu nhom chi tiet trong dropdown

Nguoi dung chi chon `Nhom chi tiet`. `Nhom chinh` do he thong tu map de phuc vu thong ke, nguoi dung khong tu sua truc tiep.

Thu tu dropdown:

- Participant
- Delegate
- Oral presenter
- Poster presenter
- Workshop presenter
- Invited speaker
- Keynote speaker

### 3.2. Nhom chinh va nhom phu

Mot nguoi co the co:

- Nhom chinh: Participant, Delegate, Presenter, Speaker.
- Nhom chi tiet: Participant, Delegate, Oral presenter, Poster presenter, Workshop presenter, Invited speaker, Keynote speaker.

Vi du:

- Nhom chinh: Presenter
- Nhom chi tiet: Oral presenter
- Trang thai nguon du lieu: Pre-registered

`On-site Registration` khong phai la nhom trong dropdown. Day la trang thai/nguon du lieu he thong tu ghi nhan khi nguoi duoc them vao dung ngay on-site registration cau hinh trong Settings. Nguoi nhap them van phai duoc phan loai bang nhom chi tiet nhu Participant, Delegate, Oral presenter...

## 4. View va luong chinh

### 4.1. View khach

View danh cho nguoi tham du tu nhap thong tin bo sung.

Chuc nang:

- Hien form song ngu Viet - Anh.
- Cho phep nguoi tham du nhap thong tin ca nhan neu chua co trong danh sach.
- Truong bat buoc:
  - Ho va ten
  - Affiliation/Don vi
  - Email
  - Nhom nguoi tham du
- Truong nen co:
  - So dien thoai
  - Chuc danh/vai tro
  - Quoc gia/tinh thanh
  - Ghi chu tu nguoi tham du
- Sau khi gui, ban ghi duoc them vao sheet voi trang thai `Pending review` hoac `On-site Registration`.
- Mac dinh khong tao QR cho nguoi nhap tu view khach. QR chi tao sau khi Admin/Staff can.

View khach khong hien thong tin noi bo, khong hien danh sach nguoi tham du, khong hien ghi chu cua BTC.

### 4.2. View noi bo check-in

View danh cho Admin va Check-in staff.

Chuc nang chinh:

- Quet QR bang webcam laptop, camera dien thoai hoac tablet.
- Tim kiem thu cong trong mot o search.
- Search tren nhieu cot: ho ten, email, so dien thoai, noi cong tac/affiliation, nhom, ghi chu.
- Hien danh sach ket qua neu co nhieu nguoi trung thong tin.
- Hien thong tin chi tiet truoc khi xac nhan:
  - Ho ten
  - Email
  - So dien thoai
  - Don vi
  - Ghi chu truoc check-in tu BTC
  - Affiliation / Noi cong tac
  - media_consent
  - Nhom/chip mau
  - Trang thai check-in
  - Lich su check-in neu co
- Nut xac nhan check-in.
- Nut sua thong tin.
- Nut them ghi chu sau check-in.
- Nut bo check-in/undo neu Admin cho phep.
- Canh bao neu nguoi nay da check-in truoc do.

### 4.3. View noi bo danh sach check-in

View bo sung cho staff.

Chuc nang:

- Xem danh sach da check-in.
- Xem danh sach chua check-in.
- Loc theo nhom.
- Loc theo trang thai: da check-in, chua check-in, check-in nhieu lan, moi nhap tai quay, pending review.
- Tim kiem trong danh sach.
- Xem so luong nhanh theo tung nhom.

### 4.4. Dashboard

Chuc nang:

- Tong so nguoi trong database.
- Tong so da check-in.
- Tong so chua check-in.
- Ty le check-in.
- So luong theo nhom.
- So luong da check-in theo nhom.
- So luong On-site Registration.
- So luong QR chua tao.
- So luong QR loi/can cap lai.
- Bieu do/checklist tong quan cho BTC.

## 5. Luong check-in

### 5.1. Check-in bang QR

1. Staff mo view noi bo.
2. Chon camera/webcam.
3. Quet QR cua nguoi tham du.
4. He thong doc noi dung QR.
5. He thong tim ban ghi phu hop trong Google Sheet.
6. Hien thong tin nguoi tham du kem mau va chip phan loai.
7. Staff kiem tra ghi chu truoc check-in tu BTC.
8. Staff bam `Xac nhan check-in`.
9. He thong cap nhat trang thai:
   - Check-in status = Checked-in
   - Check-in time = thoi diem hien tai
   - Check-in by = email staff dang nhap
   - Check-in method = QR
10. He thong ghi log thao tac.
11. He thong hien man hinh thanh cong.

### 5.2. Check-in bang tim kiem thu cong

1. Staff nhap tu khoa vao mot o search.
2. He thong tim tren nhieu cot.
3. Neu co mot ket qua, hien chi tiet nguoi tham du.
4. Neu co nhieu ket qua, hien danh sach de chon dung nguoi.
5. Staff chon nguoi phu hop.
6. Staff bam `Xac nhan check-in`.
7. He thong cap nhat va ghi log voi method = Manual search.

### 5.3. Truong hop da check-in

Neu nguoi tham du da check-in:

- Hien canh bao ro rang: `Nguoi nay da check-in luc [thoi gian] boi [email staff]`.
- Khong tu dong check-in lan nua.
- Cho phep Admin hoac staff duoc cap quyen:
  - Ghi them ghi chu.
  - Cap nhat thong tin.
  - Check-in lai neu can, nhung phai ghi log lan check-in bo sung.

## 6. Them nguoi tham du tai quay

### 6.1. Muc dich

Dung khi nguoi tham du chua dang ky truoc hoac khong tim thay trong database.

### 6.2. Truong bat buoc

- Ho va ten
- Affiliation/Don vi
- Email
- Nhom nguoi tham du

### 6.3. Truong khuyen nghi

- So dien thoai
- Vai tro/chuc danh
- Nhom chi tiet
- Ghi chu cua staff
- Ly do them moi

### 6.4. Logic

- Ban ghi moi co source = On-site Registration.
- Source `On-site Registration` do he thong tu gan neu ngay hien tai trung voi ngay on-site registration trong Settings.
- Van phai chon nhom chi tiet: Participant, Delegate, Oral presenter, Poster presenter, Workshop presenter, Invited speaker, Keynote speaker.
- Mac dinh khong tao QR.
- Neu can, Admin/Staff bam `Tao QR` sau.
- Moi ban ghi them moi phai luu:
  - Created at
  - Created by
  - Updated at
  - Updated by

## 7. Sua thong tin va ghi chu

### 7.1. Sua thong tin

Staff co the sua thong tin nguoi tham du neu co quyen.

Co the sua:

- Ho ten
- Email
- So dien thoai
- Don vi
- Nhom
- Ghi chu cua BTC
- Ghi chu sau check-in
- Trang thai QR

### 7.2. Log khi sua

Moi lan sua phai ghi vao sheet log:

- Log ID
- Thoi gian
- User email
- Action type
- Email
- Truong bi sua
- Gia tri cu
- Gia tri moi
- Ly do/ghi chu neu co

### 7.3. Ghi chu truoc va sau check-in

Can tach hai loai ghi chu:

- Ghi chu tu BTC truoc check-in: hien cho staff de biet thong tin can luu y.
- Ghi chu sau check-in: staff nhap trong qua trinh check-in, luu lai sau khi check-in.

## 8. QR code

### 8.1. Noi dung QR

Yeu cau hien tai: QR chua ten va email.

De tang do on dinh va tranh trung lap, QR payload nen co email vi email la khoa doi chieu chinh khi quet.

`QR payload` la chuoi du lieu duoc ma hoa trong QR code. Khi staff quet QR, app doc payload va dung cac gia tri trong payload de tim dung nguoi trong Google Sheet. Payload khong phai la truong nguoi dung can nhap thu cong; no duoc he thong tao/cap lai khi tao QR.

He thong khong quan ly `Ma dang ky` nhu mot truong nghiep vu hien thi cho staff. Neu can khoa noi bo de code hoat dong, khoa nay chi la ID ky thuat. Giao dien check-in khong hien `Ma dang ky`; thay vao do hien `Affiliation / Noi cong tac` va `media_consent`.

Dinh dang khuyen nghi:

```json
{
  "event": "MekongTESOL",
  "name": "Nguyen Van A",
  "email": "a@example.com"
}
```

Neu can QR ngan gon hon:

```text
Nguyen Van A|a@example.com
```

He thong van hien QR theo yeu cau co ten va email, nhung khi xu ly nen uu tien email de tim chinh xac.

Tren giao dien admin, cot `QR payload` can co mo ta ngan gon de BTC hieu day la du lieu ma QR chua, khong phai noi dung hien thi cho khach.

### 8.2. Chuc nang QR

He thong can co:

- Tao QR cho nguoi chua co QR.
- Tao lai QR bi loi.
- Tao QR cho nguoi nhap moi tai quay khi can.
- Tao QR hang loat cho toan bo danh sach.
- Cap lai QR cho mot nguoi.
- Xem trang thai QR: Not generated, Generated, Regenerated, Error, Deleted.
- Luu QR code URL hoac file ID vao Google Sheet.

### 8.3. Xoa va tao lai QR

Neu xoa QR de tao lai:

- Phai hien hop thoai xac nhan.
- Noi dung xac nhan can neu ro:
  - Ten nguoi tham du
  - Email
  - Email
  - QR cu se bi vo hieu hoa/xoa khoi he thong
- Sau khi xac nhan, he thong moi xoa QR cu va tao QR moi.
- Tat ca thao tac xoa/tai tao phai duoc ghi log.

### 8.4. Luu tru QR

Phuong an khuyen nghi:

- Tao QR bang Apps Script hoac thu vien QR client-side.
- Luu QR image vao Google Drive folder rieng.
- Luu `QR File ID`, `QR URL`, `QR status`, `QR generated at`, `QR generated by` vao Google Sheet.

## 9. Database Google Sheet

### 9.1. Sheet `Participants`

Sheet chinh quan ly nguoi tham du.

Cot de xuat:

- candidate_id
- Full name
- title
- title_other_text
- Email
- Phone
- Affiliation
- nationality
- country
- province
- job
- job_other_institution
- institution
- years_expe
- first_attend
- source
- source_oth
- media_consent
- ecert_cons
- post_conference
- notes
- Title/Position
- Country/Province
- Main group
- Detailed group
- Group color
- Source
- Registration status
- Payment status
- QR payload
- QR file ID
- QR URL
- QR status
- QR generated at
- QR generated by
- Check-in status
- Check-in time
- Check-in by
- Check-in method
- Check-in counter
- Pre-check-in note from organizer
- Post-check-in note from staff
- Internal note
- Created at
- Created by
- Updated at
- Updated by
- Deleted flag

`candidate_id` la khoa noi bo bat buoc, duy nhat cho moi candidate. He thong can co `candidate_id` de cap nhat dung dong khi email/phone/ten bi sua, ghi check-in log va audit log on dinh, lien ket QR payload/import batch/backup, va tranh nham lan khi trung ten hoac doi email.

`candidate_id` khong duoc hien nhu `Ma dang ky` tren man hinh check-in cua staff. View staff khong quan ly ma dang ky; view nay chi hien thong tin nguoi tham du, nhom, ghi chu BTC, affiliation/noi cong tac, media_consent va trang thai check-in.

### 9.2. Sheet `Groups`

Quan ly nhom va mau.

Cot de xuat:

- Group ID
- Main group
- Detailed group
- Display name VI
- Display name EN
- Color hex
- Text color hex
- Priority
- Active

### 9.3. Sheet `CheckinLogs`

Luu moi lan check-in.

Cot de xuat:

- Log ID
- Timestamp
- candidate_id
- Full name
- Email
- Action
- Check-in method
- User email
- Device info
- Previous status
- New status
- Note

### 9.4. Sheet `AuditLogs`

Luu moi thao tac them, sua, xoa, tao QR, cap lai QR, backup.

Cot de xuat:

- Audit ID
- Timestamp
- User email
- Role
- Action type
- Target sheet
- Target ID
- Field changed
- Old value
- New value
- Reason/note
- Device info

### 9.5. Sheet `Users`

Quan ly phan quyen.

Cot de xuat:

- Email
- Name
- Role
- Active
- Allowed actions
- Last login
- Created at
- Updated at

### 9.6. Sheet `Settings`

Cau hinh he thong.

Cot de xuat:

- Key
- Value
- Description
- Updated at
- Updated by

### 9.7. Sheet `Backups`

Theo doi backup.

Cot de xuat:

- Backup ID
- Timestamp
- Backup type
- Spreadsheet copy ID
- Drive folder ID
- Created by
- Note

### 9.8. Import danh sach tu Excel/CSV

He thong can cho Admin import danh sach ban dau hoac danh sach bo sung tu file Excel/CSV.

Chuc nang:

- Nut `Tai template`.
- Nut `Import danh sach`.
- Template can theo cau truc file thuc te:
  - title
  - title_other_text
  - full_name
  - email
  - phone
  - affiliation
  - nationality
  - country
  - province
  - job
  - job_other_institution
  - institution
  - years_expe
  - first_attend
  - source
  - source_oth
  - media_consent
  - ecert_cons
  - post_conference
  - notes
- Khi import, he thong them du lieu vao cac dong con trong trong sheet `Participants`, khong ghi de cac dong hien co.
- He thong khong yeu cau file import co `Registration ID` / `Ma dang ky`.
- Neu he thong can ID ky thuat noi bo, ID nay duoc tao tu dong va khong hien nhu truong nghiep vu tren giao dien check-in.
- He thong tu map `Detailed group` sang `Main group`.
- Source duoc he thong tu gan theo quy tac ngay on-site registration trong `Settings`.
- Mac dinh nguoi import moi co:
  - Check-in status = Not checked-in
  - QR status = Not generated
- Khi bam `Chi tiet / chinh sua`, giao dien phai hien toan bo cac cot import o tren de staff/admin xem va dieu chinh.

Kiem tra trung:

- Can canh bao neu trung email voi nguoi da co trong sheet.
- Can canh bao neu trung so dien thoai voi nguoi da co trong sheet.
- Can canh bao neu trung email hoac so dien thoai giua cac dong trong file import.
- Neu co dong trung, he thong hien man hinh duyet import:
  - Hien dong moi.
  - Hien ban ghi dang bi trung.
  - Hien ly do trung: email, so dien thoai, hoac ca hai.
  - Cho Admin chon import hoac bo qua tung dong trung.
  - Cho phep import tat ca dong khong trung truoc.
- Moi lan import phai ghi AuditLogs:
  - File name
  - So dong doc duoc
  - So dong import thanh cong
  - So dong bi bo qua
  - So dong trung duoc Admin phe duyet import
  - User email
  - Timestamp

## 10. Mau sac va hien thi

### 10.1. Yeu cau

- Khi check-in thanh cong, hien ten nguoi tham du kem mau nhom.
- Hien chip phan loai nhom ro rang.
- Mau nhom lay tu sheet `Groups`.
- Mau phai de doc tren man hinh lon, laptop, tablet va dien thoai.

### 10.2. Goi y mau mac dinh

- Keynote speaker: do dam
- Invited speaker: tim
- Oral presenter: xanh duong
- Workshop presenter: xanh la
- Poster presenter: cam
- Sponsors: vang/amber
- Dai dien: teal
- Participant: xanh nhat
- Delegate: teal
- Trang thai/source On-site Registration: hong/magenta neu can hien thi rieng trong dashboard/admin.

Mau cu the se chot trong giai do UI.

## 11. Bao cao va xuat du lieu

### 11.1. Dashboard

Dashboard can cap nhat nhanh tu Google Sheet.

Chi so:

- Total participants
- Checked-in
- Not checked-in
- Check-in rate
- Checked-in by group
- Not checked-in by group
- On-site registrations
- QR generated/missing/error

### 11.2. Xuat Excel

Admin/Staff duoc cap quyen co the xuat:

- Danh sach toan bo nguoi tham du.
- Danh sach da check-in.
- Danh sach chua check-in.
- Danh sach theo nhom.
- Danh sach On-site Registration.
- Lich su check-in.
- Audit log neu Admin yeu cau.

File xuat nen o dinh dang `.xlsx` hoac tao Google Sheet copy de tai ve Excel.

## 12. Backup va sao luu

### 12.1. Muc tieu

Dam bao khong mat du lieu trong ngay dien ra su kien.

### 12.2. Chuc nang backup

- Tao ban sao Google Sheet thu cong.
- Tao backup tu dong theo lich.
- Luu backup vao Google Drive folder rieng.
- Ghi log moi lan backup.
- Hien danh sach backup gan nhat trong view Admin.

### 12.3. Tan suat backup de xuat

- Truoc ngay su kien: backup moi ngay.
- Trong ngay su kien: backup moi 15-30 phut.
- Backup thu cong truoc khi import danh sach lon, tao QR hang loat, xoa QR hang loat hoac sua nhieu ban ghi.

## 13. Bao mat va phan quyen

### 13.1. Dang nhap

- Nguoi dung noi bo phai dang nhap bang Gmail/Google account.
- He thong lay email dang nhap de xac dinh role.
- Chi email co trong sheet `Users` va active moi duoc vao view noi bo.

### 13.2. View khach

Co the mo cong khai bang link rieng, nhung chi cho phep them thong tin ca nhan. Can co co che chong spam co ban:

- Gioi han so lan gui theo email.
- Validate email.
- Honeypot hidden field hoac reCAPTCHA neu can.
- Trang thai ban ghi moi la Pending review/On-site Registration.

### 13.3. Du lieu nhay cam

- Khong hien ghi chu noi bo o view khach.
- Khong cho khach search danh sach.
- Khong expose API tra ve toan bo Participants cho view khach.

## 14. Yeu cau ky thuat

### 14.1. Cau truc file GAS de xuat

- `Code.gs`: entry point, routing, auth, API server-side.
- `Database.gs`: doc/ghi Google Sheet, validate schema.
- `CheckinService.gs`: logic check-in.
- `ParticipantService.gs`: them/sua/xoa/tim kiem nguoi tham du.
- `QrService.gs`: tao, cap lai, xoa QR.
- `DashboardService.gs`: tinh thong ke.
- `BackupService.gs`: backup/sao luu.
- `AuditLogService.gs`: ghi log.
- `ExportService.gs`: xuat Excel/Google Sheet.
- `ImportService.gs`: tai template, doc file Excel/CSV, validate cot, phat hien trung email/phone, them dong moi vao sheet `Participants`, ghi audit log.
- `setupDatabase()`: ham Apps Script co san de tao cac sheet database, header, nhom mac dinh, settings mac dinh va user admin ban dau.
- `Index.html`: shell giao dien.
- `StaffView.html`: view noi bo.
- `GuestView.html`: view khach.
- `DashboardView.html`: dashboard.
- `Styles.html`: CSS.
- `Client.html`: JavaScript client-side.

### 14.2. Thu vien QR scanner

Frontend can dung thu vien JavaScript scan QR tu camera. Lua chon de xuat:

- `html5-qrcode`
- Hoac thu vien QR scanner tuong thich trinh duyet di dong va desktop.

Yeu cau:

- Ho tro HTTPS.
- Ho tro camera laptop va dien thoai.
- Cho phep chon camera neu co nhieu camera.
- Co fallback tim kiem thu cong.

### 14.3. Hieu nang

Google Sheet co the cham neu doc/ghi lien tuc. Can:

- Cache danh sach nguoi tham du trong thoi gian ngan.
- Search client-side tren dataset da tai neu so luong vua phai.
- Khi update check-in, ghi truc tiep server-side vao Sheet.
- Dung lock service de tranh 2 staff check-in cung luc gay xung dot.

### 14.4. Trang thai du lieu

Registration status:

- Pre-registered
- On-site Registration
- Pending review
- Cancelled
- Deleted

Check-in status:

- Not checked-in
- Checked-in
- Checked-in multiple times
- Reverted

QR status:

- Not generated
- Generated
- Regenerated
- Error
- Deleted

On-site registration status/source:

- Ngay on-site registration duoc luu trong `Settings`.
- Khi staff/admin them moi nguoi tham du vao dung ngay nay, he thong tu gan `Source = On-site Registration`.
- Staff khong can chon On-site Registration trong dropdown nhom.

## 15. Yeu cau giao dien

### 15.1. Nguyen tac chung

- Toan man hinh cho quay check-in.
- Nut lon, de bam tren tablet.
- Ket qua check-in ro rang, mau sac de nhan dien nhanh.
- Search o vi tri noi bat.
- Thao tac chinh khong qua 2 buoc.
- Song ngu Viet - Anh.

### 15.2. Man hinh check-in

Thanh phan:

- Camera scanner.
- O search tong.
- Danh sach ket qua search.
- Khung thong tin nguoi tham du.
- Chip nhom co mau.
- Ghi chu BTC truoc check-in nam ngay sau ten/nhom/thong tin ca nhan va truoc cac thong tin he thong nhu affiliation, media_consent, check-in time, check-in by.
- Thay vi hien `Ma dang ky`, view check-in hien `Affiliation / Noi cong tac`.
- Thay vi hien `Nguon / Pre-registered`, view check-in hien `media_consent`.
- O nhap ghi chu sau check-in.
- Nut `Xac nhan check-in`.
- Nut `Sua thong tin`.
- Nut `Them nguoi moi`.

View check-in khong hien nut QR code trong panel thao tac cua check-in staff. QR management nam trong view admin rieng.

### 15.3. Man hinh thanh cong

Sau check-in:

- Hien ten lon.
- Hien nhom/chip mau.
- Hien thong bao song ngu.
- Hien thoi gian check-in.
- Hien staff check-in neu view noi bo.

### 15.4. Man hinh canh bao

Can co canh bao cho:

- Da check-in truoc do.
- Khong tim thay QR.
- QR khong dung dinh dang.
- Co nhieu ket qua trung.
- Email da ton tai.
- Xoa/cap lai QR.
- Xoa nguoi tham du.

## 16. Tieu chi nghiem thu

### 16.1. Check-in QR

- Co the quet QR bang webcam laptop.
- Co the quet QR bang camera dien thoai/tablet.
- Quet QR dung thi hien dung nguoi.
- Check-in thanh cong thi cap nhat Google Sheet.
- Da check-in thi hien canh bao neu quet lai.

### 16.2. Tim kiem thu cong

- Mot o search tim duoc tren ten, email, so dien thoai, noi cong tac/affiliation, nhom, ghi chu.
- Neu co nhieu ket qua, hien danh sach de chon.
- Sau khi chon, co the check-in nhu QR.

### 16.3. Them nguoi moi

- Staff them duoc nguoi chua dang ky.
- Truong bat buoc duoc validate.
- Ban ghi moi co source = On-site Registration.
- Mac dinh khong tao QR.
- Them moi duoc ghi log.

### 16.4. Sua va ghi chu

- Staff/Admin sua duoc thong tin theo quyen.
- Moi thay doi duoc luu vao AuditLogs.
- Ghi chu truoc check-in hien cho staff.
- Ghi chu sau check-in duoc luu rieng.

### 16.5. QR management

- Tao QR cho tung nguoi.
- Tao QR hang loat.
- Cap lai QR.
- Tao QR cho nguoi nhap moi khi can.
- Xoa/tai tao QR phai co xac nhan.
- Moi thao tac QR duoc ghi log.

### 16.6. Dashboard va export

- Dashboard hien tong so da check-in, chua check-in, theo nhom.
- Co the xem danh sach da check-in va chua check-in.
- Co the xuat danh sach check-in ra Excel.

### 16.7. Backup

- Tao duoc backup thu cong.
- Co log backup.
- Co co che backup dinh ky theo cau hinh.

### 16.8. Import Excel/CSV

- Admin tai duoc template import.
- Admin import duoc file Excel/CSV dung template.
- Du lieu moi duoc them vao dong con trong, khong ghi de dong hien co.
- He thong canh bao trung email.
- He thong canh bao trung so dien thoai.
- He thong hien danh sach dong trung de Admin duyet import hoac bo qua.
- Dong khong trung duoc import nhanh.
- Moi import duoc ghi log.

## 17. Ngoai pham vi phien ban dau

Co the de ngoai MVP neu can lam nhanh:

- In badge tai quay.
- Gui email QR hang loat cho nguoi tham du.
- Tich hop thanh toan.
- App mobile native.
- Offline mode hoan chinh khi mat internet.
- Phan tich nang cao theo khung gio.

## 18. Cau hoi can chot truoc khi trien khai

1. Ten su kien va nam hien tren QR/app la `Mekong TESOL 2026` hay ten khac?
2. QR payload chinh thuc co can chi gom `full_name|email`, hay them truong nao khac ngoai email de doi chieu?
3. View khach co mo cong khai cho tat ca nguoi co link hay chi dung tai quay?
4. Staff co thuc su duoc xoa nguoi tham du, hay chi Admin duoc xoa con Staff chi duoc sua/them?
5. Danh sach mau nhom co can theo bo mau nhan dien Mekong TESOL khong?
6. File import chinh thuc se la Excel `.xlsx`, CSV, hay can ho tro ca hai?
7. Co can gui QR qua email cho nguoi tham du truoc su kien khong?
8. Co can in badge/nametag tu du lieu check-in khong?
9. Backup dinh ky mong muon moi bao lau trong ngay su kien?
10. Can bao nhieu quay check-in dung dong thoi?

## 19. De xuat MVP

MVP nen gom:

- Database Google Sheet voi cac sheet Participants, Groups, Users, CheckinLogs, AuditLogs, Settings, Backups.
- View noi bo check-in bang QR va search.
- View them nguoi moi tai quay.
- View khach tu nhap thong tin co ban.
- Quan ly nhom va mau.
- Tao/cap lai QR ca don le va hang loat.
- Dashboard tong quan.
- Danh sach da check-in/chua check-in cho staff.
- Export Excel.
- Import Excel/CSV voi template va man hinh duyet trung email/phone.
- Backup thu cong va backup tu dong.
- Audit log cho moi thao tac quan trong.

Gioi han role:

- Check-in staff uu tien thay cac view thao tac: check-in, danh sach, ghi chu truoc, ghi chu sau, them/sua nguoi tham du.
- Check-in staff khong can thay dashboard, audit log, QR management, so QR thieu hoac log metric tren man hinh chinh.
- Dashboard, audit va QR management chi danh cho Admin.

Sau khi MVP on dinh moi mo rong sang gui email QR, in badge va cac bao cao nang cao.
