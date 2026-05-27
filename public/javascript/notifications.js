const notifBtn = document.getElementById('notif-btn');
const notifDropdown = document.getElementById('notif-dropdown');
const notifList = document.getElementById('notif-list');

if (notifBtn) {
  notifBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (notifDropdown.style.display === 'none') {
      // วางใต้ navbar ไม่บังปุ่มบนขวา
      const navbar = document.querySelector('nav.navbar') || document.querySelector('.navbar');
      const navBottom = navbar ? navbar.getBoundingClientRect().bottom : notifBtn.getBoundingClientRect().bottom;
      const btnRect = notifBtn.getBoundingClientRect();
      notifDropdown.style.top   = (navBottom + 8) + 'px';
      notifDropdown.style.right = (window.innerWidth - btnRect.right) + 'px';
      notifDropdown.style.left  = 'auto';
      notifDropdown.style.display = 'block';
      fetch('/notifications')
        .then(r => r.json())
        .then(data => {
          if (!data.length) {
            notifList.innerHTML = '<div style="padding:12px 16px;color:#999;font-size:13px;">ไม่มีการแจ้งเตือน</div>';
            return;
          }
          notifList.innerHTML = data.map(n => `
            <div style="padding:10px 16px;border-bottom:1px solid #f5f5f5;font-size:13px;background:${n.is_read ? '#fff' : '#fff8e1'}">
              <div>${n.message}</div>
              <div style="color:#999;font-size:11px;margin-top:3px;">${new Date(n.created_at).toLocaleString('th-TH')}</div>
            </div>
          `).join('');
          // clear badge
          const badge = notifBtn.querySelector('.badge');
          if (badge) badge.remove();
        });
    } else {
      notifDropdown.style.display = 'none';
    }
  });

  document.addEventListener('click', function() {
    if (notifDropdown) notifDropdown.style.display = 'none';
  });

  notifDropdown && notifDropdown.addEventListener('click', e => e.stopPropagation());
}
