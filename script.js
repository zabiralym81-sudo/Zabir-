const header = document.getElementById('site-header');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuQuery = window.matchMedia('(min-width: 981px)');

function syncHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
}

function openMenu() {
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Закрыть меню');
  mobileMenu.hidden = false;
  document.body.classList.add('menu-open');
}

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

menuToggle.addEventListener('click', () => {
  if (menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
  } else {
    openMenu();
  }
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileMenu.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});

document.addEventListener('click', (event) => {
  if (!mobileMenu.hidden && !header.contains(event.target)) {
    closeMenu();
  }
});

mobileMenuQuery.addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});

const tabs = Array.from(document.querySelectorAll('.tab'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

function activateTab(tab) {
  tabs.forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-selected', String(isActive));
    item.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    panel.hidden = panel.id !== `panel-${tab.dataset.tab}`;
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = tabs[(tabs.indexOf(tab) + direction + tabs.length) % tabs.length];
    nextTab.focus();
    activateTab(nextTab);
  });
});

document.querySelectorAll('[data-tab-link]').forEach((link) => {
  link.addEventListener('click', () => {
    const tab = document.getElementById(`tab-${link.dataset.tabLink}`);
    if (tab) activateTab(tab);
  });
});

const faqItems = Array.from(document.querySelectorAll('.faq-item'));

faqItems.forEach((item) => {
  const trigger = item.querySelector('.faq-trigger');
  const panel = item.querySelector('.faq-panel');
  panel.setAttribute('aria-hidden', String(!item.classList.contains('is-open')));

  trigger.addEventListener('click', () => {
    const shouldOpen = !item.classList.contains('is-open');

    faqItems.forEach((other) => {
      const isOpen = other === item && shouldOpen;
      other.classList.toggle('is-open', isOpen);
      other.querySelector('.faq-trigger').setAttribute('aria-expanded', String(isOpen));
      other.querySelector('.faq-panel').setAttribute('aria-hidden', String(!isOpen));
    });
  });
});

const revealItems = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px' }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const form = document.getElementById('signup-form');
const formSuccess = document.getElementById('form-success');
const successText = document.getElementById('success-text');
const successLink = document.getElementById('success-link');
const formAgain = document.getElementById('form-again');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const subjectSelect = document.getElementById('subject');
const formatSelect = document.getElementById('lesson-format');

document.querySelectorAll('[data-subject]').forEach((link) => {
  link.addEventListener('click', () => {
    if (subjectSelect) subjectSelect.value = link.dataset.subject;
  });
});

function setFieldError(input, message) {
  const field = input.closest('.field');
  field.classList.toggle('has-error', Boolean(message));
  input.setAttribute('aria-invalid', String(Boolean(message)));
  const errorText = field.querySelector('.field-error');
  if (errorText) errorText.textContent = message || '';
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function buildMessengerLinks(request) {
  const text = [
    'Здравствуйте! Хочу записаться на бесплатное пробное занятие.',
    `Имя: ${request.name}`,
    `Телефон: ${request.phone}`,
    `Предмет: ${request.subject}`,
    `Формат: ${request.format}`
  ].join('\n');
  const encoded = encodeURIComponent(text);

  return {
    whatsapp: `https://wa.me/77087206418?text=${encoded}`,
    telegram: `https://t.me/+77087206418?text=${encoded}`
  };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const channel = event.submitter?.dataset.channel === 'telegram' ? 'telegram' : 'whatsapp';
  let isValid = true;

  if (nameInput.value.trim().length < 2) {
    setFieldError(nameInput, 'Укажите имя — как к вам обращаться.');
    isValid = false;
  } else {
    setFieldError(nameInput, '');
  }

  if (!isValidPhone(phoneInput.value)) {
    setFieldError(phoneInput, 'Введите номер телефона, например +7 700 123 45 67.');
    isValid = false;
  } else {
    setFieldError(phoneInput, '');
  }

  if (!isValid) {
    const firstInvalid = form.querySelector('.has-error input');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const request = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    subject: subjectSelect.value,
    format: formatSelect.value
  };

  const url = buildMessengerLinks(request)[channel];
  const label = channel === 'telegram' ? 'Telegram' : 'WhatsApp';

  successLink.href = url;
  successLink.textContent = `Открыть ${label}`;
  successText.textContent = `${request.name}, заявка готова! Мы открыли ${label} с готовым сообщением — осталось нажать «Отправить». Если окно не открылось, нажмите кнопку ниже.`;

  window.open(url, '_blank', 'noopener');

  form.hidden = true;
  formSuccess.hidden = false;
  formSuccess.focus();
});

[nameInput, phoneInput].forEach((input) => {
  input.addEventListener('input', () => setFieldError(input, ''));
});

formAgain.addEventListener('click', () => {
  form.reset();
  setFieldError(nameInput, '');
  setFieldError(phoneInput, '');
  formSuccess.hidden = true;
  form.hidden = false;
  nameInput.focus();
});

document.getElementById('year').textContent = String(new Date().getFullYear());
