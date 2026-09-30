(function() {
  'use strict';

  // Mark loader as JS-controlled immediately so CSS fallback animation is neutralized
  document.documentElement.classList.add('js-loader-active');

  // 1. Create Top Cyber Progress Bar if not present
  let topBar = document.getElementById('top-loader-bar');
  if (!topBar) {
    topBar = document.createElement('div');
    topBar.id = 'top-loader-bar';
    topBar.className = 'top-loader-bar';
    document.body.prepend(topBar);
  }

  // Trigger top bar fill on page load
  requestAnimationFrame(function() {
    topBar.style.width = '100%';
    setTimeout(function() {
      topBar.style.opacity = '0';
      setTimeout(function() {
        topBar.style.width = '0%';
      }, 350);
    }, 280);
  });

  // 2. Handle Case Study Preloader Overlay (if present on page)
  const overlay = document.getElementById('page-loader');
  const fillBar = document.getElementById('loader-progress-bar');
  const statusTxt = document.getElementById('loader-status-text');
  const pctTxt = document.getElementById('loader-pct-text');

  if (overlay) {
    if (fillBar) fillBar.style.width = '0%';

    setTimeout(function() {
      if (fillBar) fillBar.style.width = '65%';
      if (pctTxt) pctTxt.textContent = '65%';
    }, 80);

    setTimeout(function() {
      if (fillBar) fillBar.style.width = '100%';
      if (pctTxt) pctTxt.textContent = '100%';
      if (statusTxt) statusTxt.textContent = 'STATUS: 200 OK · DOSSIER MOUNTED';
    }, 240);

    setTimeout(function() {
      overlay.classList.add('fade-out');
      setTimeout(function() {
        overlay.style.display = 'none';
      }, 350);
    }, 380);
  }

  // 3. Attach click listener to internal navigation links for instant loading feedback
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Ignore in-page hash anchors (#), external targets, mailto, tel
    if (href.startsWith('#') || link.target === '_blank' || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      const targetUrl = new URL(link.href, window.location.origin);
      if (targetUrl.origin === window.location.origin && (targetUrl.pathname !== window.location.pathname || targetUrl.hash !== window.location.hash)) {
        topBar.style.opacity = '1';
        topBar.style.width = '75%';
      }
    } catch (_) {}
  });

  // 4. Handle BFCache (Back/Forward Cache) restoration
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      if (topBar) {
        topBar.style.width = '0%';
        topBar.style.opacity = '0';
      }
      if (overlay) {
        overlay.style.display = 'none';
      }
    }
  });

  // 5. Scroll Progress Line for Case Studies
  function initScrollProgress() {
    const scrollProgressLine = document.getElementById('scroll-progress-line');
    if (!scrollProgressLine) return;

    function updateProgress() {
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

    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    updateProgress();
  }

  // 6. Smooth On-Scroll Reveal for Case Studies (Bi-directional)
  function initCaseStudyReveals() {
    const targets = document.querySelectorAll('.cs-sec, .attr-grid');
    if (!targets.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Reset when leaving viewport so it reveals again in both directions
            entry.target.classList.remove('is-visible');
          }
        });
      }, {
        root: null,
        threshold: 0.04,
        rootMargin: '10px 0px 10px 0px'
      });

      // Initial stagger for top elements in viewport
      let stagger = 0;
      targets.forEach(function(el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 20) {
          setTimeout(function() {
            el.classList.add('is-visible');
          }, stagger * 80 + 100);
          stagger++;
        }
        observer.observe(el);
      });
    } else {
      targets.forEach(function(el) {
        el.classList.add('is-visible');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initScrollProgress();
      initCaseStudyReveals();
    });
  } else {
    initScrollProgress();
    initCaseStudyReveals();
  }
})();
