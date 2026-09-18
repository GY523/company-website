(() => {
  const ecosystemPanel = document.querySelector(".ecosystem-panel");

  if (ecosystemPanel && "IntersectionObserver" in window) {
    const ecosystemObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        ecosystemPanel.classList.add("is-visible");
        ecosystemObserver.disconnect();
      }
    }, { threshold: 0.15 });
    ecosystemObserver.observe(ecosystemPanel);
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const statusEl = contactForm.querySelector(".form-status");
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const honeypot = contactForm.querySelector(".form-honeypot");
    const nameInput = contactForm.querySelector("#contact-name");
    const moreFields = contactForm.querySelector("#contact-form-more");
    const formHint = contactForm.querySelector("#contact-form-hint");

    if (nameInput && moreFields) {
      let expanded = false;
      const expandForm = () => {
        if (expanded) return;
        expanded = true;
        moreFields.hidden = false;
        if (formHint) formHint.hidden = true;
        window.requestAnimationFrame(() => moreFields.classList.add("is-open"));
      };
      nameInput.addEventListener("focus", expandForm);
      nameInput.addEventListener("input", expandForm);
    }

    const showStatus = (message, isError) => {
      statusEl.textContent = message;
      statusEl.classList.toggle("is-success", !isError);
      statusEl.classList.toggle("is-error", isError);
      statusEl.hidden = false;
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (honeypot && honeypot.checked) return;

      submitButton.disabled = true;
      statusEl.hidden = true;

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(contactForm),
        });
        const result = await response.json();
        if (response.ok && result.success) {
          showStatus(
            "Thanks! We've received your message and will get back to you soon.",
            false,
          );
          contactForm.reset();
        } else {
          throw new Error(result.message || "Submission failed.");
        }
      } catch (error) {
        showStatus(
          "Something went wrong sending your message. Please email us directly at vchip_inquiry@vchip.com.my.",
          true,
        );
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  const revealMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !revealMotion.matches) {
    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("content-reveal");
        headingObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(
      "main h1, main h2, main h3, .v1-hero .lede, .v1-hero .button-row, .page-hero .lede, .page-hero-video .eyebrow, .page-hero-video .hero-badge-row, .page-hero-video .button-row, .expertise-showcase-card, .section-band-navy .engagement-grid--cards > article, .node-track",
    ).forEach((element) => {
      // Carousel slides already have their own transitions.
      if (element.closest(".expertise-slide")) return;
      // The card itself handles its own entrance; skip its inner heading.
      if (
        element.matches("h1, h2, h3") &&
        element.closest(".expertise-showcase-card, .engagement-grid--cards > article")
      )
        return;
      if (element.matches(".lede")) {
        element.style.setProperty("--reveal-delay", "100ms");
      } else if (element.matches(".hero-badge-row")) {
        element.style.setProperty("--reveal-delay", "200ms");
      } else if (element.matches(".page-hero-video .button-row")) {
        element.style.setProperty("--reveal-delay", "300ms");
      } else if (element.matches(".button-row")) {
        element.style.setProperty("--reveal-delay", "200ms");
      }
      headingObserver.observe(element);
    });

    revealMotion.addEventListener("change", (event) => {
      if (!event.matches) return;
      headingObserver.disconnect();
      document.querySelectorAll(".content-reveal").forEach((element) => {
        element.classList.remove("content-reveal");
      });
    });
  }

  document.querySelectorAll(".career-row[aria-controls]").forEach((toggle) => {
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!panel) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      if (open) {
        toggle.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
        window.setTimeout(() => {
          if (toggle.getAttribute("aria-expanded") !== "true") panel.hidden = true;
        }, 260);
      } else {
        panel.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        window.requestAnimationFrame(() => panel.classList.add("is-open"));
      }
    });
  });

  const scrollTopButton = document.querySelector("[data-scroll-top]");
  if (scrollTopButton) {
    const toggleScrollTop = () => {
      scrollTopButton.hidden = window.scrollY < 400;
    };
    window.addEventListener("scroll", toggleScrollTop, { passive: true });
    toggleScrollTop();
    scrollTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  }

  const trustTrack = document.querySelector(".trust-track");
  const trustList = trustTrack?.querySelector(".trust-list");
  if (trustTrack && trustList) {
    for (let index = 0; index < 2; index += 1) {
      const duplicate = trustList.cloneNode(true);
      duplicate.setAttribute("aria-hidden", "true");
      trustTrack.append(duplicate);
    }
    trustTrack.classList.add("is-ready");
  }

  document.querySelectorAll(".hero-video-media").forEach((video) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reducedMotion.matches || document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
  });

  document.querySelectorAll("[data-expertise-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
    const tabs = [...carousel.querySelectorAll("[data-carousel-to]")];
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const count = carousel.querySelector(".expertise-count");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeIndex = 0;
    let timer;

    const showSlide = (nextIndex) => {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const active = index === activeIndex;
        slide.hidden = !active;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      tabs.forEach((tab, index) => {
        const active = index === activeIndex;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      if (count) {
        count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      }
    };

    const stopAutoPlay = () => window.clearInterval(timer);
    const startAutoPlay = () => {
      stopAutoPlay();
      if (!reducedMotion.matches && slides.length > 1) {
        timer = window.setInterval(() => showSlide(activeIndex + 1), 8000);
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        showSlide(index);
        startAutoPlay();
      });
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const target = (index + direction + tabs.length) % tabs.length;
        showSlide(target);
        tabs[target].focus();
        startAutoPlay();
      });
    });
    previous?.addEventListener("click", () => {
      showSlide(activeIndex - 1);
      startAutoPlay();
    });
    next?.addEventListener("click", () => {
      showSlide(activeIndex + 1);
      startAutoPlay();
    });
    carousel.addEventListener("pointerenter", stopAutoPlay);
    carousel.addEventListener("pointerleave", startAutoPlay);
    carousel.addEventListener("focusin", stopAutoPlay);
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) startAutoPlay();
    });
    reducedMotion.addEventListener("change", startAutoPlay);
    showSlide(0);
    startAutoPlay();
  });

  const header = document.querySelector(".site-header");
  const navigation = document.querySelector(".site-navigation");
  const toggle = document.querySelector(".menu-toggle");
  const close = document.querySelector(".menu-close");
  const dropdowns = [...document.querySelectorAll(".dropdown-toggle")];
  if (!header || !navigation || !toggle || !close) return;

  const mobile = window.matchMedia("(max-width: 1300px)");
  const background = [
    document.querySelector("main"),
    document.querySelector("footer"),
    document.querySelector(".brand"),
    document.querySelector(".skip-link"),
    toggle,
  ];
  let menuOpen = false;

  function closeDropdowns(except) {
    dropdowns.forEach((button) => {
      if (button !== except) {
        button.setAttribute("aria-expanded", "false");
        document.getElementById(button.getAttribute("aria-controls")).hidden =
          true;
      }
    });
  }

  function setMenu(open, restoreFocus = true) {
    menuOpen = open;
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    background.forEach((element) => {
      if (element) element.inert = open;
    });
    if (open) {
      navigation.setAttribute("role", "dialog");
      navigation.setAttribute("aria-modal", "true");
      close.focus();
    } else {
      navigation.removeAttribute("role");
      navigation.removeAttribute("aria-modal");
      closeDropdowns();
      if (restoreFocus) toggle.focus();
    }
  }

  dropdowns.forEach((button) => {
    button.hidden = false;
    const list = document.getElementById(button.getAttribute("aria-controls"));
    list.hidden = true;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      closeDropdowns(button);
      button.setAttribute("aria-expanded", String(open));
      list.hidden = !open;
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        closeDropdowns(button);
        button.setAttribute("aria-expanded", "true");
        list.hidden = false;
        list.querySelector("a").focus();
      }
    });
  });

  toggle.hidden = false;
  close.hidden = false;
  header.classList.add("enhanced");
  toggle.addEventListener("click", () => setMenu(!menuOpen));
  close.addEventListener("click", () => setMenu(false));
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-group")) closeDropdowns();
  });
  document.addEventListener("focusin", (event) => {
    dropdowns.forEach((button) => {
      if (!button.parentElement.contains(event.target)) {
        button.setAttribute("aria-expanded", "false");
        document.getElementById(button.getAttribute("aria-controls")).hidden =
          true;
      }
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const openDropdown = dropdowns.find(
        (button) => button.getAttribute("aria-expanded") === "true",
      );
      if (openDropdown) {
        closeDropdowns();
        openDropdown.focus();
      } else if (menuOpen) setMenu(false);
    }
    if (event.key === "Tab" && menuOpen) {
      const focusable = [
        ...navigation.querySelectorAll("a[href], button"),
      ].filter(
        (element) =>
          element.getClientRects().length && !element.closest("[hidden]"),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  navigation.addEventListener("click", (event) => {
    if (menuOpen && event.target.closest("a")) setMenu(false, false);
  });
  mobile.addEventListener("change", () => {
    const hadMenuFocus = navigation.contains(document.activeElement);
    if (menuOpen) setMenu(false, false);
    closeDropdowns();
    if (hadMenuFocus)
      (mobile.matches ? toggle : navigation.querySelector("a")).focus();
  });
})();
