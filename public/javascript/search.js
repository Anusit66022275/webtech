function searchBooks() {
    const query = document.getElementById("search-input").value.trim();
    if (!query) return;

    fetch(`/search?q=${query}`)
        .then(res => res.json())
        .then(data => {
            const resultsContainer = document.getElementById("search-results-container");
            resultsContainer.innerHTML = ""; // ล้างข้อมูลเก่า

            if (data.results.length === 0) {
                resultsContainer.innerHTML = "<p class='text-muted'>❌ ไม่พบหนังสือที่ค้นหา</p>";
            } else {
                data.results.forEach(book => {
                    resultsContainer.innerHTML += `
                        <div class="col-md-4">
                            <div class="card">
                                <img src="${book.image}" class="card-img-top" alt="${book.title}">
                                <div class="card-body">
                                    <h5 class="card-title">${book.title}</h5>
                                    <p class="card-text">ราคา: ฿${book.price}</p>
                                    <a href="/book-details/${book.id}" class="btn btn-info">ดูรายละเอียด</a>
                                </div>
                            </div>
                        </div>`;
                });
            }

            // ✅ เปิด Modal เมื่อผลลัพธ์ค้นหามา
            let searchModal = new bootstrap.Modal(document.getElementById('searchModal'));
            searchModal.show();
        })
        .catch(err => console.error("❌ ค้นหาล้มเหลว:", err));
}
