/* VW_MOBILE_NAV_V1 */
(function () {
  "use strict";

  var PRIMARY_HREFS = [
    "index.html",
    "products.html",
    "pricing.html",
    "faq.html",
    "learn.html",
    "about.html"
  ];

  function normalizedHref(anchor) {
    var raw = (anchor.getAttribute("href") || "").trim();
    raw = raw.split("#")[0].split("?")[0];
    raw = raw.replace(/^\.?\//, "");
    return raw;
  }

  function findPrimaryNav() {
    var anchors = Array.prototype.slice.call(document.querySelectorAll("a[href]"));
    var required = anchors.filter(function (a) {
      return PRIMARY_HREFS.indexOf(normalizedHref(a)) !== -1;
    });

    if (required.length < 4) return null;

    var node = required[0].parentElement;
    while (node && node !== document.body) {
      var count = 0;
      for (var i = 0; i < required.length; i++) {
        if (node.contains(required[i])) count++;
      }

      if (count >= 4) {
        var directLinks = node.querySelectorAll("a[href]").length;
        if (directLinks <= 12) return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function closeMenu(button, nav) {
    nav.classList.remove("vw-mobile-nav-open");
    button.classList.remove("vw-mobile-menu-open");
    button.setAttribute("aria-expanded", "false");
  }

  function init() {
    var nav = findPrimaryNav();
    if (!nav || nav.classList.contains("vw-mobile-nav-target")) return;

    nav.classList.add("vw-mobile-nav-target");
    nav.id = nav.id || "vw-primary-mobile-nav";

    var button = document.createElement("button");
    button.type = "button";
    button.className = "vw-mobile-menu-toggle";
    button.setAttribute("aria-controls", nav.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open navigation menu");
    button.innerHTML =
      '<span class="vw-mobile-menu-bars" aria-hidden="true">' +
      '<span></span><span></span><span></span>' +
      '</span><span class="vw-mobile-menu-label">Menu</span>';

    nav.parentNode.insertBefore(button, nav);

    button.addEventListener("click", function () {
      var willOpen = !nav.classList.contains("vw-mobile-nav-open");
      if (willOpen) {
        nav.classList.add("vw-mobile-nav-open");
        button.classList.add("vw-mobile-menu-open");
        button.setAttribute("aria-expanded", "true");
      } else {
        closeMenu(button, nav);
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(button, nav);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("vw-mobile-nav-open")) return;
      if (nav.contains(event.target) || button.contains(event.target)) return;
      closeMenu(button, nav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu(button, nav);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeMenu(button, nav);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();