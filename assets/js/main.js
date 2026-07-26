/* =============================================================
   Everest Badminton Centre — sample homepage
   Vanilla JS. No dependencies.
   ============================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     Sticky header: transparent over the hero, solid on scroll
     ----------------------------------------------------------- */
  var header = document.getElementById('siteHeader');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 40);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* -----------------------------------------------------------
     Mobile overlay menu
     ----------------------------------------------------------- */
  var burger  = document.getElementById('burger');
  var overlay = document.getElementById('overlay');

  function openMenu() {
    overlay.hidden = false;
    // next frame so the opacity transition actually runs
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('is-locked');
    header.classList.add('is-solid');
  }

  function closeMenu() {
    overlay.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-locked');
    updateHeader();

    if (reduceMotion) {
      overlay.hidden = true;
    } else {
      window.setTimeout(function () {
        if (!overlay.classList.contains('is-open')) overlay.hidden = true;
      }, 300);
    }
  }

  if (burger && overlay) {
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') closeMenu();
      else openMenu();
    });

    // Close after tapping any link in the overlay
    overlay.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        burger.focus();
      }
    });

    // Drop back to the desktop nav if the viewport grows while open
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (e) {
      if (e.matches && burger.getAttribute('aria-expanded') === 'true') closeMenu();
    });
  }

  /* -----------------------------------------------------------
     Scroll reveal — fade and rise
     ----------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* -----------------------------------------------------------
     Animated count-up for the stats strip
     ----------------------------------------------------------- */
  var counters = document.querySelectorAll('.count');

  function runCount(el) {
    var target = parseInt(el.getAttribute('data-to'), 10) || 0;

    if (reduceMotion || target === 0) {
      el.textContent = String(target);
      return;
    }

    var duration = 1400;
    var start = null;

    function step(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      // easeOutExpo — fast then settles, no bounce
      var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-to'); });
    } else {
      var countObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.6 });

      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* -----------------------------------------------------------
     Active nav link based on the section in view
     ----------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__list a[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* -----------------------------------------------------------
     Register-your-interest form
     Sample only — no backend. Validates, then confirms inline.
     Wire the submit handler to a real endpoint before launch.
     ----------------------------------------------------------- */
  var form   = document.getElementById('interestForm');
  var status = document.getElementById('formStatus');

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name  = form.elements.name;
      var email = form.elements.email;
      var problems = [];

      [name, email].forEach(function (field) { field.removeAttribute('aria-invalid'); });

      if (!name.value.trim()) {
        problems.push('your name');
        name.setAttribute('aria-invalid', 'true');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        problems.push('a valid email address');
        email.setAttribute('aria-invalid', 'true');
      }

      if (problems.length) {
        status.className = 'form__status is-error';
        status.textContent = 'Please add ' + problems.join(' and ') + '.';
        (problems.length === 2 ? name : document.querySelector('[aria-invalid="true"]')).focus();
        return;
      }

      status.className = 'form__status is-ok';
      status.textContent = 'Thanks ' + name.value.trim().split(' ')[0] +
        ' — you’re on the list. We’ll be in touch with opening dates and founding member offers.';
      form.reset();
    });
  }

  /* -----------------------------------------------------------
     Footer year
     ----------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

})();
