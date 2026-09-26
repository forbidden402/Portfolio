(function() {
  'use strict';

  /* ── 00. SCROLL RESTORATION & RELOAD HANDLING ────────── */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const navEntries = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
  const isReload = navEntries.length > 0 ? navEntries[0].type === 'reload' : (window.performance && performance.navigation && performance.navigation.type === 1);

  if (isReload) {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
  }

  /* ── 01. TYPEWRITER & SEQUENTIAL CASCADE ─────────────── */
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const whoamiEl = document.getElementById('whoami-text');
  const cursorEl = document.getElementById('whoami-cursor');
  const commandText = 'whoami';

  const revealSections = [
    document.getElementById('hero-body'),
    document.getElementById('about'),
    document.getElementById('education'),
    document.getElementById('skills'),
    document.getElementById('certs'),
    document.querySelector('.work-section'),
    document.getElementById('contact')
  ].filter(Boolean);

  let cascadeStarted = false;

  function revealAllImmediately() {
    cascadeStarted = true;
    revealSections.forEach(function(el) {
      el.classList.add('is-visible');
    });
    // Remove js-anim immediately so DOM is 100% native with zero transform or GPU layer overhead
    document.documentElement.classList.remove('js-anim');
  }

  function startWebsiteCascade() {
    if (cascadeStarted) return;
    cascadeStarted = true;

    // Stagger-reveal each section smoothly down the page
    const staggerStep = 90;
    revealSections.forEach(function(el, idx) {
      setTimeout(function() {
        el.classList.add('is-visible');
      }, idx * staggerStep);
    });

    // Once all sections are revealed, cleanly remove js-anim to free compositor memory
    const totalDuration = (revealSections.length * staggerStep) + 500;
    setTimeout(function() {
      document.documentElement.classList.remove('js-anim');
    }, totalDuration);
  }

  // Fast-scroll trigger: if visitor scrolls at all, immediately reveal and release DOM
  function handleEarlyScroll() {
    if (window.scrollY > 10) {
      revealAllImmediately();
      window.removeEventListener('scroll', handleEarlyScroll);
    }
  }
  window.addEventListener('scroll', handleEarlyScroll, { passive: true });

  // Safety net: ensure everything is visible even if background tab throttled
  setTimeout(revealAllImmediately, 2200);

  // Check if visitor arrived via anchor hash or already scrolled (ignore if reloading)
  const isScrolledOrAnchored = !isReload && Boolean(window.location.hash || window.scrollY > 20);

  if (prefersReducedMotion || isScrolledOrAnchored) {
    if (whoamiEl) whoamiEl.textContent = commandText;
    revealAllImmediately();
  } else if (whoamiEl) {
    whoamiEl.textContent = '';
    if (cursorEl) cursorEl.classList.remove('blink');

    let charIdx = 0;
    function typeNextChar() {
      if (charIdx < commandText.length) {
        whoamiEl.textContent += commandText.charAt(charIdx);
        charIdx++;
        const delay = Math.floor(Math.random() * 20) + 55;
        setTimeout(typeNextChar, delay);
      } else {
        if (cursorEl) cursorEl.classList.add('blink');
        setTimeout(startWebsiteCascade, 160);
      }
    }

    setTimeout(typeNextChar, 160);
  } else {
    revealAllImmediately();
  }


  /* ── 02. SIDEBAR / HAMBURGER LOGIC ───────────────────── */
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
    if (hamburgerBtn) {
      hamburgerBtn.classList.add('is-open');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      hamburgerBtn.setAttribute('aria-label', 'Go back');
    }
    document.body.style.overflow = 'hidden';
    sidebarCloseBtn && sidebarCloseBtn.focus();
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove('is-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      hamburgerBtn.setAttribute('aria-label', 'Open menu');
    }
    document.body.style.overflow = '';
    hamburgerBtn && hamburgerBtn.focus();
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function() {
      sidebar && sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
  }
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (overlay)         overlay.addEventListener('click', closeSidebar);

  // Close sidebar when a nav link is clicked
  if (sidebar) {
    sidebar.querySelectorAll('.sidebar-link').forEach(function(link) {
      link.addEventListener('click', closeSidebar);
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeSidebar();
    }
  });


  /* ── 03. SMOOTH ANCHOR SCROLLING (OFFSET FOR FIXED TOPBAR) ── */
  const brandLink = document.querySelector('.brand');
  if (brandLink) {
    brandLink.addEventListener('click', function(e) {
      e.preventDefault();
      closeSidebar();
      revealAllImmediately();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const hash = this.getAttribute('href');
      if (!hash || hash === '#') return;
      const targetEl = document.querySelector(hash);
      if (targetEl) {
        e.preventDefault();
        revealAllImmediately();
        const topbarEl = document.querySelector('.topbar');
        const topbarHeight = topbarEl ? topbarEl.getBoundingClientRect().height : 52;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: Math.max(0, targetPos - topbarHeight - 10),
          behavior: 'smooth'
        });
      }
    });
  });

  window.addEventListener('beforeunload', function() {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  });

})();
