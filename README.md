# Webtech - ร้านขายมังงะมือสอง 📚
เว็บแอปพลิเคชันสำหรับการซื้อและขายมังงะมือสอง
## 📖 เกี่ยวกับโปรเจค
โปรเจคนี้เป็นเว็บแอปพลิเคชันที่ใช้สำหรับซื้อและขายมังงะมือสอง  
ผู้ใช้สามารถเลือกดูหนังสือ เพิ่มลงตะกร้า และดำเนินการซื้อสินค้า  
ผู้ดูแลระบบ (Admin) สามารถจัดการสินค้าภายในระบบได้


🛠️ วิธีติดตั้ง
1️⃣ คัดลอก (Clone) โปรเจคจาก GitHub
git clone https://github.com/yourusername/webtech.git
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



//ผู้พัฒนา//
นาย นัทธพงศ์ อุปถัมภ์ 66021735
นาย อนุสิษฐ์ ง้วนกันทะ 66022275


















