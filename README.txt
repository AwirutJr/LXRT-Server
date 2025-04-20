*** เครื่องหมายที่ต้องใช้ ***
- `

- ทำ seo เพื่อจัดเเรงค์ให้คนค้นหาได้

*** แผนงาน PJ.LXRT ***
- table prisma mysql
- DB MySQL workbench 8.0 CE (จำลอง)
- Cloud ที่ใช้ CLOUDINARY
- DB Supabase (ใช้จริง)
- Deploy server ( vercel )
- Deploy client ( vercel )

- รวมงาน github

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

***Instail server Backend***

- npm init -y
(สร้างไฟล์ package)

- npm i express nodemon cors morgan

- npm i @prisma/client       // ติดตั้ง prisma
- npx prisma init            // ลง folder prisma
- npx prisma migrate dev --name "init" // save table and update

- npm install bcryptjs jsonwebtoken

*** clourd ***

- npm install cloudinary

.env
-   CLOUDINARY_CLOUD_NAME= your_cloud_name
    CLOUDINARY_API_KEY= your_api_key
    CLOUDINARY_API_SECRET= your_api_secret

*** เพิ่ม login google, facebook

- npm install passport passport-google-oauth20 express-session dotenv

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=your-secret-key


***Instail Fornt-end***

***register***
(react-hook-form, zod, @hookform/resolvers, zxcvbn)
- npm install react-hook-form zod @hookform/resolvers zxcvbn

- npm install zustand (store zustan)


*** end-point ***

1. Authentication (Auth)
    POST /auth/register → ลงทะเบียน                      (เสร็จแล้ว)
    POST /auth/login → เข้าสู่ระบบ                         (เสร็จแล้ว)
    POST /auth/logout → ออกจากระบบ                      (เสร็จแล้ว)     

2. User Management
    GET /users → ดึงรายชื่อผู้ใช้ทั้งหมด (Admin Only)  (เสร็จแล้ว)
    GET /users/:id → ดึงข้อมูลผู้ใช้ตาม ID             (เสร็จแล้ว)
    PUT /users/:id → แก้ไขข้อมูลผู้ใช้            (เสร็จแล้ว)
    DELETE /users/:id → ลบผู้ใช้                (เสร็จแล้ว)

3. Profile Management
    GET /users/me → ดึงข้อมูลโปรไฟล์ของตัวเอง     (เสร็จแล้ว)  
    PUT /users/me → แก้ไขข้อมูลโปรไฟล์ของตัวเอง    (เสร็จแล้ว) + เหลือรูป
    PUT /users/me/update-password → เปลี่ยนรหัสผ่าน (เสร็จแล้ว)
    PUT /users/me/upload-picture → อัปโหลดรูปโปรไฟล์   

4. User Activities
    GET /users/me/orders → ดูออเดอร์ของตัวเอง  
    GET /users/me/courses → ดูคอร์สที่ซื้อแล้ว
    GET /users/me/cart → ดูสินค้าที่อยู่ในตะกร้า
    POST /users/me/cart → เพิ่มคอร์สลงตะกร้า
    DELETE /users/me/cart/:courseId → ลบคอร์สออกจากตะกร้า

    5. Course Management
 GET /courses → ดูคอร์สทั้งหมด
 GET /courses/:id → ดูรายละเอียดคอร์ส
 POST /courses → สร้างคอร์ส (Admin Only)
 PUT /courses/:id → อัปเดตคอร์ส (Admin Only)
 DELETE /courses/:id → ลบคอร์ส (Admin Only)
 GET /courses/:id/videos → ดูวิดีโอของคอร์ส
 GET /courses/:id/images → ดูรูปภาพของคอร์ส
 POST /courses/:id/purchase → ซื้อคอร์ส

6. Video Management
 POST /videos/upload → อัปโหลดวิดีโอ
 GET /videos/:id → ดูข้อมูลวิดีโอ
 DELETE /videos/:id → ลบวิดีโอ

7. Image Management
 POST /images/upload → อัปโหลดรูปภาพ
 GET /images/:id → ดูข้อมูลรูปภาพ
 DELETE /images/:id → ลบรูปภาพ

8. Order Management
 GET /orders → ดูคำสั่งซื้อทั้งหมด (Admin Only)
 GET /orders/:id → ดูรายละเอียดคำสั่งซื้อ
 POST /orders → สร้างคำสั่งซื้อ
 PUT /orders/:id → อัปเดตสถานะคำสั่งซื้อ (Admin Only)
 DELETE /orders/:id → ลบคำสั่งซื้อ (Admin Only)

9. Category Management
 GET /categories → ดูหมวดหมู่ทั้งหมด
 GET /categories/:id → ดูหมวดหมู่ตาม ID
 POST /categories → สร้างหมวดหมู่ (Admin Only)
 PUT /categories/:id → อัปเดตหมวดหมู่ (Admin Only)
 DELETE /categories/:id → ลบหมวดหมู่ (Admin Only)

10. Admin Dashboard (Optional)
 GET /admin/stats → ดูสถิติยอดขาย
 GET /admin/users → ดูรายชื่อผู้ใช้
 GET /admin/courses → ดูรายชื่อคอร์ส


///////////////////////////////////////////// ความปลอดภัย

สรุปการป้องกันทั้งหมดที่คุณมีตอนนี้:
SQL Injection: ป้องกันโดย Prisma (ORM)

Brute Force / DoS: ป้องกันด้วย Rate Limiting

Cross-Site Scripting (XSS): ป้องกันด้วย Helmet

File Upload: จำกัดขนาดและประเภทไฟล์ด้วย Multer

Authentication & Authorization: ป้องกันการเข้าถึงข้อมูลด้วย JWT และ middleware (userCheck, adminCheck)

Password Security: ป้องกันการขโมยรหัสผ่านด้วย bcryptjs

Error Handling: กรองข้อผิดพลาดก่อนแสดงผลให้ผู้ใช้งาน

Sensitive Data: การเก็บ API keys และข้อมูลที่สำคัญในไฟล์ .env
