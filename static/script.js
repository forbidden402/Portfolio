(function() {

  /* ── MODAL LOGIC ─────────────────────────────────────── */
  const modal       = document.getElementById('detail-modal');
  const modalTitle  = document.getElementById('modal-title');
  const modalStatus = document.getElementById('modal-status');
  const modalBody   = document.getElementById('modal-body');
  const closeBtn    = document.getElementById('modal-close-btn');

  let activeTrigger = null;

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (activeTrigger) { activeTrigger.focus(); activeTrigger = null; }
  }

  function openModal(btn) {
    const card = btn.closest('.proj');
    if (!card) return;
    const targetContent = document.getElementById(btn.getAttribute('data-target'));
    if (!targetContent) return;

    const titleEl  = card.querySelector('.proj-title');
    const statusEl = card.querySelector('.proj-status');

    if (modalTitle)  modalTitle.textContent = titleEl ? titleEl.textContent : '';
    if (modalStatus) {
      if (statusEl) {
        modalStatus.textContent   = statusEl.textContent;
        modalStatus.style.display = 'inline-block';
      } else {
        modalStatus.style.display = 'none';
      }
    }
    if (modalBody) { modalBody.innerHTML = targetContent.innerHTML; modalBody.scrollTop = 0; }

    activeTrigger = btn;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  document.querySelectorAll('.toggle-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) { e.preventDefault(); openModal(btn); });
  });

  if (closeBtn) closeBtn.addEventListener('click', function(e) { e.preventDefault(); closeModal(); });

  if (modal) modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('active')) closeModal();
      else closeSidebar();
    }
  });


  /* ── SIDEBAR / HAMBURGER LOGIC ───────────────────────── */
  const sidebar        = document.getElementById('sidebar');
  const overlay        = document.getElementById('sidebar-overlay');
  const hamburgerBtn   = document.getElementById('hamburger-btn');
  const sidebarCloseBtn= document.getElementById('sidebar-close');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    hamburgerBtn && hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    sidebarCloseBtn && sidebarCloseBtn.focus();
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    hamburgerBtn && hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburgerBtn && hamburgerBtn.focus();
  }

  if (hamburgerBtn)    hamburgerBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (overlay)         overlay.addEventListener('click', closeSidebar);

  // Close sidebar when a nav link is clicked
  if (sidebar) {
    sidebar.querySelectorAll('.sidebar-link').forEach(function(link) {
      link.addEventListener('click', closeSidebar);
    });
  }

})();
