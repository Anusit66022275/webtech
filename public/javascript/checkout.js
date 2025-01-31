const paymentForm = document.getElementById('payment-form');

paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // ป้องกันการส่งฟอร์มโดยตรง

    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const paymentSlip = document.getElementById('payment-slip').files[0];

    // ตรวจสอบข้อมูลที่กรอก
    if (!name || !address || !phone || !paymentSlip) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    // สร้าง FormData เพื่อส่งข้อมูลไปยังเซิร์ฟเวอร์
    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('paymentSlip', paymentSlip);

    try {
        const response = await fetch('/checkout', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
            alert('การชำระเงินเสร็จสมบูรณ์');
            window.location.href = '/order-history';  // ไปยังประวัติการสั่งซื้อ
        } else {
            alert('เกิดข้อผิดพลาดในการชำระเงิน');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
});
