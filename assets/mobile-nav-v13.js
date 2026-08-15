/* VW_MOBILE_NAV_V13_FRESH_ASSET */
(function () {
  "use strict";

  var ITEMS = [
    ["Home", "index.html"],
    ["Products", "products.html"],
    ["Pricing", "pricing.html"],
    ["FAQ", "faq.html"],
    ["Learn", "learn.html"],
    ["About", "about.html"],
    ["Login", "login.html"]
  ];

  function byHref(href) {
    return document.querySelector('a[href="' + href + '"]');
  }

  function findPrimaryNav() {
    var home = byHref("index.html");
    if (!home) return null;

    var node = home.parentElement;

    while (node && node !== document.body) {
      var count = 0;

      ITEMS.forEach(function (item) {
        if (node.querySelector('a[href="' + item[1] + '"]')) {
          count += 1;
        }
      });

      if (count >= 4) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  }

  function closeMenu(button, panel, backdrop) {
    panel.classList.remove("vw-mobile-menu-panel-open");
    backdrop.classList.remove("vw-mobile-menu-backdrop-open");
    button.classList.remove("vw-mobile-menu-open");
    button.setAttribute("aria-expanded", "false");
    document.body.classList.remove("vw-mobile-menu-body-open");
  }

  function positionPanel(button, panel) {
    var rect = button.getBoundingClientRect();
    var top = Math.max(8, Math.round(rect.bottom + 8));
    panel.style.top = top + "px";
  }

  function openMenu(button, panel, backdrop) {
    positionPanel(button, panel);
    backdrop.classList.add("vw-mobile-menu-backdrop-open");
    panel.classList.add("vw-mobile-menu-panel-open");
    button.classList.add("vw-mobile-menu-open");
    button.setAttribute("aria-expanded", "true");
    document.body.classList.add("vw-mobile-menu-body-open");
  }

  function init() {
    document.querySelectorAll(".vw-mobile-menu-toggle").forEach(function (node) {
      node.remove();
    });

    document.querySelectorAll(".vw-mobile-menu-panel").forEach(function (node) {
      node.remove();
    });

    document.querySelectorAll(".vw-mobile-menu-backdrop").forEach(function (node) {
      node.remove();
    });

    var primaryNav = findPrimaryNav();
    if (primaryNav) {
      primaryNav.classList.add("vw-mobile-nav-target");
    }

    var login = byHref("login.html");

    var button = document.createElement("button");
    button.type = "button";
    button.className = "vw-mobile-menu-toggle";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "vw-mobile-menu-panel");
    button.setAttribute("aria-label", "Open navigation menu");
    button.innerHTML =
      '<span class="vw-mobile-menu-bars" aria-hidden="true">' +
      '<span></span><span></span><span></span>' +
      '</span><span class="vw-mobile-menu-label">Menu</span>';

    if (login && login.parentNode) {
      login.parentNode.insertBefore(button, login);
    } else if (primaryNav && primaryNav.parentNode) {
      primaryNav.parentNode.insertBefore(button, primaryNav);
    } else {
      return;
    }

    var backdrop = document.createElement("div");
    backdrop.className = "vw-mobile-menu-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    var panel = document.createElement("nav");
    panel.id = "vw-mobile-menu-panel";
    panel.className = "vw-mobile-menu-panel";
    panel.setAttribute("aria-label", "Mobile navigation");

    ITEMS.forEach(function (item) {
      var source = byHref(item[1]);
      if (!source) return;

      var link = document.createElement("a");
      link.className = "vw-mobile-menu-link";
      link.href = source.getAttribute("href");
      link.textContent = item[0];
      panel.appendChild(link);
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (panel.classList.contains("vw-mobile-menu-panel-open")) {
        closeMenu(button, panel, backdrop);
      } else {
        openMenu(button, panel, backdrop);
      }
    });

    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu(button, panel, backdrop);
      }
    });

    backdrop.addEventListener("click", function () {
      closeMenu(button, panel, backdrop);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu(button, panel, backdrop);
      }
    });

    window.addEventListener("resize", function () {
      if (panel.classList.contains("vw-mobile-menu-panel-open")) {
        if (window.innerWidth > 860) {
          closeMenu(button, panel, backdrop);
        } else {
          positionPanel(button, panel);
        }
      }
    });

    window.addEventListener("orientationchange", function () {
      window.setTimeout(function () {
        if (panel.classList.contains("vw-mobile-menu-panel-open")) {
          positionPanel(button, panel);
        }
      }, 100);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();