(() => {
  const backdrop = document.querySelector('[data-ll-dialog-backdrop]');
  const dialog = backdrop?.querySelector('[role="dialog"]');
  const openButton = document.querySelector('[data-ll-dialog-open]');
  const closeButtons = [...(backdrop?.querySelectorAll('[data-ll-dialog-close],[data-ll-dialog-confirm]') || [])];
  let previousFocus = null;
  const focusable = () => [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')];
  const close = () => { if (!backdrop?.classList.contains('open')) return; backdrop.classList.remove('open'); previousFocus?.focus(); };
  openButton?.addEventListener('click', () => { previousFocus = document.activeElement; backdrop.classList.add('open'); (focusable()[0] || dialog).focus(); });
  closeButtons.forEach(button => button.addEventListener('click', close));
  backdrop?.addEventListener('click', event => { if (event.target === backdrop) close(); });
  document.addEventListener('keydown', event => {
    if (!backdrop?.classList.contains('open')) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const items = focusable(); if (!items.length) { event.preventDefault(); dialog.focus(); return; }
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.querySelector('#showFeedback')?.addEventListener('click', () => { const feedback = document.querySelector('#feedback'); feedback.hidden = false; });
  document.querySelector('#demoForm')?.addEventListener('submit', event => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const message = document.querySelector('#formMessage');
    message.textContent = data.get('project')?.trim() ? '本地校验完成；没有提交到服务器。' : '请填写项目名称。'; message.hidden = false;
  });
})();
