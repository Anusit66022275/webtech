document.addEventListener('DOMContentLoaded', () => {
  // สร้าง loader overlay
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.innerHTML = '<div class="loader-spinner"></div>';
  document.body.appendChild(loader);

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');

    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('javascript') ||
      href.startsWith('mailto') ||
      link.getAttribute('target') === '_blank' ||
      link.hasAttribute('data-bs-toggle') ||
      link.hasAttribute('data-bs-dismiss')
    ) return;

    link.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      loader.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 150);
    });
  });
});
