(function () {
    const KEY = 'nui-theme';

    function apply(dark) {
        document.documentElement.setAttribute('data-theme',    dark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
        const btn = document.getElementById('dark-mode-btn');
        if (btn) {
            btn.innerHTML = dark ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
            btn.title     = dark ? 'Light Mode' : 'Dark Mode';
        }
    }

    // Apply immediately (before first paint) to avoid flash
    const saved = localStorage.getItem(KEY);
    const sys   = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved !== null ? saved === 'dark' : sys);

    window.toggleDarkMode = function () {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        localStorage.setItem(KEY, isDark ? 'light' : 'dark');
        apply(!isDark);
    };

    // Sync button icon after DOM loads
    document.addEventListener('DOMContentLoaded', function () {
        apply(document.documentElement.getAttribute('data-theme') === 'dark');
    });
})();
