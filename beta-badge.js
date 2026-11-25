(() => {
  if (!location.pathname.startsWith('/beta/')) return;

  if (!document.title.endsWith('(beta)')) {
    document.title = `${document.title} (beta)`;
  }

  document.querySelectorAll('h1, a').forEach((el) => {
    if (el.textContent && el.textContent.trim() === 'tsuzuura.com') {
      el.innerHTML =
        'tsuzuura.com <span style="font-size:0.55em;color:#b45309;vertical-align:middle;">(ver.β)</span>';
    }
  });
})();