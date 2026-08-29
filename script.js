const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const stylesheetHref =
  document
    .querySelector('link[rel="stylesheet"][href$="styles.css"]')
    ?.getAttribute("href") || "styles.css";
const rootPrefix = stylesheetHref.slice(0, -"styles.css".length);

const revealItems = document.querySelectorAll(".reveal");
if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const glow = document.querySelector(".pointer-glow");
if (glow && !reduceMotion) {
  window.addEventListener(
    "pointermove",
    (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    },
    { passive: true },
  );
}

const header = document.querySelector("[data-header]");
let previousY = window.scrollY;
window.addEventListener(
  "scroll",
  () => {
    const currentY = window.scrollY;
    header?.classList.toggle("hidden", currentY > previousY && currentY > 180);
    previousY = currentY;
  },
  { passive: true },
);

const navShell = document.querySelector(".nav-shell");
if (navShell) {
  let toggle = navShell.querySelector(".menu-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.className = "menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "main-menu");
    toggle.innerHTML =
      '<span></span><span></span><span class="sr-only">Ouvrir le menu</span>';
    navShell.appendChild(toggle);
  }
  let links = navShell.querySelector("#main-menu");
  if (!links) {
    links = document.createElement("div");
    links.className = "nav-links";
    links.id = "main-menu";
    navShell.appendChild(links);
  }
  const path = window.location.pathname;
  const active = (part) => (path.includes(part) ? "active" : "");
  const toolsActive = /diagnostic|calculateur|developpeur-troyes/.test(path)
    ? " active"
    : "";
  links.innerHTML = `
    <a class="${active("/services")}" href="${rootPrefix}services.html">Services</a>
    <a class="${active("projets")}" href="${rootPrefix}projets.html">Projets</a>
    <a class="${active("/conseils") || active("conseils")}" href="${rootPrefix}conseils.html">Conseils</a>
    <a class="${active("a-propos")}" href="${rootPrefix}a-propos.html">À propos</a>
    <details class="nav-tools${toolsActive}">
      <summary>Outils</summary>
      <div>
        <a href="${rootPrefix}diagnostic.html">Diagnostic</a>
        <a href="${rootPrefix}calculateur.html">Calculateur de gains</a>
        <a href="${rootPrefix}developpeur-troyes.html">Troyes & France</a>
      </div>
    </details>
    <a class="nav-cta ${active("rendez-vous")}" href="${rootPrefix}rendez-vous.html">Réserver 30 min <span>↗︎</span></a>
  `;
}

document.querySelectorAll(".button span, .nav-cta span").forEach((icon) => {
  if (icon.textContent.trim().includes("↗")) icon.textContent = "↗︎";
});

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#main-menu");
menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menu?.classList.toggle("open", !isOpen);
});
menu?.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }),
);

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) =>
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`,
          ),
        );
      }
    });
  },
  { rootMargin: "-40% 0px -50%", threshold: 0 },
);
sections.forEach((section) => sectionObserver.observe(section));

const counters = document.querySelectorAll("[data-count]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      const startedAt = performance.now();
      const tick = (time) => {
        const progress = reduceMotion
          ? 1
          : Math.min((time - startedAt) / 1100, 1);
        element.textContent = Math.round(
          target * (1 - Math.pow(1 - progress, 3)),
        ).toString();
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(element);
    });
  },
  { threshold: 0.6 },
);
counters.forEach((counter) => counterObserver.observe(counter));

const services = {
  automation: {
    kicker: "Automatisation / scénario",
    icon: "↻",
    color: "#e9e0f3",
    title: "Votre activité avance, même quand vous ne cliquez pas.",
    text: "Des automatisations fiables qui relient vos outils et prennent en charge les étapes répétitives.",
    chips: [
      "Relance commerciale",
      "Synchronisation CRM",
      "Reporting automatique",
    ],
    flow: ["Nouveau prospect", "Qualification", "Relance"],
  },
  ai: {
    kicker: "IA / assistant métier",
    icon: "✦",
    color: "#d8ecff",
    title: "Vos informations deviennent immédiatement accessibles.",
    text: "Un assistant entraîné sur vos contenus pour répondre, classer, résumer et accompagner vos équipes.",
    chips: ["Chatbot support", "Recherche documentaire", "Analyse de demandes"],
    flow: ["Question", "Contexte métier", "Réponse utile"],
  },
  web: {
    kicker: "Web / produit sur mesure",
    icon: "⌘",
    color: "#fff2cf",
    title: "Un outil pensé exactement autour de votre façon de travailler.",
    text: "Portail client, application métier ou plateforme interne : une expérience claire sur tous les écrans.",
    chips: ["Portail client", "Dashboard", "Application SaaS"],
    flow: ["Besoin", "Interface", "Produit en ligne"],
  },
  integration: {
    kicker: "Intégrations / données",
    icon: "⌁",
    color: "#dceede",
    title: "Vos logiciels communiquent enfin sans double saisie.",
    text: "Connexion d’ERP, CRM, e-commerce et services internes pour obtenir une information cohérente partout.",
    chips: ["Odoo", "API métier", "E-commerce & CRM"],
    flow: ["Outil A", "Synchronisation", "Outil B"],
  },
};

const serviceTabs = document.querySelectorAll(".service-tab");
const preview = document.querySelector(".service-preview");
serviceTabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    const service = services[tab.dataset.service];
    serviceTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
    });
    if (!service || !preview) return;
    preview.animate(
      [
        { opacity: 0.55, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 350, easing: "ease-out" },
    );
    preview.style.background = service.color;
    preview.querySelector("[data-preview-kicker]").textContent = service.kicker;
    preview.querySelector("[data-preview-icon]").textContent = service.icon;
    preview.querySelector("[data-preview-title]").textContent = service.title;
    preview.querySelector("[data-preview-text]").textContent = service.text;
    preview.querySelector("[data-preview-chips]").innerHTML = service.chips
      .map((chip) => `<span>${chip}</span>`)
      .join("");
    preview.querySelector("[data-preview-flow]").innerHTML = service.flow
      .map(
        (step, index) =>
          `${index ? "<b>→</b>" : ""}<div><i></i><span>${step}</span></div>`,
      )
      .join("");
  }),
);

const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".project-card");
filters.forEach((filter) =>
  filter.addEventListener("click", () => {
    filters.forEach((item) => item.classList.toggle("active", item === filter));
    cards.forEach((card) => {
      const visible =
        filter.dataset.filter === "all" ||
        card.dataset.category === filter.dataset.filter;
      card.classList.toggle("hidden-card", !visible);
    });
  }),
);

const form = document.querySelector("[data-contact-form]");
form?.addEventListener("submit", (event) => {
  const status = form.querySelector(".form-status");
  status.textContent = "Envoi de votre demande…";
  form.querySelector("button").disabled = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "lead_form_submit", form_name: "contact" });
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();

const legalLinks = document.querySelector(".footer > div");
if (legalLinks) {
  if (!legalLinks.querySelector('a[href$="mentions-legales.html"]')) {
    legalLinks.insertAdjacentHTML(
      "beforeend",
      `<a href="${rootPrefix}mentions-legales.html">Mentions légales</a>`,
    );
  }
  if (!legalLinks.querySelector('a[href$="confidentialite.html"]')) {
    legalLinks.insertAdjacentHTML(
      "beforeend",
      `<a href="${rootPrefix}confidentialite.html">Confidentialité</a>`,
    );
  }
  if (!legalLinks.querySelector("[data-cookie-settings]")) {
    legalLinks.insertAdjacentHTML(
      "beforeend",
      '<button class="cookie-settings" type="button" data-cookie-settings>Cookies</button>',
    );
  }
}

const COOKIE_NOTICE_KEY = "am_cookie_notice";
const showCookieNotice = () => {
  if (document.querySelector(".cookie-banner")) return;
  const banner = document.createElement("aside");
  banner.className = "cookie-banner";
  banner.setAttribute("aria-label", "Information sur les cookies");
  banner.innerHTML = `<h2>Votre vie privée, simplement.</h2><p>Ce site n’utilise actuellement aucun cookie publicitaire ou de mesure d’audience. Un stockage local sert uniquement à mémoriser la fermeture de ce message.</p><div class="cookie-actions"><button type="button" data-cookie-close>Compris</button><a href="${rootPrefix}confidentialite.html">En savoir plus</a></div>`;
  document.body.appendChild(banner);
  banner.querySelector("[data-cookie-close]").addEventListener("click", () => {
    localStorage.setItem(COOKIE_NOTICE_KEY, "acknowledged");
    banner.remove();
  });
};
if (!localStorage.getItem(COOKIE_NOTICE_KEY)) showCookieNotice();
document
  .querySelector("[data-cookie-settings]")
  ?.addEventListener("click", () => {
    localStorage.removeItem(COOKIE_NOTICE_KEY);
    showCookieNotice();
  });

const diagnostic = document.querySelector("[data-diagnostic]");
if (diagnostic) {
  const steps = [...diagnostic.querySelectorAll(".diagnostic-step")];
  const progress = diagnostic.querySelector(".diagnostic-progress i");
  const answers = {};
  let currentStep = 0;

  diagnostic.querySelectorAll("[data-answer]").forEach((choice) => {
    choice.addEventListener("click", () => {
      answers[choice.dataset.question] = choice.dataset.answer;
      currentStep += 1;
      steps.forEach((step, index) =>
        step.classList.toggle("active", index === currentStep),
      );
      progress.style.width = `${Math.min(((currentStep + 1) / steps.length) * 100, 100)}%`;

      if (currentStep === steps.length - 1) {
        const resultTitle = diagnostic.querySelector("[data-result-title]");
        const resultText = diagnostic.querySelector("[data-result-text]");
        const recommendations = {
          time: [
            "Une automatisation ciblée",
            "Je commencerais par repérer les tâches répétitives et les échanges entre vos outils. Une première automatisation peut souvent produire un gain visible sans refaire tout votre système.",
          ],
          clients: [
            "Un assistant IA bien encadré",
            "Je vous proposerais un assistant capable de répondre à partir de vos contenus, avec une transmission simple vers une personne lorsque c’est nécessaire.",
          ],
          app: [
            "Une application web sur mesure",
            "Votre besoin semble demander une interface dédiée. Je cadrerais les parcours essentiels avant de construire une première version simple à tester.",
          ],
          connect: [
            "Une intégration entre vos outils",
            "Je commencerais par cartographier les données qui circulent entre vos logiciels afin de supprimer les doubles saisies et fiabiliser les informations.",
          ],
        };
        const result = recommendations[answers.need] || recommendations.time;
        resultTitle.textContent = result[0];
        resultText.textContent = result[1];
        diagnostic.querySelector("[data-diagnostic-need]").value =
          answers.need || "";
        diagnostic.querySelector("[data-diagnostic-stage]").value =
          answers.stage || "";
        diagnostic.querySelector("[data-diagnostic-result]").value = result[0];
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "diagnostic_complete",
          recommendation: result[0],
        });
      }
    });
  });
}

document
  .querySelectorAll('a[href*="calendly.com"], a[href$="rendez-vous.html"]')
  .forEach((link) => {
    link.addEventListener("click", () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "booking_click", link_url: link.href });
    });
  });

const calculator = document.querySelector("[data-roi-calculator]");
if (calculator) {
  const fields = [...calculator.querySelectorAll('input[type="number"]')];
  const euro = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const updateCalculator = () => {
    const hours = Math.max(
      Number(calculator.querySelector('[name="hours"]').value) || 0,
      0,
    );
    const people = Math.max(
      Number(calculator.querySelector('[name="people"]').value) || 0,
      0,
    );
    const rate = Math.max(
      Number(calculator.querySelector('[name="rate"]').value) || 0,
      0,
    );
    const automated = Math.min(
      Math.max(
        Number(calculator.querySelector('[name="automated"]').value) || 0,
        0,
      ),
      100,
    );
    const savedHours = hours * people * 52 * (automated / 100);
    const savedValue = savedHours * rate;
    calculator.querySelector("[data-saved-hours]").textContent =
      Math.round(savedHours).toLocaleString("fr-FR");
    calculator.querySelector("[data-saved-value]").textContent =
      euro.format(savedValue);
    calculator.querySelector("[data-roi-summary]").value =
      `${Math.round(savedHours)} heures et ${euro.format(savedValue)} potentiellement économisés par an`;
  };
  fields.forEach((field) => field.addEventListener("input", updateCalculator));
  calculator.addEventListener("submit", () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "roi_lead_submit" });
  });
  updateCalculator();
}
