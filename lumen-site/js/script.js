(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     HEADER: always has a light backing; hides immediately on
     downward scroll and returns as soon as the user scrolls up.
     ========================================================= */
  (function headerBehavior() {
    var header = document.getElementById('header');
    if (!header) return;

    var lastScroll = window.pageYOffset;
    var ticking = false;

    function update() {
      var current = window.pageYOffset;
      var delta = current - lastScroll;

      header.classList.add('header--solid');

      if (current <= 12) {
        header.classList.remove('header--hidden');
      } else if (delta > 2) {
        header.classList.add('header--hidden');
      } else if (delta < -2) {
        header.classList.remove('header--hidden');
      }

      lastScroll = current;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  })();

  /* =========================================================
     BURGER MENU (mobile)
     ========================================================= */
  (function burgerMenu() {
    var burger = document.getElementById('burger');
    var nav = document.getElementById('nav');
    if (!burger || !nav) return;

    function close() {
      burger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
      nav.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-label', 'Открыть меню');
    }

    burger.addEventListener('click', function () {
      var isOpen = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = !isOpen ? 'hidden' : '';
      document.body.classList.toggle('menu-open', !isOpen);
      nav.setAttribute('aria-hidden', String(isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });
  })();

  /* =========================================================
     SMOOTH SCROLL to sections with header-offset
     ========================================================= */
  (function smoothScroll() {
    var header = document.getElementById('header');
    var links = document.querySelectorAll('[data-scroll]');

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        var headerH = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;

        window.scrollTo({
          top: top,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        history.pushState(null, '', href);
      });
    });
  })();

  /* =========================================================
     SWIPER: hero slider — 5 карточек, автопрокрутка 7с, цикл
     ========================================================= */
  var heroSwiperEl = document.querySelector('.hero-swiper');
  if (heroSwiperEl && window.Swiper) {
    new Swiper(heroSwiperEl, {
      loop: true,
      speed: 700,
      autoplay: {
        delay: 7000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      effect: 'fade',
      fadeEffect: { crossFade: true },
      navigation: {
        prevEl: '.hero-swiper .swiper-btn--prev',
        nextEl: '.hero-swiper .swiper-btn--next'
      },
      a11y: { enabled: true },
      keyboard: { enabled: true }
    });
  }

  /* =========================================================
     SWIPER: catalog — editorial slider, one full-height product
     composition per view, finite, left/right controls + dots.
     ========================================================= */
  var catalogSwiperEl = document.querySelector('.catalog-swiper');
  if (catalogSwiperEl && window.Swiper) {
    new Swiper(catalogSwiperEl, {
      loop: false,
      speed: 700,
      slidesPerView: 1,
      slidesPerGroup: 1,
      effect: 'slide',
      watchOverflow: true,
      navigation: {
        prevEl: '.catalog-prev',
        nextEl: '.catalog-next'
      },
      pagination: {
        el: '.catalog-pagination',
        clickable: true
      },
      a11y: { enabled: true },
      keyboard: { enabled: true }
    });
  }

  /* =========================================================
     SWIPER: reviews — карусель отзывов
     ========================================================= */
  var reviewsSwiperEl = document.querySelector('.reviews-swiper');
  if (reviewsSwiperEl && window.Swiper) {
    new Swiper(reviewsSwiperEl, {
      loop: true,
      speed: 600,
      slidesPerView: 1,
      spaceBetween: 24,
      autoplay: { delay: 5500, disableOnInteraction: false },
      pagination: { el: '.reviews-swiper__pagination', clickable: true },
      a11y: { enabled: true },
      breakpoints: {
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 3 }
      }
    });
  }

  /* =========================================================
     ACCORDION (FAQ)
     ========================================================= */
  (function accordion() {
    var items = document.querySelectorAll('.accordion__item');
    items.forEach(function (item) {
      var trigger = item.querySelector('.accordion__trigger');
      var panel = item.querySelector('.accordion__panel');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';

        items.forEach(function (other) {
          var otherTrigger = other.querySelector('.accordion__trigger');
          var otherPanel = other.querySelector('.accordion__panel');
          if (otherTrigger !== trigger) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherPanel.style.maxHeight = null;
          }
        });

        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
      });
    });
  })();

  /* =========================================================
     STATS COUNTER (about section), запускается при появлении
     ========================================================= */
  (function statsCounter() {
    var nums = document.querySelectorAll('.stats__num');
    if (!nums.length) return;

    function animateNum(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }
      var duration = 1400;
      var start = null;

      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateNum(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      nums.forEach(function (num) { observer.observe(num); });
    } else {
      nums.forEach(animateNum);
    }
  })();

  /* =========================================================
     SCROLL-TO-TOP BUTTON
     ========================================================= */
  (function toTop() {
    var btn = document.getElementById('toTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.pageYOffset > window.innerHeight);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  })();

  /* =========================================================
     NEWSLETTER FORM (демо, без бэкенда)
     ========================================================= */
  (function newsletterForm() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;
    var response = document.getElementById('newsletter-response');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('#newsletter-email');
      if (email && email.value) {
        response.textContent = 'Спасибо! Промокод отправлен на ' + email.value + '.';
        form.reset();
      }
    });
  })();


  /* =========================================================
     CONTACT FORM: field-level validation + mailto fallback.
     ========================================================= */
  (function contactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var response = document.getElementById('contact-response');
    var recipient = 'hello@lumen-clothing.ru';
    var name = document.getElementById('contact-name');
    var phone = document.getElementById('contact-phone');
    var email = document.getElementById('contact-email');
    var telegram = document.getElementById('contact-telegram');
    var message = document.getElementById('contact-message');
    var consent = document.getElementById('contact-consent');

    var fields = [name, phone, email, telegram];

    function errorEl(field) {
      return document.querySelector('[data-error-for="' + field.id + '"]');
    }

    function setError(field, text) {
      var wrap = field.closest('.contacts__field');
      var err = errorEl(field);
      if (wrap) wrap.classList.toggle('is-invalid', Boolean(text));
      if (wrap) wrap.classList.toggle('is-valid', !text && Boolean(field.value.trim()));
      field.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (err) err.textContent = text || '';
      return !text;
    }

    function normalizeTelegram(value) {
      var v = value.trim();
      if (!v) return '@';
      v = v.replace(/^@+/, '@').replace(/[^@a-zA-Z0-9_]/g, '');
      if (v.charAt(0) !== '@') v = '@' + v;
      return v.slice(0, 33);
    }

    function validateName() {
      var value = name.value.trim();
      if (!value) return setError(name, 'Введите имя.');
      if (value.length < 2) return setError(name, 'Имя должно содержать минимум 2 символа.');
      if (!/[A-Za-zА-Яа-яЁё]/.test(value)) return setError(name, 'Введите имя буквами.');
      return setError(name, '');
    }

    function validatePhone() {
      var value = phone.value.trim();
      if (!value || value === '+7') return setError(phone, 'Введите номер телефона.');
      if (!/^\+7\d{10}$/.test(value)) return setError(phone, 'Номер должен быть в формате +79991234567.');
      return setError(phone, '');
    }

    function validateEmail() {
      var value = email.value.trim();
      if (!value) return setError(email, '');
      if (value.length > 254) return setError(email, 'E-mail слишком длинный.');
      // Practical HTML5-style email validation: one @, no whitespace, valid local/domain parts.
      var emailRe = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
      if (!emailRe.test(value)) return setError(email, 'Введите корректный адрес, например name@example.ru.');
      return setError(email, '');
    }

    function validateTelegram() {
      var value = normalizeTelegram(telegram.value);
      telegram.value = value;
      if (value === '@') return setError(telegram, '');
      if (!/^@[A-Za-z0-9_]{5,32}$/.test(value)) return setError(telegram, 'Telegram должен быть в формате @username (5–32 символа).');
      return setError(telegram, '');
    }

    function validateContactChannel() {
      var emailValue = email.value.trim();
      var telegramValue = normalizeTelegram(telegram.value);
      telegram.value = telegramValue;

      var hasEmail = Boolean(emailValue);
      var hasTelegram = telegramValue !== '@';

      // Both fields are optional individually, but at least one contact channel is required.
      if (hasEmail || hasTelegram) {
        return true;
      }

      // Do not overwrite a more specific e-mail validation error.
      if (!email.value.trim() || email.getAttribute('aria-invalid') !== 'true') {
        setError(email, 'Укажите e-mail или Telegram.');
      }
      if (telegramValue === '@') {
        setError(telegram, 'Укажите e-mail или Telegram.');
      }
      return false;
    }

    function validateConsent() {
      var label = consent.closest('.contacts__consent');
      var err = document.getElementById('contact-consent-error');
      var invalid = !consent.checked;
      if (label) label.classList.toggle('is-invalid', invalid);
      if (err) err.textContent = invalid ? 'Подтвердите согласие на обработку данных.' : '';
      return !invalid;
    }

    // Phone: +7 is fixed; after it only digits are accepted.
    phone.addEventListener('focus', function () {
      if (!phone.value || !phone.value.startsWith('+7')) phone.value = '+7';
      requestAnimationFrame(function () { phone.setSelectionRange(phone.value.length, phone.value.length); });
    });
    phone.addEventListener('input', function () {
      var digits = phone.value.replace(/\D/g, '');
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (!digits.startsWith('7')) digits = '7' + digits;
      phone.value = '+' + digits.slice(0, 11);
      validatePhone();
    });
    phone.addEventListener('keydown', function (e) {
      var atPrefix = phone.selectionStart <= 2 && (e.key === 'Backspace' || e.key === 'Delete');
      if (atPrefix) e.preventDefault();
      if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
    });

    telegram.addEventListener('focus', function () {
      if (!telegram.value) telegram.value = '@';
      requestAnimationFrame(function () { telegram.setSelectionRange(telegram.value.length, telegram.value.length); });
    });
    telegram.addEventListener('input', validateTelegram);

    name.addEventListener('blur', validateName);
    phone.addEventListener('blur', validatePhone);
    email.addEventListener('blur', function () {
      validateEmail();
      if (email.value.trim() || telegram.value.trim() !== '@') {
        // Remove the conditional channel error once either channel is supplied.
        if (email.value.trim()) setError(email, '');
        if (telegram.value.trim() !== '@') setError(telegram, '');
      }
    });
    telegram.addEventListener('blur', function () {
      validateTelegram();
      if (email.value.trim() || telegram.value.trim() !== '@') {
        if (email.value.trim()) setError(email, '');
        if (telegram.value.trim() !== '@') setError(telegram, '');
      }
    });
    consent.addEventListener('change', validateConsent);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      response.textContent = '';

      var valid = [validateName(), validatePhone(), validateEmail(), validateTelegram(), validateContactChannel(), validateConsent()].every(Boolean);
      if (!valid) {
        response.textContent = 'Проверьте поля формы — подсказки показаны под незаполненными или неверными полями.';
        var firstInvalid = form.querySelector('.is-invalid input, .is-invalid textarea, input[aria-invalid="true"], textarea[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var body = [
        'Новая заявка с сайта LUMEN',
        '',
        'Имя: ' + name.value.trim(),
        'Телефон: ' + phone.value.trim(),
        'E-mail: ' + (email.value.trim() || 'не указан'),
        'Telegram: ' + (telegram.value.trim() === '@' ? 'не указан' : telegram.value.trim()),
        '',
        'Комментарий:',
        message.value.trim() || 'не указан'
      ].join('\n');

      var subject = 'Заявка с сайта LUMEN — ' + name.value.trim();
      window.location.href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      response.textContent = 'Форма проверена. Открываем почтовое приложение для отправки заявки.';
    });
  })();

  /* =========================================================
     FOOTER YEAR
     ========================================================= */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
