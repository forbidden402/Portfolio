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

  /* ── 01. TYPEWRITER & SMOOTH SCROLL REVEALS ─────────── */
  const whoamiEl = document.getElementById('whoami-text');
  const cursorEl = document.getElementById('whoami-cursor');
  const heroBodyEl = document.getElementById('hero-body');
  const animElements = document.querySelectorAll('.anim-reveal');
  const commandText = 'whoami';

  let whoamiFinished = false;
  let scrollObserver = null;

  function initScrollObserver() {
    if (scrollObserver) return;
    if ('IntersectionObserver' in window) {
      scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Remove is-visible when scrolling out so it reveals smoothly in both directions
            entry.target.classList.remove('is-visible');
          }
        });
      }, {
        root: null,
        threshold: 0.04,
        rootMargin: '10px 0px 10px 0px'
      });

      animElements.forEach(function(el) {
        scrollObserver.observe(el);
      });
    } else {
      animElements.forEach(function(el) {
        el.classList.add('is-visible');
      });
    }
  }

  function revealAfterWhoami() {
    if (whoamiFinished) return;
    whoamiFinished = true;

    if (cursorEl) cursorEl.classList.add('blink');

    // 1. Reveal hero content immediately after whoami completes typing
    if (heroBodyEl) {
      heroBodyEl.classList.add('is-visible');
    }

    // 2. If #about is in view at page load, reveal it with a gentle stagger
    const aboutEl = document.getElementById('about');
    if (aboutEl) {
      const rect = aboutEl.getBoundingClientRect();
      if (rect.top < window.innerHeight - 20) {
        setTimeout(function() {
          aboutEl.classList.add('is-visible');
        }, 140);
      }
    }

    // 3. Start observing for top-to-bottom and bottom-to-top scroll reveals
    setTimeout(initScrollObserver, 180);
  }

  function revealAllImmediately() {
    whoamiFinished = true;
    if (whoamiEl) whoamiEl.textContent = commandText;
    if (cursorEl) cursorEl.classList.add('blink');
    animElements.forEach(function(el) {
      el.classList.add('is-visible');
    });
    initScrollObserver();
  }

  // Handle early scroll: if user scrolls before whoami finishes, reveal immediately
  function onEarlyScroll() {
    if (!whoamiFinished) {
      if (whoamiEl) whoamiEl.textContent = commandText;
      revealAfterWhoami();
    }
    window.removeEventListener('scroll', onEarlyScroll);
  }
  window.addEventListener('scroll', onEarlyScroll, { passive: true, once: true });

  // Typewriter effect in Hero prompt
  if (whoamiEl) {
    whoamiEl.textContent = '';
    if (cursorEl) cursorEl.classList.remove('blink');

    // If page is loaded with an in-page anchor hash, reveal immediately without waiting
    if (window.location.hash) {
      revealAllImmediately();
    } else {
      let charIdx = 0;
      function typeNextChar() {
        if (whoamiFinished) return;
        if (charIdx < commandText.length) {
          whoamiEl.textContent += commandText.charAt(charIdx);
          charIdx++;
          const delay = Math.floor(Math.random() * 20) + 55;
          setTimeout(typeNextChar, delay);
        } else {
          // Finished typing whoami -> trigger smooth reveal!
          revealAfterWhoami();
        }
      }
      setTimeout(typeNextChar, 140);
    }
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


  /* ── 04. SCROLL PROGRESS INDICATOR ─────────────────────── */
  const scrollProgressLine = document.getElementById('scroll-progress-line');

  if (scrollProgressLine) {
    function updateScrollProgress() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );
      const winHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const scrollMax = Math.max(1, docHeight - winHeight);
      const progress = Math.min(100, Math.max(0, Math.round((scrollTop / scrollMax) * 100)));
      scrollProgressLine.style.width = progress + '%';
    }

    let scrollTicking = false;
    window.addEventListener('scroll', function() {
      if (!scrollTicking) {
        window.requestAnimationFrame(function() {
          updateScrollProgress();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    updateScrollProgress();
  }

})();

