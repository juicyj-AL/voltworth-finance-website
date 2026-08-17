(function () {
  "use strict";

  var API_BASE = "https://api.voltworthfinance.com";
  var PRODUCTION_SITE_ORIGIN = "https://voltworthfinance.com";

  var TOKEN_KEY = "voltworth_access_token";
  var EXPIRES_KEY = "voltworth_session_expires_at";

  function isProductionSite() {
    return window.location.origin === PRODUCTION_SITE_ORIGIN;
  }

  function getToken() {
    return window.sessionStorage.getItem(TOKEN_KEY) || "";
  }

  function clearSession() {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(EXPIRES_KEY);
  }

  function storeSession(data) {
    if (!data || !data.access_token) {
      throw new Error("Login response did not include an access token.");
    }

    window.sessionStorage.setItem(
      TOKEN_KEY,
      String(data.access_token)
    );

    window.sessionStorage.setItem(
      EXPIRES_KEY,
      String(data.expires_at || "")
    );
  }

  function setMessage(element, message, kind) {
    if (!element) {
      return;
    }

    element.textContent = message || "";
    element.classList.remove(
      "success",
      "error",
      "info"
    );

    if (kind) {
      element.classList.add(kind);
    }

    element.hidden = !message;
  }

  function setBusy(button, busy, busyText, normalText) {
    if (!button) {
      return;
    }

    button.disabled = busy;
    button.textContent = busy ? busyText : normalText;
  }

  function readableName(value) {
    if (!value) {
      return "?";
    }

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
      });
  }

  function describeApiError(payload, status) {
    if (payload && typeof payload.detail === "string") {
      return payload.detail;
    }

    if (payload && Array.isArray(payload.detail)) {
      return payload.detail.map(function (item) {
        if (item && item.msg) {
          return item.msg;
        }

        return "Invalid request.";
      }).join(" ");
    }

    if (payload && typeof payload.message === "string") {
      return payload.message;
    }

    return "Request failed with HTTP " + String(status) + ".";
  }

  async function apiRequest(path, options) {
    options = options || {};

    var method = options.method || "GET";
    var auth = options.auth === true;
    var body = options.body;

    var headers = {
      "Accept": "application/json"
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (auth) {
      var token = getToken();

      if (!token) {
        var missing = new Error("No active session.");
        missing.status = 401;
        throw missing;
      }

      headers["Authorization"] = "Bearer " + token;
    }

    var response = await window.fetch(
      API_BASE + path,
      {
        method: method,
        headers: headers,
        body: body === undefined
          ? undefined
          : JSON.stringify(body),
        mode: "cors",
        cache: "no-store",
        credentials: "omit"
      }
    );

    var payload = null;

    try {
      payload = await response.json();
    } catch (ignored) {
      payload = null;
    }

    if (!response.ok) {
      var error = new Error(
        describeApiError(payload, response.status)
      );

      error.status = response.status;
      error.payload = payload;

      throw error;
    }

    return payload;
  }

  function localPreviewMessage(messageElement) {
    setMessage(
      messageElement,
      "Local preview mode. Production account requests are disabled unless this page is loaded from https://voltworthfinance.com.",
      "info"
    );
  }

  function queryReasonMessage() {
    var params = new URLSearchParams(window.location.search);
    var reason = params.get("reason");

    if (reason === "session-required") {
      return "Sign in to open your VoltWorth account.";
    }

    if (reason === "session-expired") {
      return "Your session is no longer active. Please sign in again.";
    }

    if (reason === "logged-out") {
      return "You have been signed out.";
    }

    if (reason === "password-changed") {
      return "Your password was changed. Sign in again with your new password.";
    }

    return "";
  }

  function bindPasswordVisibility() {
    var buttons = document.getElementsByClassName(
      "vw-password-toggle"
    );

    Array.prototype.forEach.call(
      buttons,
      function (button) {
        var targetId = button.getAttribute("data-target");
        var input = document.getElementById(targetId);

        if (!input) {
          return;
        }

        button.addEventListener(
          "click",
          function () {
            var visible = input.type === "password";

            input.type = visible ? "text" : "password";
            button.textContent = visible ? "Hide" : "Show";
            button.setAttribute(
              "aria-label",
              visible ? "Hide password" : "Show password"
            );
            button.setAttribute(
              "aria-pressed",
              visible ? "true" : "false"
            );
          }
        );
      }
    );
  }

  function bindLoginPage() {
    var loginForm = document.getElementById("vw-login-form");
    var registerForm = document.getElementById("vw-register-form");

    if (!loginForm || !registerForm) {
      return;
    }

    var message = document.getElementById(
      "vw-auth-page-message"
    );

    var reason = queryReasonMessage();

    if (reason) {
      setMessage(message, reason, "info");
    }

    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!isProductionSite()) {
        localPreviewMessage(message);
        return;
      }

      var emailInput = document.getElementById(
        "vw-login-email"
      );

      var passwordInput = document.getElementById(
        "vw-login-password"
      );

      var button = document.getElementById(
        "vw-login-submit"
      );

      var email = emailInput.value.trim();
      var password = passwordInput.value;

      if (!email || !password) {
        setMessage(
          message,
          "Enter both your email address and password.",
          "error"
        );
        return;
      }

      setBusy(
        button,
        true,
        "Signing In...",
        "Sign In"
      );

      setMessage(message, "", "");

      try {
        var data = await apiRequest(
          "/auth/login",
          {
            method: "POST",
            body: {
              email: email,
              password: password
            }
          }
        );

        passwordInput.value = "";
        storeSession(data);

        window.location.assign("account.html");
      } catch (error) {
        passwordInput.value = "";

        setMessage(
          message,
          error.message || "Unable to sign in.",
          "error"
        );
      } finally {
        setBusy(
          button,
          false,
          "Signing In...",
          "Sign In"
        );
      }
    });

    registerForm.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();

        if (!isProductionSite()) {
          localPreviewMessage(message);
          return;
        }

        var emailInput = document.getElementById(
          "vw-register-email"
        );

        var passwordInput = document.getElementById(
          "vw-register-password"
        );

        var confirmInput = document.getElementById(
          "vw-register-confirm"
        );

        var button = document.getElementById(
          "vw-register-submit"
        );

        var email = emailInput.value.trim();
        var password = passwordInput.value;
        var confirm = confirmInput.value;

        if (!email || !password || !confirm) {
          setMessage(
            message,
            "Complete all account-creation fields.",
            "error"
          );
          return;
        }

        if (password.length < 12 || password.length > 200) {
          passwordInput.value = "";
          confirmInput.value = "";

          setMessage(
            message,
            "Password must be between 12 and 200 characters.",
            "error"
          );

          return;
        }
        if (password !== confirm) {
          passwordInput.value = "";
          confirmInput.value = "";

          setMessage(
            message,
            "The passwords do not match.",
            "error"
          );

          return;
        }

        setBusy(
          button,
          true,
          "Creating Account...",
          "Create Account"
        );

        setMessage(message, "", "");

        try {
          var data = await apiRequest(
            "/auth/register",
            {
              method: "POST",
              body: {
                email: email,
                password: password
              }
            }
          );

          passwordInput.value = "";
          confirmInput.value = "";
          registerForm.reset();

          var returnedEmail = (
            data &&
            data.email
          )
            ? String(data.email)
            : email;

          setMessage(
            message,
            "Account created for " + returnedEmail + ". Check your email for the VoltWorth verification link. After verification, return here to sign in.",
            "success"
          );
        } catch (error) {
          passwordInput.value = "";
          confirmInput.value = "";

          setMessage(
            message,
            error.message || "Unable to create the account.",
            "error"
          );
        } finally {
          setBusy(
            button,
            false,
            "Creating Account...",
            "Create Account"
          );
        }
      }
    );
  }

  function createEntitlementRow(item) {
    var row = document.createElement("div");
    row.className = "vw-entitlement-row";

    var name = document.createElement("strong");
    name.textContent = readableName(
      item.feature_key
    );

    var detail = document.createElement("span");

    var state = item.enabled
      ? "Enabled"
      : "Not enabled";

    if (
      item.limit_value !== null &&
      item.limit_value !== undefined
    ) {
      state += " \u2022 Limit " + String(item.limit_value);
    }

    detail.textContent = state;

    row.appendChild(name);
    row.appendChild(detail);

    return row;
  }

  function renderAccount(me, entitlements, usage) {
    var email = document.getElementById(
      "vw-account-email"
    );

    var status = document.getElementById(
      "vw-account-status"
    );

    var badge = document.getElementById(
      "vw-account-status-badge"
    );

    var plan = document.getElementById(
      "vw-account-plan"
    );

    var access = document.getElementById(
      "vw-account-access"
    );

    var aiUsed = document.getElementById(
      "vw-ai-used"
    );

    var aiRemaining = document.getElementById(
      "vw-ai-remaining"
    );

    var sessionExpires = document.getElementById(
      "vw-session-expires"
    );

    email.textContent = String(
      me.email || "VoltWorth Subscriber"
    );

    status.textContent = readableName(
      me.status
    );

    badge.textContent = readableName(
      me.status
    );

    plan.textContent = readableName(
      entitlements.plan_code
    );

    access.textContent = entitlements.access_allowed
      ? "Active"
      : "Inactive";

    var usageItems = Array.isArray(usage.items)
      ? usage.items
      : [];

    var aiRow = usageItems.find(function (item) {
      return item.feature_key === "ai_analysis_credit";
    });

    if (aiRow) {
      aiUsed.textContent = String(
        aiRow.used !== undefined
          ? aiRow.used
          : "?"
      );

      aiRemaining.textContent = String(
        aiRow.remaining !== undefined
          ? aiRow.remaining
          : "?"
      );
    }

    var expires = window.sessionStorage.getItem(
      EXPIRES_KEY
    );

    if (expires) {
      var parsed = new Date(expires);

      sessionExpires.textContent = Number.isNaN(
        parsed.getTime()
      )
        ? expires
        : parsed.toLocaleString();
    }

    var list = document.getElementById(
      "vw-entitlement-list"
    );

    list.textContent = "";

    var entitlementItems = Array.isArray(
      entitlements.entitlements
    )
      ? entitlements.entitlements
      : [];

    entitlementItems.forEach(function (item) {
      list.appendChild(
        createEntitlementRow(item)
      );
    });

    if (entitlementItems.length === 0) {
      var empty = document.createElement("p");
      empty.className = "vw-micro";
      empty.textContent = "No entitlement records were returned.";
      list.appendChild(empty);
    }
  }

  async function loadAccountPage() {
    var accountApp = document.getElementById(
      "vw-account-app"
    );

    if (!accountApp) {
      return;
    }

    var loading = document.getElementById(
      "vw-account-loading"
    );

    var message = document.getElementById(
      "vw-account-message"
    );

    if (!isProductionSite()) {
      loading.hidden = true;

      localPreviewMessage(message);
      return;
    }

    if (!getToken()) {
      window.location.replace(
        "login.html?reason=session-required"
      );
      return;
    }

    try {
      var results = await Promise.all([
        apiRequest("/me", {
          auth: true
        }),

        apiRequest("/me/entitlements", {
          auth: true
        }),

        apiRequest("/me/usage", {
          auth: true
        })
      ]);

      renderAccount(
        results[0],
        results[1],
        results[2]
      );

      loading.hidden = true;
      accountApp.hidden = false;
    } catch (error) {
      if (
        error.status === 401 ||
        error.status === 403
      ) {
        clearSession();

        window.location.replace(
          "login.html?reason=session-expired"
        );

        return;
      }

      loading.hidden = true;

      setMessage(
        message,
        error.message || "Unable to load your account.",
        "error"
      );
    }
  }

  function bindChangePassword() {
    var form = document.getElementById(
      "vw-change-password-form"
    );

    if (!form) {
      return;
    }

    var message = document.getElementById(
      "vw-change-password-message"
    );

    form.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();

        if (!isProductionSite()) {
          localPreviewMessage(message);
          return;
        }

        var currentInput = document.getElementById(
          "vw-current-password"
        );

        var newInput = document.getElementById(
          "vw-new-password"
        );

        var confirmInput = document.getElementById(
          "vw-confirm-new-password"
        );

        var button = document.getElementById(
          "vw-change-password-submit"
        );

        var currentPassword = currentInput.value;
        var newPassword = newInput.value;
        var confirmPassword = confirmInput.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
          setMessage(
            message,
            "Complete all password fields.",
            "error"
          );
          return;
        }

        if (newPassword.length < 12 || newPassword.length > 200) {
          newInput.value = "";
          confirmInput.value = "";

          setMessage(
            message,
            "New password must be between 12 and 200 characters.",
            "error"
          );
          return;
        }

        if (currentPassword === newPassword) {
          currentInput.value = "";
          newInput.value = "";
          confirmInput.value = "";

          setMessage(
            message,
            "New password must be different from the current password.",
            "error"
          );
          return;
        }

        if (newPassword !== confirmPassword) {
          newInput.value = "";
          confirmInput.value = "";

          setMessage(
            message,
            "The new passwords do not match.",
            "error"
          );
          return;
        }

        setBusy(
          button,
          true,
          "Changing Password...",
          "Change Password"
        );

        setMessage(message, "", "");

        try {
          await apiRequest(
            "/auth/change-password",
            {
              method: "POST",
              auth: true,
              body: {
                current_password: currentPassword,
                new_password: newPassword
              }
            }
          );

          form.reset();
          clearSession();

          window.location.replace(
            "login.html?reason=password-changed"
          );
        } catch (error) {
          currentInput.value = "";
          newInput.value = "";
          confirmInput.value = "";

          if (
            error.status === 401 ||
            error.status === 403
          ) {
            clearSession();

            window.location.replace(
              "login.html?reason=session-expired"
            );
            return;
          }

          setMessage(
            message,
            error.message || "Unable to change your password.",
            "error"
          );
        } finally {
          setBusy(
            button,
            false,
            "Changing Password...",
            "Change Password"
          );
        }
      }
    );
  }

  function bindLogout() {
    var button = document.getElementById(
      "vw-logout-button"
    );

    if (!button) {
      return;
    }

    var message = document.getElementById(
      "vw-account-message"
    );

    button.addEventListener(
      "click",
      async function () {
        if (!isProductionSite()) {
          localPreviewMessage(message);
          return;
        }

        setBusy(
          button,
          true,
          "Signing Out...",
          "Sign Out"
        );

        try {
          await apiRequest(
            "/auth/logout",
            {
              method: "POST",
              auth: true
            }
          );
        } catch (error) {
          // Server revocation is best-effort. Browser session cleanup
          // must still occur when the network or server is unavailable.
        } finally {
          clearSession();

          window.location.replace(
            "login.html?reason=logged-out"
          );
        }
      }
    );
  }

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      bindPasswordVisibility();
      bindLoginPage();
      bindChangePassword();
      bindLogout();
      loadAccountPage();
    }
  );
}());
