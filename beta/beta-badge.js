(() => {
  if (!location.pathname.startsWith('/beta/')) return;

  const label = 'ver.β';
  if (!document.title.endsWith(`(${label})`)) {
    document.title = `${document.title} (${label})`;
  }

  document.querySelectorAll('h1, a').forEach((el) => {
    if (el.textContent && el.textContent.trim() === 'tsuzuura.com') {
      el.innerHTML = `tsuzuura.com <span style="display:inline-block;margin-left:6px;padding:2px 8px;font-size:0.45em;font-weight:700;line-height:1.3;color:#92400e;background:#fef3c7;border:1px solid #f59e0b;border-radius:999px;vertical-align:middle;">${label}</span>`;
    }
  });
})();