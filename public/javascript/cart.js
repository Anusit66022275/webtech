function goToCheckout() {
    window.location.href = "/checkout";
}

// ✅ โหลดข้อมูลตะกร้าและอัปเดต UI
async function loadCart() {
    try {
        console.log("🚀 กำลังโหลดตะกร้าสินค้า...");

        const response = await fetch('/cart/data');
        if (!response.ok) throw new Error(`❌ HTTP Error: ${response.status}`);

        const data = await response.json();
        console.log("📦 ตะกร้าสินค้า:", data);

        const cartList = document.getElementById("cart-items-list");
        const totalPriceElement = document.getElementById("total-price");

        if (!cartList || !totalPriceElement) {
            console.error("❌ Error: ไม่พบ cart-items-list หรือ total-price ใน DOM");
            return;
        }

        // ล้างตะกร้าก่อนโหลดข้อมูลใหม่
        cartList.innerHTML = "";
        let total = 0;

        if (data.cart.length === 0) {
            cartList.innerHTML = "<li class='list-group-item text-center'>ไม่มีสินค้าในตะกร้า</li>";
        }

        data.cart.forEach((item, index) => {
            total += item.price * item.quantity;

            cartList.innerHTML += `
                <li class="list-group-item d-flex align-items-center">
                    <img src="${item.image}" 
                         onerror="this.onerror=null; this.src='/uploads/default.png';" 
                         style="width: 50px; height: 50px; margin-right: 10px;">
                    <div>
                        <h5>${item.title}</h5>
                        <p>${item.price} บาท</p>
                    </div>
                    <div class="ms-auto">
                        <button class="btn btn-secondary decrease-btn" onclick="updateCart(${index}, 'decrease')">➖</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="btn btn-secondary increase-btn" onclick="updateCart(${index}, 'increase')">➕</button>
                        <button class="btn btn-danger ms-2 remove-item" onclick="removeFromCart(${index})">❌</button>
                    </div>
                </li>`;
        });

        totalPriceElement.innerText = `${total.toLocaleString()} บาท`;

    } catch (error) {
        console.error("❌ Error loading cart:", error);
    }
}

// ✅ ฟังก์ชันเพิ่มสินค้าเข้าตะกร้า
async function addToCart(bookId, title, price, image) {
    try {
        console.log("🛒 กำลังเพิ่มลงตะกร้า:", { bookId, title, price, image });

        const response = await fetch('/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: bookId, title, price, quantity: 1, image })
        });

        const data = await response.json();
        if (data.success) {
            console.log("✅ สินค้าถูกเพิ่มลงในตะกร้าแล้ว!");
            alert("สินค้าถูกเพิ่มลงในตะกร้าแล้ว!");
            loadCart(); // โหลดตะกร้าใหม่
        } else {
            alert("เกิดข้อผิดพลาด: " + data.error);
        }
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
    }
}

// ✅ ฟังก์ชันอัปเดตจำนวนสินค้าในตะกร้า
async function updateCart(index, action) {
    try {
        console.log(`🔄 กำลังอัปเดตสินค้า index: ${index}, action: ${action}`);

        const response = await fetch('/cart/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ index, action })
        });

        const data = await response.json();
        if (data.success) {
            console.log("✅ อัปเดตสินค้าเรียบร้อย!");
            loadCart();
        } else {
            alert("เกิดข้อผิดพลาด: " + data.message);
        }
    } catch (error) {
        console.error("❌ Error updating cart:", error);
    }
}

// ✅ ฟังก์ชันลบสินค้าออกจากตะกร้า
async function removeFromCart(index) {
    try {
        console.log(`🗑️ กำลังลบสินค้า index: ${index}`);

        const response = await fetch('/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ index })
        });

        const data = await response.json();
        if (data.success) {
            console.log("✅ ลบสินค้าเรียบร้อย!");
            loadCart();
        } else {
            alert("เกิดข้อผิดพลาด: " + data.message);
        }
    } catch (error) {
        console.error("❌ Error removing item from cart:", error);
    }
}
