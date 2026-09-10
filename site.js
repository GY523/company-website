(() => {
  const ecosystemPanel = document.querySelector(".ecosystem-panel");
  const ecosystemSlot = document.querySelector(".ecosystem-slot");
  if (ecosystemPanel && ecosystemSlot) {
    ecosystemSlot.replaceWith(ecosystemPanel);
  }

  document.querySelectorAll(".ecosystem-row").forEach((row) => {
    const set = row.querySelector(".ecosystem-set");
    if (!set) return;

    const duplicate = set.cloneNode(true);
    duplicate.setAttribute("aria-hidden", "true");
    row.append(duplicate);
    row.classList.add("is-ready");
  });

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
