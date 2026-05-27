function showToast(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const navbar = document.querySelector('nav.navbar') || document.querySelector('.navbar');
    if (navbar) {
        container.style.top = (navbar.getBoundingClientRect().bottom + 8) + 'px';
    }

    const icons = {
        success: 'bi-check-circle-fill',
        error:   'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info:    'bi-info-circle-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="bi ${icons[type] || icons.info}"></i></div>
        <div class="toast-message">${message}</div>
        <button class="toast-close"><i class="bi bi-x"></i></button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    const timer = setTimeout(() => dismissToast(toast), duration);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timer);
        dismissToast(toast);
    });
}

function dismissToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
}
