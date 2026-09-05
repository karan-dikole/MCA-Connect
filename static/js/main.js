// MCA Connect Interactive Client Script

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Switcher (Dark / Light)
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  const savedTheme = localStorage.getItem('mca_connect_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('mca_connect_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.textContent = '🌙';
    } else {
      themeIcon.textContent = '☀️';
    }
  }

  // 2. User Profile Dropdown
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');

  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
    });
  }

  // 3. Auto-Dismiss Alert Messages
  const alerts = document.querySelectorAll('.messages-container .alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transform = 'translateX(50px)';
      alert.style.transition = 'all 0.4s ease';
      setTimeout(() => alert.remove(), 400);
    }, 4500);
  });

  // 4. AJAX Upvotes & Likes Handler
  const ajaxButtons = document.querySelectorAll('.ajax-action-btn');
  ajaxButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = btn.getAttribute('data-url');
      if (!url) return;

      try {
        const response = await fetch(url, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.count !== undefined) {
            const countSpan = btn.querySelector('.count-val');
            if (countSpan) countSpan.textContent = data.count;
          }
          if (data.upvoted !== undefined || data.liked !== undefined || data.bookmarked !== undefined) {
            btn.classList.toggle('active');
          }
        }
      } catch (err) {
        console.error('Action failed:', err);
      }
    });
  });

  // 5. Code Block Copy to Clipboard
  const codeBlocks = document.querySelectorAll('pre');
  codeBlocks.forEach(pre => {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-secondary';
    copyBtn.style.position = 'absolute';
    copyBtn.style.top = '0.5rem';
    copyBtn.style.right = '0.5rem';
    copyBtn.style.padding = '0.2rem 0.6rem';
    copyBtn.style.fontSize = '0.75rem';
    copyBtn.innerHTML = '📋 Copy';

    pre.style.position = 'relative';
    pre.appendChild(copyBtn);

    copyBtn.addEventListener('click', () => {
      const code = pre.querySelector('code') ? pre.querySelector('code').innerText : pre.innerText;
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.innerHTML = '✅ Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '📋 Copy';
        }, 2000);
      });
    });
  });
});
