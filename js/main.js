document.addEventListener("DOMContentLoaded", function () {
  var introOverlay = document.querySelector(".intro-overlay");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var heroCarouselStarted = false;
  function startHeroSlider() {
    var heroSlider = document.getElementById("heroSlider");
    if (!heroSlider || !window.bootstrap || heroCarouselStarted) return;
    heroCarouselStarted = true;
    bootstrap.Carousel.getOrCreateInstance(heroSlider, { interval: 5000, ride: false, touch: true, pause: false, wrap: true }).cycle();
  }
  function finishIntro() {
    document.documentElement.classList.add("intro-done");
    startHeroSlider();
  }
  if (reduceMotion) {
    finishIntro();
  } else if (introOverlay && !document.documentElement.classList.contains("intro-done")) {
    window.setTimeout(finishIntro, 4900);
  } else if (introOverlay) {
    introOverlay.addEventListener("animationend", finishIntro);
  } else {
    finishIntro();
  }
  var siteHeader = document.querySelector("header");
  var siteLead = document.querySelector(".site-lead-bar");
  function getLeadHeight() {
    if (!siteLead || getComputedStyle(siteLead).display === "none") return 0;
    return siteLead.offsetHeight;
  }
  function updateHeaderOffset() {
    var offset = Math.max(getLeadHeight() - window.scrollY, 0);
    document.documentElement.style.setProperty("--header-offset", offset + "px");
  }
  function updateTopLayout() {
    if (siteHeader) {
      document.documentElement.style.setProperty("--header-height", siteHeader.offsetHeight + "px");
    }
    document.documentElement.style.setProperty("--lead-height", getLeadHeight() + "px");
    updateHeaderOffset();
  }
  updateTopLayout();
  window.addEventListener("resize", updateTopLayout);
  window.addEventListener("scroll", updateHeaderOffset, { passive: true });
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
  fadeItems.forEach(function (el, index) {
    if (!el.style.getPropertyValue("--fade-delay")) {
      el.style.setProperty("--fade-delay", Math.min(index % 6 * 80, 400) + "ms");
    }
  });
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
  var stackedMenuQuery = window.matchMedia("(max-width: 575.98px)");
  function isMenuStacked() {
    return stackedMenuQuery.matches;
  }
  function updateMenuButtons() {
    if (!menuTrack) return;
    if (isMenuStacked()) {
      menuTrack.scrollLeft = 0;
      if (menuPrev) menuPrev.disabled = true;
      if (menuNext) menuNext.disabled = true;
      return;
    }
    var maxScroll = Math.max(0, menuTrack.scrollWidth - menuTrack.clientWidth - 2);
    var atStart = menuTrack.scrollLeft <= 2;
    var atEnd = menuTrack.scrollLeft >= maxScroll;
    if (menuPrev) menuPrev.disabled = atStart;
    if (menuNext) menuNext.disabled = atEnd;
  }
  function slideMenu(direction) {
    if (!menuTrack) return;
    if (isMenuStacked()) return;
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
    if (stackedMenuQuery.addEventListener) {
      stackedMenuQuery.addEventListener("change", updateMenuButtons);
    } else if (stackedMenuQuery.addListener) {
      stackedMenuQuery.addListener(updateMenuButtons);
    }
    updateMenuButtons();
  }
  var mainNav = document.getElementById("mainNav");
  if (mainNav) {
    var siteHeader = mainNav.closest("header");
    var navToggler = document.querySelector('[data-bs-target="#mainNav"]');
    var navSubmenuToggle = mainNav.querySelector(".nav-submenu-toggle");
    var navSubmenuParent = mainNav.querySelector(".nav-has-submenu");
    function isMobileNav() {
      return window.matchMedia("(max-width: 991.98px)").matches;
    }
    function closeNavSubmenu() {
      if (!navSubmenuParent || !navSubmenuToggle) return;
      navSubmenuParent.classList.remove("is-open");
      navSubmenuToggle.setAttribute("aria-expanded", "false");
    }
    function openNavSubmenu() {
      if (!navSubmenuParent || !navSubmenuToggle) return;
      navSubmenuParent.classList.add("is-open");
      navSubmenuToggle.setAttribute("aria-expanded", "true");
    }
    function toggleNavSubmenu() {
      if (!navSubmenuParent || !navSubmenuToggle) return;
      var isOpen = navSubmenuParent.classList.toggle("is-open");
      navSubmenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    function setNavOpen(isOpen) {
      mainNav.classList.toggle("show", isOpen);
      mainNav.classList.toggle("nav-opening", isOpen);
      document.documentElement.classList.toggle("nav-lock", isOpen);
      document.body.classList.toggle("nav-lock", isOpen);
      if (!isOpen) closeNavSubmenu();
      if (navToggler) {
        navToggler.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    }
    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 992px)").matches) {
        setNavOpen(false);
      }
    });
    if (navSubmenuToggle) {
      navSubmenuToggle.addEventListener("click", function (event) {
        if (!isMobileNav()) return;
        event.preventDefault();
        toggleNavSubmenu();
      });
    }
    if (navSubmenuParent) {
      navSubmenuParent.addEventListener("mouseenter", function () {
        if (isMobileNav()) return;
        openNavSubmenu();
      });
      navSubmenuParent.addEventListener("focusin", function () {
        if (isMobileNav()) return;
        openNavSubmenu();
      });
    }
    mainNav.querySelectorAll(".navbar-nav > .nav-item:not(.nav-has-submenu)").forEach(function (navItem) {
      navItem.addEventListener("mouseenter", function () {
        if (isMobileNav()) return;
        closeNavSubmenu();
      });
      navItem.addEventListener("focusin", function () {
        if (isMobileNav()) return;
        closeNavSubmenu();
      });
    });
    if (siteHeader) {
      siteHeader.addEventListener("mouseleave", function () {
        if (isMobileNav()) return;
        closeNavSubmenu();
      });
    }
    if (navToggler) {
      navToggler.addEventListener("click", function () {
        updateTopLayout();
        setNavOpen(!mainNav.classList.contains("show"));
      });
    }
  }
  document.querySelectorAll("#mainNav a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (link.classList.contains("nav-submenu-toggle") && window.matchMedia("(max-width: 991.98px)").matches) return;
      var nav = document.getElementById("mainNav");
      if (nav && nav.classList.contains("show")) {
        nav.classList.remove("show", "nav-opening");
        var submenuParent = nav.querySelector(".nav-has-submenu");
        var submenuToggle = nav.querySelector(".nav-submenu-toggle");
        if (submenuParent) submenuParent.classList.remove("is-open");
        if (submenuToggle) submenuToggle.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("nav-lock");
        document.body.classList.remove("nav-lock");
        var toggler = document.querySelector('[data-bs-target="#mainNav"]');
        if (toggler) toggler.setAttribute("aria-expanded", "false");
      }
    });
  });
  var galleryButtons = document.querySelectorAll(".gallery-lightbox");
  if (galleryButtons.length) {
    var galleryModal = document.createElement("div");
    galleryModal.className = "gallery-modal";
    galleryModal.setAttribute("role", "dialog");
    galleryModal.setAttribute("aria-modal", "true");
    galleryModal.setAttribute("aria-label", "ギャラリー画像の拡大表示");
    galleryModal.innerHTML = '<div class="gallery-modal-inner"><button class="gallery-modal-close" type="button" aria-label="閉じる">&times;</button><img class="gallery-modal-img" src="" alt=""></div>';
    document.body.appendChild(galleryModal);
    var galleryModalImg = galleryModal.querySelector(".gallery-modal-img");
    var galleryModalClose = galleryModal.querySelector(".gallery-modal-close");
    var lastGalleryTrigger = null;
    function closeGalleryModal() {
      galleryModal.classList.remove("is-open");
      document.documentElement.classList.remove("nav-lock");
      document.body.classList.remove("nav-lock");
      if (lastGalleryTrigger) lastGalleryTrigger.focus();
    }
    galleryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        lastGalleryTrigger = button;
        galleryModalImg.src = button.getAttribute("data-gallery-src");
        galleryModalImg.alt = button.getAttribute("data-gallery-alt") || "";
        galleryModal.classList.add("is-open");
        document.documentElement.classList.add("nav-lock");
        document.body.classList.add("nav-lock");
        galleryModalClose.focus();
      });
    });
    galleryModalClose.addEventListener("click", closeGalleryModal);
    galleryModal.addEventListener("click", function (event) {
      if (event.target === galleryModal) closeGalleryModal();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && galleryModal.classList.contains("is-open")) {
        closeGalleryModal();
      }
    });
  }
});
