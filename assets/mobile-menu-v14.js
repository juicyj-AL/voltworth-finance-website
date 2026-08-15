/* VW_STATIC_MOBILE_MENU_V14 */
(function () {
  "use strict";

  function init() {
    var button = document.querySelector(".vw-mobile-menu-toggle-v14");
    var panel = document.querySelector(".vw-mobile-menu-panel-v14");
    var backdrop = document.querySelector(".vw-mobile-menu-backdrop-v14");

    if (!button || !panel || !backdrop) return;

    function closeMenu() {
      panel.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      document.body.classList.remove("vw-mobile-menu-open-v14");
    }

    function openMenu() {
      panel.classList.add("is-open");
      backdrop.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      document.body.classList.add("vw-mobile-menu-open-v14");
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (panel.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    backdrop.addEventListener("click", closeMenu);

    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) {
        closeMenu();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();