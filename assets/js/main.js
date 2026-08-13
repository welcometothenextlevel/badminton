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
     Programs dropdown (desktop)
     CSS handles hover and :focus-within. This adds click/tap
     toggling, Escape to close and click-outside to close, and
     keeps aria-expanded truthful.
     ----------------------------------------------------------- */
  var subItem   = document.querySelector('.nav__item--sub');
  var subToggle = subItem && subItem.querySelector('.nav__toggle');

  function closeSub() {
    if (!subItem) return;
    subItem.classList.remove('is-open');
    subToggle.setAttribute('aria-expanded', 'false');
  }

  if (subItem && subToggle) {
    subToggle.addEventListener('click', function (e) {
      e.preventDefault();
      var open = subItem.classList.toggle('is-open');
      subToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // hovering is the primary desktop affordance; keep the flag in sync
    subItem.addEventListener('mouseenter', function () {
      subToggle.setAttribute('aria-expanded', 'true');
    });
    subItem.addEventListener('mouseleave', function () {
      if (!subItem.classList.contains('is-open')) {
        subToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', function (e) {
      if (!subItem.contains(e.target)) closeSub();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (subItem.classList.contains('is-open') || subItem.contains(document.activeElement)) {
        closeSub();
        subToggle.focus();
      }
    });
  }

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
     ENQUIRY DELIVERY — Web3Forms
     ===========================================================
     Enquiries POST to Web3Forms, which emails them to the address
     registered against the access key.

     The access key lives in each form's own hidden input, not here,
     so there is exactly one place per form to change it. FormData
     picks it up along with everything else.

     If the POST fails for any reason the enquiry is not lost: the
     error state offers the phone number and a pre-filled WhatsApp
     message instead.
     ----------------------------------------------------------- */
  var FORM_ENDPOINT   = 'https://api.web3forms.com/submit';
  var WHATSAPP_NUMBER = '61421609179';
  var CONTACT_EMAIL   = '';

  function fieldLabel(form, field) {
    var lbl = form.querySelector('label[for="' + field.id + '"]');
    return lbl ? lbl.textContent.replace('*', '').trim() : (field.name || field.id);
  }

  /* Visible, user-entered fields only. Hidden plumbing (access_key,
     subject, from_name) and the honeypot must never end up in the
     WhatsApp fallback message. */
  function collect(form) {
    var out = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit' || el.type === 'hidden' ||
          el.type === 'checkbox' || el.name.charAt(0) === '_') return;
      if (!el.value.trim()) return;
      out.push({ key: el.name, label: fieldLabel(form, el), value: el.value.trim() });
    });
    return out;
  }

  function toWhatsAppUrl(form, heading) {
    var lines = [heading, ''];
    collect(form).forEach(function (f) { lines.push(f.label + ': ' + f.value); });
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function validate(form, status) {
    var name  = form.elements.name;
    var email = form.elements.email;
    var problems = [];

    [name, email].forEach(function (f) { if (f) f.removeAttribute('aria-invalid'); });

    if (name && !name.value.trim()) {
      problems.push('your name');
      name.setAttribute('aria-invalid', 'true');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      problems.push('a valid email address');
      email.setAttribute('aria-invalid', 'true');
    }

    if (problems.length) {
      status.className = 'form__status is-error';
      status.textContent = 'Please add ' + problems.join(' and ') + '.';
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return false;
    }
    return true;
  }

  function wireForm(formId, statusId, heading, successText) {
    var form   = document.getElementById(formId);
    var status = document.getElementById(statusId);
    if (!form || !status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form, status)) return;

      var firstName = (form.elements.name.value.trim().split(' ')[0]) || 'there';
      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn ? btn.textContent : '';

      // 1. A real endpoint is configured — POST it.
      if (FORM_ENDPOINT) {
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        status.className = 'form__status';
        status.textContent = 'Sending…';

        /* access_key, subject and from_name are hidden inputs on the form,
           so FormData already carries them. Nothing to append here. */
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        }).then(function (res) {
          return res.json().catch(function () { return {}; })
            .then(function (body) {
              // Web3Forms answers with { success: true|false, message: "..." }
              if (!res.ok || !body || body.success !== true) {
                throw new Error((body && body.message) || ('HTTP ' + res.status));
              }
              return body;
            });
        }).then(function () {
          status.className = 'form__status is-ok';
          status.textContent = 'Thanks ' + firstName + ' — ' + successText;
          form.reset();
        }).catch(function () {
          status.className = 'form__status is-error';
          status.innerHTML = 'Sorry, that didn’t send. Please call ' +
            '<a href="tel:+61426620274">0426 620 274</a> or ' +
            '<a href="' + toWhatsAppUrl(form, heading) + '" target="_blank" rel="noopener">send it on WhatsApp instead</a>.';
        }).then(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
        });
        return;
      }

      // 2. No endpoint yet — hand the enquiry to WhatsApp so it still arrives.
      var waUrl = toWhatsAppUrl(form, heading);
      var win = window.open(waUrl, '_blank', 'noopener');

      status.className = 'form__status is-ok';
      if (win) {
        status.innerHTML = 'Thanks ' + firstName + ' — your details are ready to send in WhatsApp. ' +
          'Just hit send there and we’ll come back to you.';
      } else {
        status.innerHTML = 'Almost there — ' +
          '<a href="' + waUrl + '" target="_blank" rel="noopener">tap here to send your enquiry</a>' +
          (CONTACT_EMAIL ? ' or email <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>' : '') + '.';
      }
    });
  }

  wireForm(
    'interestForm', 'formStatus',
    'New enquiry from the Everest Badminton Centre website',
    'you’re on the list. We’ll be in touch with opening dates and founding member offers.'
  );

  wireForm(
    'bookingForm', 'bookingStatus',
    'New court booking request from the Everest Badminton Centre website',
    'we’ve got your request and will come back to you as soon as the booking sheet opens.'
  );

  /* -----------------------------------------------------------
     Footer year
     ----------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

})();
