(function () {
  var defaultStorageKey = "appInstallIconVariant";
  var storageKey = document.documentElement.dataset.iconVariantStorage || defaultStorageKey;
  var basePath = document.documentElement.dataset.iconBasePath || "";

  function asset(name) {
    return basePath ? basePath.replace(/\/?$/, "/") + name : name;
  }

  function storedVariant() {
    try {
      return localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
    } catch (err) {
      return "light";
    }
  }

  function writeVariant(variant) {
    try {
      localStorage.setItem(storageKey, variant);
    } catch (err) { }
  }

  function ensureLink(rel, attrs) {
    var selector = 'link[rel="' + rel + '"]';
    if (attrs && attrs.sizes) selector += '[sizes="' + attrs.sizes + '"]';
    if (attrs && attrs.type) selector += '[type="' + attrs.type + '"]';

    var link = document.querySelector(selector);
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      for (var key in attrs || {}) link.setAttribute(key, attrs[key]);
      document.head.appendChild(link);
    }
    return link;
  }

  function applyLinks(variant) {
    var isDark = variant === "dark";
    ensureLink("icon", { type: "image/svg+xml" }).href = asset("favicon.svg");
    ensureLink("apple-touch-icon").href = asset(isDark ? "apple-touch-icon-dark.png" : "apple-touch-icon.png");
    ensureLink("manifest").href = asset(isDark ? "manifest-dark.webmanifest" : "manifest.webmanifest");
    ensureLink("icon", { sizes: "32x32", type: "image/png" }).href = asset(isDark ? "favicon-32-dark.png" : "favicon-32.png");
    ensureLink("icon", { sizes: "16x16", type: "image/png" }).href = asset(isDark ? "favicon-16-dark.png" : "favicon-16.png");
  }

  function syncPicker(variant) {
    document.querySelectorAll("[data-app-icon-variant]").forEach(function (input) {
      input.checked = input.value === variant;
    });
  }

  function syncReloadNotice(needed) {
    document.querySelectorAll("[data-app-icon-reload-notice]").forEach(function (notice) {
      notice.hidden = !needed;
    });
  }

  function setVariant(variant, options) {
    var clean = variant === "dark" ? "dark" : "light";
    var before = storedVariant();
    var initial = options && options.initial;
    writeVariant(clean);
    applyLinks(clean);
    syncPicker(clean);
    syncReloadNotice(!initial && before !== clean);
    window.dispatchEvent(new CustomEvent("app-icon-variant-change", { detail: { variant: clean } }));
  }

  function bind() {
    setVariant(storedVariant(), { initial: true });

    document.addEventListener("change", function (event) {
      var target = event.target;
      if (target && target.matches && target.matches("[data-app-icon-variant]")) {
        setVariant(target.value);
      }
    });

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.closest && target.closest("[data-app-icon-reload]")) {
        location.reload();
      }
    });
  }

  window.AppIconSwitcher = {
    getVariant: storedVariant,
    setVariant: setVariant,
    applyLinks: applyLinks
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }
})();
