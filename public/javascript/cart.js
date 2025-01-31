// เมื่อคลิกปุ่มเพิ่มตะกร้า
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const button = e.target;
        const id = button.getAttribute('data-id');
        const title = button.getAttribute('data-title');
        const price = parseFloat(button.getAttribute('data-price')); // ต้องแปลงราคาเป็นตัวเลข
        const image = button.getAttribute('data-image');

        // สร้างออบเจ็กต์สินค้าที่จะเพิ่มลงในตะกร้า
        const item = {
            id: id,
            title: title,
            price: price,
            image: image,
            quantity: 1 // ตั้งค่าเริ่มต้นเป็น 1
        };

        // รับข้อมูลตะกร้าจาก localStorage หรือใช้เป็น array ว่างถ้ายังไม่มีข้อมูล
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // ตรวจสอบว่ามีสินค้านี้อยู่ในตะกร้าหรือยัง
        const existingItem = cart.find(cartItem => cartItem.id === id);
        if (existingItem) {
            // ถ้ามีอยู่แล้ว ให้เพิ่มจำนวน
            existingItem.quantity += 1;
        } else {
            // ถ้าไม่มี ให้เพิ่มสินค้าใหม่
            cart.push(item);
        }

        // เก็บตะกร้าใหม่ลงใน localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // ตั้งค่าตะกร้าใน cookies
        document.cookie = `cart=${JSON.stringify(cart)}; path=/`;

        alert('เพิ่มสินค้าลงในตะกร้าเรียบร้อย!');
    });
});
