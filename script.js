/**
 * Portfolio interactions:
 * - Dark / light theme toggle (persisted in localStorage)
 * - Smooth in-page navigation (hash links)
 * - Sticky header mobile menu
 * - IntersectionObserver-driven section reveals
 * - Active nav highlighting while scrolling
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const THEME_STORAGE_KEY = "portfolio-theme";

  /** Read current theme from html data-theme (default: dark) */
  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  /** Apply light or dark theme and persist choice */
  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (e) {
      /* ignore quota / private mode */
    }
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", next === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("title", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  /** Restore theme from storage (head inline script may already set html) */
  function initThemeToggle() {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        applyTheme(stored);
      } else {
        applyTheme(getTheme());
      }
    } catch (e) {
      applyTheme("dark");
    }

    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      applyTheme(getTheme() === "dark" ? "light" : "dark");
    });
  }

  /** Smooth-scroll to hash targets without breaking browser history UX */
  function initSmoothScroll() {
    const links = document.querySelectorAll("[data-smooth-scroll]");
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        const header = document.querySelector(".site-header");
        const offset = header ? header.getBoundingClientRect().height : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 10;
        window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
        closeMobileNav();
        history.pushState(null, "", href);
      });
    });
  }

  /** Mobile navigation open / close */
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector("#mobile-nav");

  function setMobileNav(open) {
    if (!toggle || !mobileNav || !header) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
    header.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  function closeMobileNav() {
    setMobileNav(false);
  }

  function initMobileNav() {
    if (!toggle || !mobileNav) return;
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setMobileNav(!isOpen);
    });
    mobileNav.querySelectorAll("a[data-smooth-scroll]").forEach((a) => {
      a.addEventListener("click", () => closeMobileNav());
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) closeMobileNav();
    });
  }

  /** Fade/slide sections into view once they enter the viewport */
  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (prefersReducedMotion) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach((n) => io.observe(n));
  }

  /** Highlight the nav link for the section currently in view */
  function initActiveNav() {
    const sectionIds = ["about", "education", "experience", "projects", "skills", "certifications", "awards", "contact"];
    const desktopLinks = Array.from(document.querySelectorAll('.nav--desktop a[href^="#"]'));
    if (!desktopLinks.length) return;

    const map = new Map();
    desktopLinks.forEach((a) => {
      const id = a.getAttribute("href")?.replace("#", "");
      if (id) map.set(id, a);
    });

    const headerEl = document.querySelector(".site-header");
    const offset = headerEl ? headerEl.getBoundingClientRect().height + 24 : 120;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          desktopLinks.forEach((l) => l.classList.remove("is-active"));
          const active = map.get(id);
          if (active) active.classList.add("is-active");
        });
      },
      { root: null, threshold: 0.35, rootMargin: `-${offset}px 0px -55% 0px` }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /** Footer year */
  function initYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initSmoothScroll();
    initMobileNav();
    initReveal();
    initActiveNav();
    initYear();
  });
})();
