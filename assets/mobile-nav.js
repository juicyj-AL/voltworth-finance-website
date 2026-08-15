/* VW_MOBILE_NAV_V1_1_REPAIR */
(function () {
  "use strict";

  var NAV_ITEMS = [
    ["Home", "index.html"],
    ["Products", "products.html"],
    ["Pricing", "pricing.html"],
    ["FAQ", "faq.html"],
    ["Learn", "learn.html"],
    ["About", "about.html"],
    ["Login", "login.html"]
  ];

  function existingHref(href) {
    return document.querySelector('a[href="' + href + '"]');
  }

  function closeMenu(button, panel, backdrop) {
    panel.classList.remove("vw-mobile-menu-panel-open");
    backdrop.classList.remove("vw-mobile-menu-backdrop-open");
    button.classList.remove("vw-mobile-menu-open");
    button.setAttribute("aria-expanded", "false");
    document.body.classList.remove("vw-mobile-menu-body-open");
  }

  function openMenu(button, panel, backdrop) {
    panel.classList.add("vw-mobile-menu-panel-open");
    backdrop.classList.add("vw-mobile-menu-backdrop-open");
    button.classList.add("vw-mobile-menu-open");
    button.setAttribute("aria-expanded", "true");
    document.body.classList.add("vw-mobile-menu-body-open");
  }

  function init() {
    var oldButton = document.querySelector(".vw-mobile-menu-toggle");
    if (oldButton) oldButton.remove();

    var oldPanel = document.querySelector(".vw-mobile-menu-panel");
    if (oldPanel) oldPanel.remove();

    var oldBackdrop = document.querySelector(".vw-mobile-menu-backdrop");
    if (oldBackdrop) oldBackdrop.remove();

    var primaryNav = document.querySelector(".vw-mobile-nav-target");

    if (!primaryNav) {
      var homeAnchor = existingHref("index.html");
      if (!homeAnchor) return;

      var node = homeAnchor.parentElement;
      while (node && node !== document.body) {
        var count = 0;
        for (var i = 0; i < NAV_ITEMS.length; i++) {
          if (node.querySelector('a[href="' + NAV_ITEMS[i][1] + '"]')) count++;
        }
        if (count >= 4) {
          primaryNav = node;
          break;
        }
        node = node.parentElement;
      }
    }

    if (!primaryNav) return;

    primaryNav.classList.add("vw-mobile-nav-target");

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

    var panel = document.createElement("nav");
    panel.id = "vw-mobile-menu-panel";
    panel.className = "vw-mobile-menu-panel";
    panel.setAttribute("aria-label", "Mobile navigation");

    NAV_ITEMS.forEach(function (item) {
      var source = existingHref(item[1]);
      if (!source) return;

      var link = document.createElement("a");
      link.href = source.getAttribute("href");
      link.textContent = item[0];
      link.className = "vw-mobile-menu-link";
      panel.appendChild(link);
    });

    var backdrop = document.createElement("div");
    backdrop.className = "vw-mobile-menu-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    primaryNav.parentNode.insertBefore(button, primaryNav);
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
      if (window.innerWidth > 860) {
        closeMenu(button, panel, backdrop);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();