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

/* VOLT_WORTH_SITEWIDE_SESSION_NAV_V1_2 */
(function () {
  "use strict";

  var API_BASE = "https://api.voltworthfinance.com";
  var PRODUCTION_SITE_ORIGIN = "https://voltworthfinance.com";
  var TOKEN_KEY = "voltworth_access_token";
  var EXPIRES_KEY = "voltworth_session_expires_at";

  function getToken() {
    return window.sessionStorage.getItem(TOKEN_KEY) || "";
  }

  function clearSession() {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(EXPIRES_KEY);
  }

  function hasUsableSession() {
    var token = getToken();
    var expires;
    var expiresAt;

    if (!token) {
      return false;
    }

    expires = window.sessionStorage.getItem(EXPIRES_KEY) || "";

    if (!expires) {
      return true;
    }

    expiresAt = Date.parse(expires);

    if (isNaN(expiresAt)) {
      return true;
    }

    if (expiresAt <= Date.now()) {
      clearSession();
      return false;
    }

    return true;
  }

  function isLoginPage() {
    var path = window.location.pathname.toLowerCase();

    return path === "/login.html" ||
      path.slice(-11) === "/login.html";
  }

  async function signOut() {
    var token = getToken();

    try {
      if (
        token &&
        window.location.origin === PRODUCTION_SITE_ORIGIN
      ) {
        await window.fetch(
          API_BASE + "/auth/logout",
          {
            method: "POST",
            mode: "cors",
            cache: "no-store",
            credentials: "omit",
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );
      }
    } catch (error) {
      // Server logout is best-effort. Browser cleanup still occurs.
    } finally {
      clearSession();
      window.location.replace("login.html?reason=logged-out");
    }
  }

  function bindSignOutLink(link) {
    if (!link) {
      return;
    }

    if (link.getAttribute("data-vw-session-bound") === "true") {
      return;
    }

    link.setAttribute("data-vw-session-bound", "true");

    link.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        signOut();
      }
    );
  }

  function syncDesktopNavigation(authenticated) {
    var primary = document.querySelector(
      "a.vw-login:not([data-vw-session-signout])"
    );
    var parent;
    var signOutLink;

    if (!primary) {
      return;
    }

    parent = primary.parentNode;

    if (!parent) {
      return;
    }

    signOutLink = parent.querySelector(
      'a[data-vw-session-signout="desktop"]'
    );

    if (authenticated) {
      primary.textContent = "Account";
      primary.setAttribute("href", "account.html");

      if (!signOutLink) {
        signOutLink = document.createElement("a");
        signOutLink.className = "vw-login";
        signOutLink.textContent = "Sign Out";
        signOutLink.setAttribute(
          "href",
          "login.html?reason=logged-out"
        );
        signOutLink.setAttribute(
          "data-vw-session-signout",
          "desktop"
        );
        signOutLink.setAttribute(
          "aria-label",
          "Sign out of VoltWorth"
        );

        if (primary.nextSibling) {
          parent.insertBefore(
            signOutLink,
            primary.nextSibling
          );
        } else {
          parent.appendChild(signOutLink);
        }
      }

      bindSignOutLink(signOutLink);
      return;
    }

    primary.textContent = "Login";
    primary.setAttribute("href", "login.html");

    if (signOutLink) {
      signOutLink.remove();
    }
  }

  function syncMobileNavigation(authenticated) {
    var panel = document.querySelector(
      ".vw-mobile-menu-panel-v14"
    );
    var authLink;
    var signOutLink;

    if (!panel) {
      return;
    }

    authLink = panel.querySelector(
      'a[href="login.html"], a[href="account.html"]'
    );

    signOutLink = panel.querySelector(
      'a[data-vw-session-signout="mobile"]'
    );

    if (!authLink) {
      return;
    }

    if (authenticated) {
      authLink.textContent = "Account";
      authLink.setAttribute("href", "account.html");

      if (!signOutLink) {
        signOutLink = document.createElement("a");
        signOutLink.textContent = "Sign Out";
        signOutLink.setAttribute(
          "href",
          "login.html?reason=logged-out"
        );
        signOutLink.setAttribute(
          "data-vw-session-signout",
          "mobile"
        );
        signOutLink.setAttribute(
          "aria-label",
          "Sign out of VoltWorth"
        );

        if (authLink.nextSibling) {
          panel.insertBefore(
            signOutLink,
            authLink.nextSibling
          );
        } else {
          panel.appendChild(signOutLink);
        }
      }

      bindSignOutLink(signOutLink);
      return;
    }

    authLink.textContent = "Login";
    authLink.setAttribute("href", "login.html");

    if (signOutLink) {
      signOutLink.remove();
    }
  }

  function syncSessionNavigation() {
    var authenticated = hasUsableSession();

    if (authenticated && isLoginPage()) {
      window.location.replace("account.html");
      return;
    }

    syncDesktopNavigation(authenticated);
    syncMobileNavigation(authenticated);
  }

  document.addEventListener(
    "DOMContentLoaded",
    syncSessionNavigation
  );

  window.addEventListener(
    "pageshow",
    syncSessionNavigation
  );
}());
