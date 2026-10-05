# ปฏิทินธรรม — เว็บไซต์วันสำคัญทางพระพุทธศาสนาไทย

เว็บไซต์แบบ static เขียนด้วย HTML, CSS, JavaScript และ jQuery เท่านั้น ไม่มีฐานข้อมูล

## วิธี deploy บน Vercel

1. อัปโหลดโฟลเดอร์นี้ขึ้น GitHub (หรือใช้ `vercel` CLI ในโฟลเดอร์นี้)
2. ที่ Vercel เลือก Add New → Project แล้วเลือก repository
3. Framework Preset: **Other** — ปล่อย Build Command และ Output Directory ว่างไว้ แล้วกด Deploy

## วิธีแก้ไขเนื้อหา

แก้ที่ไฟล์ `js/data.js` ไฟล์เดียว

- `BD.EVENTS` — เพิ่มวันสำคัญปีถัดไป (วันที่แบบ `YYYY-MM-DD`)
- `BD.VIDEOS` — เพิ่มวิดีโอ YouTube (`ref` = รหัส 11 ตัว), TikTok (`ref` = เลขท้าย URL), Facebook (`ref` = URL เต็มของวิดีโอสาธารณะ)
- `BD.LINKS` — เพิ่มหรือลบเว็บไซต์ในเมนู

## โครงสร้างไฟล์

- `index.html` — หน้าเดียว
- `css/style.css` — สไตล์
- `js/jquery.min.js` — jQuery 3.7.1 (ใส่ไว้ในโปรเจกต์ ไม่พึ่ง CDN)
- `js/data.js` — ข้อมูลทั้งหมด
- `js/app.js` — นับถอยหลัง แท็บ ปฏิทิน วิดีโอ เมนู
- `vercel.json` — ค่า header พื้นฐาน
