function goToCheckout() {
    window.location.href = "/checkout";
}

// โหลดข้อมูลตะกร้าและอัปเดต UI ให้ตรงกับ cart.ejs
async function loadCart() {
    const cartList          = document.getElementById("cart-items-list");
    const totalPriceElement = document.getElementById("total-price");
    if (!cartList || !totalPriceElement) return;

    try {
        const response = await fetch('/cart/data');
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        if (data.cart.length === 0) {
            location.reload();
            return;
        }

        cartList.innerHTML = "";
        data.cart.forEach((item, index) => {
            cartList.innerHTML += `
                <div class="cart-item-card">
                    <img class="item-img"
                         src="${item.image || '/uploads/default.png'}"
                         onerror="this.src='/uploads/default.png'"
                         alt="${item.title}">
                    <div class="item-info">
                        <div class="item-title">${item.title}</div>
                        <p class="item-price">฿${Number(item.price).toLocaleString()}</p>
                    </div>
                    <div class="d-flex flex-column align-items-center gap-2">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateCart(${index}, 'decrease')">−</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateCart(${index}, 'increase')">+</button>
                        </div>
                        <button class="btn-remove" onclick="removeFromCart(${index})" title="ลบสินค้า">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </div>`;
        });

        totalPriceElement.textContent = `฿${Number(data.totalPrice).toLocaleString()}`;

        const countEl = document.getElementById("cart-item-count");
        if (countEl) countEl.textContent = `${data.cart.length} รายการ`;

    } catch (error) {
        console.error("Error loading cart:", error);
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
            showToast("เพิ่มสินค้าลงตะกร้าแล้ว!", "success");
            if (document.getElementById('cart-items-list')) loadCart();
        } else {
            showToast("เกิดข้อผิดพลาด: " + data.error, "error");
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
            loadCart();
        } else {
            showToast("เกิดข้อผิดพลาด: " + data.message, "error");
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
            showToast("ลบสินค้าออกจากตะกร้าแล้ว", "info");
            loadCart();
        } else {
            showToast("เกิดข้อผิดพลาด: " + data.message, "error");
        }
    } catch (error) {
        console.error("❌ Error removing item from cart:", error);
    }
}
