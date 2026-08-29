const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('.reveal');
if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const glow = document.querySelector('.pointer-glow');
if (glow && !reduceMotion) {
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const header = document.querySelector('[data-header]');
let previousY = window.scrollY;
window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  header?.classList.toggle('hidden', currentY > previousY && currentY > 180);
  previousY = currentY;
}, { passive: true });

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');
menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menu?.classList.toggle('open', !isOpen);
});
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-40% 0px -50%', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const startedAt = performance.now();
    const tick = (time) => {
      const progress = reduceMotion ? 1 : Math.min((time - startedAt) / 1100, 1);
      element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))).toString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: .6 });
counters.forEach((counter) => counterObserver.observe(counter));

const services = {
  automation: {
    kicker: 'Automatisation / scénario', icon: '↻', color: '#e9e0f3',
    title: 'Votre activité avance, même quand vous ne cliquez pas.',
    text: 'Des automatisations fiables qui relient vos outils et prennent en charge les étapes répétitives.',
    chips: ['Relance commerciale', 'Synchronisation CRM', 'Reporting automatique'],
    flow: ['Nouveau prospect', 'Qualification', 'Relance']
  },
  ai: {
    kicker: 'IA / assistant métier', icon: '✦', color: '#d8ecff',
    title: 'Vos informations deviennent immédiatement accessibles.',
    text: 'Un assistant entraîné sur vos contenus pour répondre, classer, résumer et accompagner vos équipes.',
    chips: ['Chatbot support', 'Recherche documentaire', 'Analyse de demandes'],
    flow: ['Question', 'Contexte métier', 'Réponse utile']
  },
  web: {
    kicker: 'Web / produit sur mesure', icon: '⌘', color: '#fff2cf',
    title: 'Un outil pensé exactement autour de votre façon de travailler.',
    text: 'Portail client, application métier ou plateforme interne : une expérience claire sur tous les écrans.',
    chips: ['Portail client', 'Dashboard', 'Application SaaS'],
    flow: ['Besoin', 'Interface', 'Produit en ligne']
  },
  integration: {
    kicker: 'Intégrations / données', icon: '⌁', color: '#dceede',
    title: 'Vos logiciels communiquent enfin sans double saisie.',
    text: 'Connexion d’ERP, CRM, e-commerce et services internes pour obtenir une information cohérente partout.',
    chips: ['Odoo', 'API métier', 'E-commerce & CRM'],
    flow: ['Outil A', 'Synchronisation', 'Outil B']
  }
};

const serviceTabs = document.querySelectorAll('.service-tab');
const preview = document.querySelector('.service-preview');
serviceTabs.forEach((tab) => tab.addEventListener('click', () => {
  const service = services[tab.dataset.service];
  serviceTabs.forEach((item) => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  if (!service || !preview) return;
  preview.animate([{ opacity: .55, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'ease-out' });
  preview.style.background = service.color;
  preview.querySelector('[data-preview-kicker]').textContent = service.kicker;
  preview.querySelector('[data-preview-icon]').textContent = service.icon;
  preview.querySelector('[data-preview-title]').textContent = service.title;
  preview.querySelector('[data-preview-text]').textContent = service.text;
  preview.querySelector('[data-preview-chips]').innerHTML = service.chips.map((chip) => `<span>${chip}</span>`).join('');
  preview.querySelector('[data-preview-flow]').innerHTML = service.flow.map((step, index) => `${index ? '<b>→</b>' : ''}<div><i></i><span>${step}</span></div>`).join('');
}));

const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.project-card');
filters.forEach((filter) => filter.addEventListener('click', () => {
  filters.forEach((item) => item.classList.toggle('active', item === filter));
  cards.forEach((card) => {
    const visible = filter.dataset.filter === 'all' || card.dataset.category === filter.dataset.filter;
    card.classList.toggle('hidden-card', !visible);
  });
}));

const form = document.querySelector('[data-contact-form]');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = form.querySelector('.form-status');
  status.textContent = 'La maquette fonctionne. L’adresse de réception sera connectée après votre validation.';
  form.querySelector('button').textContent = 'Demande préparée ✓';
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
