document.addEventListener("DOMContentLoaded", function () {
  var introOverlay = document.querySelector(".intro-overlay");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function finishIntro() {
    document.documentElement.classList.add("intro-done");
  }
  if (reduceMotion) {
    finishIntro();
  } else if (introOverlay && !document.documentElement.classList.contains("intro-done")) {
    window.setTimeout(finishIntro, 4900);
  } else if (introOverlay) {
    introOverlay.addEventListener("animationend", function () {
      document.documentElement.classList.add("intro-done");
    });
  }
  var siteHeader = document.querySelector("header");
  var siteLead = document.querySelector(".site-lead-bar");
  function getLeadHeight() {
    if (!siteLead || getComputedStyle(siteLead).display === "none") return 0;
    return siteLead.offsetHeight;
  }
  function updateHeaderOffset() {
    var leadHeight = getLeadHeight();
    var offset = Math.max(0, leadHeight - window.scrollY);
    document.documentElement.style.setProperty("--header-offset", offset + "px");
  }
  function updateTopLayout() {
    if (siteHeader) {
      document.documentElement.style.setProperty("--header-height", siteHeader.offsetHeight + "px");
    }
    if (siteLead) {
      document.documentElement.style.setProperty("--lead-height", getLeadHeight() + "px");
    }
    updateHeaderOffset();
  }
  updateTopLayout();
  window.addEventListener("resize", updateTopLayout);
  window.addEventListener("scroll", updateHeaderOffset, { passive: true });
  var heroSlider = document.getElementById("heroSlider");
  if (heroSlider && window.bootstrap) {
    bootstrap.Carousel.getOrCreateInstance(heroSlider, { interval: 5000, ride: "carousel", touch: true, pause: false, wrap: true }).cycle();
  }
  var topCue = document.querySelector(".top-cue");
  var hero = document.querySelector(".hero");
  if (topCue && hero && "IntersectionObserver" in window) {
    var topIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        topCue.classList.toggle("is-visible", !entry.isIntersecting);
      });
    }, { threshold: .02 });
    topIo.observe(hero);
  }
  var fadeItems = Array.from(document.querySelectorAll(".fade-up"));
  fadeItems.forEach(function (el, index) { el.style.setProperty("--fade-delay", Math.min(index % 6 * 80, 400) + "ms"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .18 });
    fadeItems.forEach(function (el) { io.observe(el); });
  } else {
    fadeItems.forEach(function (el) { el.classList.add("is-visible"); });
  }
  var menuTrack = document.getElementById("menuTrack");
  var menuPrev = document.querySelector("[data-menu-prev]");
  var menuNext = document.querySelector("[data-menu-next]");
  function updateMenuButtons() {
    if (!menuTrack) return;
    var maxScroll = Math.max(0, menuTrack.scrollWidth - menuTrack.clientWidth - 2);
    var atStart = menuTrack.scrollLeft <= 2;
    var atEnd = menuTrack.scrollLeft >= maxScroll;
    if (menuPrev) menuPrev.disabled = atStart;
    if (menuNext) menuNext.disabled = atEnd;
  }
  function slideMenu(direction) {
    if (!menuTrack) return;
    var card = menuTrack.querySelector(".menu-slide");
    var gap = parseFloat(getComputedStyle(menuTrack).gap) || 0;
    var amount = card ? card.getBoundingClientRect().width + gap : menuTrack.clientWidth;
    menuTrack.scrollBy({ left: amount * direction, behavior: "smooth" });
    window.setTimeout(updateMenuButtons, 360);
  }
  if (menuPrev) menuPrev.addEventListener("click", function () { slideMenu(-1); });
  if (menuNext) menuNext.addEventListener("click", function () { slideMenu(1); });
  if (menuTrack) {
    menuTrack.addEventListener("scroll", updateMenuButtons, { passive: true });
    window.addEventListener("resize", updateMenuButtons);
    updateMenuButtons();
  }
  var mainNav = document.getElementById("mainNav");
  if (mainNav) {
    var navToggler = document.querySelector('[data-bs-target="#mainNav"]');
    function setNavOpen(isOpen) {
      mainNav.classList.toggle("show", isOpen);
      mainNav.classList.toggle("nav-opening", isOpen);
      document.documentElement.classList.toggle("nav-lock", isOpen);
      document.body.classList.toggle("nav-lock", isOpen);
      if (navToggler) {
        navToggler.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    }
    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 992px)").matches) {
        setNavOpen(false);
      }
    });
    if (navToggler) {
      navToggler.addEventListener("click", function () {
        updateTopLayout();
        setNavOpen(!mainNav.classList.contains("show"));
      });
    }
  }
  document.querySelectorAll("#mainNav a").forEach(function (link) {
    link.addEventListener("click", function () {
      var nav = document.getElementById("mainNav");
      if (nav && nav.classList.contains("show")) {
        nav.classList.remove("show", "nav-opening");
        document.documentElement.classList.remove("nav-lock");
        document.body.classList.remove("nav-lock");
        var toggler = document.querySelector('[data-bs-target="#mainNav"]');
        if (toggler) toggler.setAttribute("aria-expanded", "false");
      }
    });
  });
});