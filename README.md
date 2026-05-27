# Webtech - ร้านขายมังงะมือสอง 📚
เว็บแอปพลิเคชันสำหรับการซื้อและขายมังงะมือสอง
## 📖 เกี่ยวกับโปรเจค
โปรเจคนี้เป็นเว็บแอปพลิเคชันที่ใช้สำหรับซื้อและขายมังงะมือสอง  
ผู้ใช้สามารถเลือกดูหนังสือ เพิ่มลงตะกร้า และดำเนินการซื้อสินค้า  
ผู้ดูแลระบบ (Admin) สามารถจัดการสินค้าภายในระบบได้


🛠️ วิธีติดตั้ง
1️⃣ คัดลอก (Clone) โปรเจคจาก GitHub
git clone https://github.com/Anusit66022275/webtech.git
cd webtech


2️⃣ ติดตั้ง dependencies ที่จำเป็น
npm install

3️⃣ สร้างไฟล์ .env และกำหนดค่าพื้นฐาน
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=manga_shop
SECRET_KEY=your_secret_key



วิธีการเชื่อมต่อฐานข้อมูล
1️⃣ เปิด XAMPP และ Start MySQL

1.เปิด XAMPP Control Panel
2.กดปุ่ม Start ที่ MySQL

2️⃣ เข้าไปยังโฟลเดอร์ MySQL ใน XAMPP
cmd ในโหมด Administrator
cd C:\xampp\mysql\bin

3️⃣ ล็อกอินเข้าสู่ MySQL
mysql -u root

4️⃣ ต้องสร้างฐานข้อมูลมาโดยการ
CREATE DATABASE manga_shop;
USE manga_shop;
exit;

5️⃣ นำเข้าไฟล์ฐานข้อมูล manga_shop.sql
cd C:\Users\Advice\Desktop\project2
mysql -u root manga_shop < manga_shop.sql

6️⃣ รันโปรเจค
npm run dev

นำอันนี้ไปวางบน Chrome
http://localhost:3000/home

ถ้าจะเข้าสู่ระบบในสถานะผู้ดูแล
admin@example.com
admin123

//ผู้พัฒนา//
นาย นัทธพงศ์ อุปถัมภ์ 66021735
นาย อนุสิษฐ์ ง้วนกันทะ 66022275


โครงสร้าง

webtech/
├── server.js          (50 บรรทัด — setup + mount เท่านั้น)
├── db.js              (database pool)
├── middleware/
│   ├── auth.js        (isAdmin, isLoggedIn, loginLimiter)
│   ├── upload.js      (multer config)
│   └── globals.js     (res.locals: user, genres, unreadNotifCount)
├── helpers/
│   └── cart.js        (getCartDB, parseCookieCart)
└── routes/
    ├── auth.js        (login, logout, register)
    ├── books.js       (home, search, /Book, book-details)
    ├── cart.js        (cart CRUD)
    ├── checkout.js    (checkout)
    ├── orders.js      (order-history)
    ├── wishlist.js    (wishlist)
    ├── reviews.js     (reviews)
    ├── notifications.js
    ├── profile.js
    ├── coupons.js
    └── admin.js       (admin ทั้งหมด)


















