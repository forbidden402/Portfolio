(function() {
  const modal = document.getElementById('detail-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalStatus = document.getElementById('modal-status');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close-btn');

  let activeTrigger = null;

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (activeTrigger) {
      activeTrigger.focus();
      activeTrigger = null;
    }
  }

  function openModal(btn) {
    const card = btn.closest('.proj');
    if (!card) return;
    const targetId = btn.getAttribute('data-target');
    const targetContent = document.getElementById(targetId);
    if (!targetContent) return;

    const titleEl = card.querySelector('.proj-title');
    const statusEl = card.querySelector('.proj-status');

    if (modalTitle) modalTitle.textContent = titleEl ? titleEl.textContent : '';
    if (modalStatus) {
      if (statusEl) {
        modalStatus.textContent = statusEl.textContent;
        modalStatus.style.display = 'inline-block';
      } else {
        modalStatus.style.display = 'none';
      }
    }
    if (modalBody) {
      modalBody.innerHTML = targetContent.innerHTML;
      modalBody.scrollTop = 0;
    }

    activeTrigger = btn;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  document.querySelectorAll('.toggle-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(btn);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
})();
