
// checkout.js
function loadCartOnCheckout() {
    fetch('/cart')
        .then(response => response.json())
        .then(cart => {
            updateCheckoutUI(cart);
        })
        .catch(error => console.error("Error fetching cart:", error));
}

function updateCheckoutUI(cart) {
    const cartDetails = document.getElementById("cart-details");
    let total = 0;

    cartDetails.innerHTML = "";
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartDetails.innerHTML += `
            <li>${item.title} - ${item.quantity} ชิ้น - ฿${item.price * item.quantity}</li>
        `;
    });
    document.getElementById("total-price").innerText = `รวมทั้งหมด: ${total} บาท`;
}

document.addEventListener("DOMContentLoaded", loadCartOnCheckout);

function submitOrder() {
    fetch('/cart')
        .then(response => response.json())
        .then(cart => {
            let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            
            const name = document.getElementById("name").value;
            const address = document.getElementById("address").value;
            const phone_number = document.getElementById("phone").value;
            const paymentSlip = document.getElementById("payment-slip").files[0];

            if (!name || !address || !phone_number || !paymentSlip) {
                alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
                return;
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("address", address);
            formData.append("phone", phone_number);
            formData.append("paymentSlip", paymentSlip);
            formData.append("totalPrice", total);

            fetch("/checkout", {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("สั่งซื้อสำเร็จ! ขอบคุณสำหรับการซื้อสินค้า");
                    window.location.href = "/order-history";
                } else {
                    alert("เกิดข้อผิดพลาด: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
            });
        })
        .catch(error => console.error("Error fetching cart:", error));
}
