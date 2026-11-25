(() => {
  if (!location.pathname.startsWith('/beta/')) return;

  const label = 'ver.β';
  if (!document.title.endsWith(`(${label})`)) {
    document.title = `${document.title} (${label})`;
  }

  const createBadge = () => {
    const badge = document.createElement('span');
    badge.textContent = label;
    badge.setAttribute('aria-hidden', 'true');
    badge.style.cssText = [
      'display:inline-block',
      'margin-left:6px',
      'padding:2px 8px',
      'font-size:0.45em',
      'font-weight:700',
      'line-height:1.3',
      'color:#92400e',
      'background:#fef3c7',
      'border:1px solid #f59e0b',
      'border-radius:999px',
      'vertical-align:middle',
    ].join(';');
    return badge;
  };

  const targets = Array.from(document.querySelectorAll('h1, a')).filter(
    (el) => el.textContent && el.textContent.trim() === 'tsuzuura.com'
  );

  targets.forEach((el) => {
    // すでにバッジ付与済みならスキップ
    if (el.querySelector('[data-beta-badge="true"]')) return;

    const existingLink = el.tagName === 'A' ? el : el.querySelector('a');
    const badge = createBadge();
    badge.dataset.betaBadge = 'true';

    if (existingLink) {
      existingLink.setAttribute('href', '/beta/');
      existingLink.appendChild(badge);
    } else if (!el.closest('a')) {
      const link = document.createElement('a');
      link.href = '/beta/';
      link.textContent = 'tsuzuura.com';
      link.style.color = 'inherit';
      link.style.textDecoration = 'none';
      el.textContent = '';
      el.appendChild(link);
      el.appendChild(badge);
    }
  });
})();