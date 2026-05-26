/* ========================================================
   Live Search — dropdown + keyboard nav + highlight
   ======================================================== */

const DEBOUNCE_MS = 280;
let debounceTimer   = null;
let activeIndex     = -1;
let currentResults  = [];
let dropdownEl      = null;

/* ── init: สร้าง dropdown และผูก event ── */
function initSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    const wrapper = input.closest('.search-bar');
    if (!wrapper) return;
    wrapper.style.position = 'relative';

    dropdownEl = document.createElement('div');
    dropdownEl.id = 'live-search-dropdown';
    wrapper.appendChild(dropdownEl);

    /* พิมพ์ → debounce → fetch */
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const q = input.value.trim();
        if (!q) { hideDropdown(); return; }
        showLoading();
        debounceTimer = setTimeout(() => fetchLive(q), DEBOUNCE_MS);
    });

    /* keyboard navigation */
    input.addEventListener('keydown', (e) => {
        const items = dropdownEl.querySelectorAll('.sr-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(Math.min(activeIndex + 1, items.length - 1), items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(Math.max(activeIndex - 1, 0), items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && currentResults[activeIndex]) {
                window.location.href = `/book-details/${currentResults[activeIndex].id}`;
            } else if (input.value.trim()) {
                goSearch(input.value.trim());
            }
        } else if (e.key === 'Escape') {
            hideDropdown();
            input.blur();
        }
    });

    /* ปิด dropdown เมื่อคลิกข้างนอก */
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) hideDropdown();
    });

    input.addEventListener('focus', () => {
        if (input.value.trim() && currentResults.length) showDropdown();
    });
}

/* ── fetch live results (max 7) ── */
function fetchLive(query) {
    fetch(`/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => {
            currentResults = (data.results || []).slice(0, 7);
            activeIndex = -1;
            renderDropdown(query, currentResults);
        })
        .catch(() => hideDropdown());
}

/* ── render dropdown ── */
function renderDropdown(query, results) {
    if (results.length === 0) {
        dropdownEl.innerHTML = `
            <div class="sr-empty">
                <i class="bi bi-search"></i>
                ไม่พบ "<strong>${escHtml(query)}</strong>"
            </div>`;
        showDropdown();
        return;
    }

    const items = results.map((book, i) => {
        const img = book.image || '/uploads/default.png';
        return `
        <a href="/book-details/${book.id}" class="sr-item" data-index="${i}">
            <img src="${escHtml(img)}" alt="" onerror="this.src='/uploads/default.png'">
            <div class="sr-info">
                <div class="sr-title">${highlight(book.title, query)}</div>
                <div class="sr-genre">${highlight(book.genre || '', query)}</div>
            </div>
            <div class="sr-price">฿${Number(book.price).toLocaleString()}</div>
        </a>`;
    }).join('');

    const footer = `
        <a class="sr-footer" href="/Book?search=${encodeURIComponent(query)}">
            <i class="bi bi-grid me-1"></i>ดูผลการค้นหาทั้งหมด
            <i class="bi bi-arrow-right ms-1"></i>
        </a>`;

    dropdownEl.innerHTML = items + footer;
    showDropdown();

    /* hover → update activeIndex */
    dropdownEl.querySelectorAll('.sr-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            clearActive();
            activeIndex = parseInt(el.dataset.index);
            el.classList.add('active');
        });
        el.addEventListener('mouseleave', () => el.classList.remove('active'));
    });
}

/* ── keyboard active state ── */
function setActive(idx, items) {
    clearActive();
    activeIndex = idx;
    if (items[idx]) {
        items[idx].classList.add('active');
        items[idx].scrollIntoView({ block: 'nearest' });
    }
}
function clearActive() {
    dropdownEl.querySelectorAll('.sr-item.active').forEach(el => el.classList.remove('active'));
}

/* ── loading indicator ── */
function showLoading() {
    dropdownEl.innerHTML = `<div class="sr-loading"><span class="sr-spinner"></span>กำลังค้นหา...</div>`;
    showDropdown();
}

/* ── show/hide ── */
function showDropdown() { dropdownEl.classList.add('open'); }
function hideDropdown() {
    dropdownEl.classList.remove('open');
    activeIndex = -1;
}

/* ── highlight matching text ── */
function highlight(text, query) {
    if (!query || !text) return escHtml(text);
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escHtml(text).replace(
        new RegExp(`(${safe})`, 'gi'),
        '<mark>$1</mark>'
    );
}

/* ── escape HTML ── */
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ── navigate to search page ── */
function goSearch(q) {
    if (!q) q = (document.getElementById('search-input') || {}).value || '';
    if (q.trim()) window.location.href = `/Book?search=${encodeURIComponent(q.trim())}`;
}

/* ── legacy button onclick ── */
function searchBooks() {
    const input = document.getElementById('search-input');
    goSearch(input ? input.value : '');
}

/* ── boot ── */
document.addEventListener('DOMContentLoaded', initSearch);
