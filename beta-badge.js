(() => {
  if (!location.pathname.startsWith('/beta/')) return;

  const label = 'ver.β';
  if (!document.title.endsWith(`(${label})`)) {
    document.title = `${document.title} (${label})`;
  }

  const badgeHtml = `<span style="display:inline-block;margin-left:6px;padding:2px 8px;font-size:0.45em;font-weight:700;line-height:1.3;color:#92400e;background:#fef3c7;border:1px solid #f59e0b;border-radius:999px;vertical-align:middle;">${label}</span>`;

  document.querySelectorAll('h1, a').forEach((el) => {
    if (!el.textContent || el.textContent.trim() !== 'tsuzuura.com') return;

    const link = el.tagName === 'A' ? el : el.querySelector('a');
    if (link) {
      link.setAttribute('href', '/beta/');
      link.innerHTML = `tsuzuura.com${badgeHtml}`;
    } else if (!el.closest('a')) {
      el.innerHTML = `<a href="/beta/" style="color:inherit;text-decoration:none;">tsuzuura.com</a>${badgeHtml}`;
    }
  });
})();