(function () {
  var script = document.currentScript || document.querySelector('script[src$="add-as-app.js"]');
  var scriptUrl = script && script.src ? new URL(script.src, document.baseURI) : null;
  var data = script && script.dataset ? script.dataset : {};
  var basePath = data.addAsAppBase || (scriptUrl ? scriptUrl.href.replace(/[^/]*$/, "") : "");
  var manifestBlobUrl = "";
  var touchRenderToken = 0;
  var deferredPrompt = null;

  var config = {
    appName: data.appName || document.title || "App",
    shortName: data.appShortName || data.appName || document.title || "App",
    description: data.appDescription || "",
    themeLight: data.themeLight || "#f6f7f9",
    themeDark: data.themeDark || "#101318",
    iconLight: data.iconLight || "icons/app-icon-light.svg",
    iconDark: data.iconDark || "icons/app-icon-dark.svg",
    storageKey: data.storageKey || "addAsAppIconMode",
    startUrl: data.startUrl || "./",
    display: data.display || "standalone"
  };

  function asset(path) {
    try {
      return new URL(path, basePath || document.baseURI).href;
    } catch (err) {
      return path;
    }
  }

  function currentSystemMode() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function storedMode() {
    try {
      var mode = localStorage.getItem(config.storageKey);
      if (mode === "light" || mode === "dark") return mode;
    } catch (err) { }
    return "auto";
  }

  function selectedMode() {
    var mode = storedMode();
    return mode === "auto" ? currentSystemMode() : mode;
  }

  function writeMode(mode) {
    try {
      if (mode === "auto") localStorage.removeItem(config.storageKey);
      else localStorage.setItem(config.storageKey, mode === "dark" ? "dark" : "light");
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
      Object.keys(attrs || {}).forEach(function (key) {
        link.setAttribute(key, attrs[key]);
      });
      document.head.appendChild(link);
    }
    return link;
  }

  function closest(target, selector) {
    return target && target.closest ? target.closest(selector) : null;
  }

  function ensureMeta(name, content, attrs) {
    attrs = attrs || {};
    var metas = Array.prototype.slice.call(document.querySelectorAll('meta[name="' + name + '"]'));
    var meta = metas.find(function (item) {
      return !attrs.media || item.getAttribute("media") === attrs.media;
    });
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = name;
      Object.keys(attrs).forEach(function (key) {
        meta.setAttribute(key, attrs[key]);
      });
      document.head.appendChild(meta);
    }
    meta.content = content;
    return meta;
  }

  function injectMeta() {
    ensureMeta("application-name", config.appName);
    ensureMeta("apple-mobile-web-app-title", config.shortName);
    ensureMeta("apple-mobile-web-app-capable", "yes");
    ensureMeta("mobile-web-app-capable", "yes");
    ensureMeta("apple-mobile-web-app-status-bar-style", "default");
    ensureMeta("theme-color", config.themeLight, { media: "(prefers-color-scheme: light)" });
    ensureMeta("theme-color", config.themeDark, { media: "(prefers-color-scheme: dark)" });
    if (config.description) ensureMeta("description", config.description);
  }

  function iconUrlForMode(mode) {
    return asset(mode === "dark" ? config.iconDark : config.iconLight);
  }

  function writeManifest(iconUrl, mode) {
    if (manifestBlobUrl) URL.revokeObjectURL(manifestBlobUrl);
    var manifest = {
      name: config.appName,
      short_name: config.shortName,
      start_url: config.startUrl,
      display: config.display,
      background_color: mode === "dark" ? config.themeDark : config.themeLight,
      theme_color: mode === "dark" ? config.themeDark : config.themeLight,
      icons: [
        { src: iconUrl, sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
      ]
    };
    var blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/manifest+json" });
    manifestBlobUrl = URL.createObjectURL(blob);
    ensureLink("manifest").href = manifestBlobUrl;
  }

  function svgToPngTouchIcon(svgUrl, token) {
    return fetch(svgUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("icon fetch failed");
        return res.text();
      })
      .then(function (svgText) {
        return new Promise(function (resolve, reject) {
          var svgBlob = new Blob([svgText], { type: "image/svg+xml" });
          var objectUrl = URL.createObjectURL(svgBlob);
          var img = new Image();
          img.onload = function () {
            try {
              var canvas = document.createElement("canvas");
              canvas.width = 180;
              canvas.height = 180;
              canvas.getContext("2d").drawImage(img, 0, 0, 180, 180);
              URL.revokeObjectURL(objectUrl);
              resolve(canvas.toDataURL("image/png"));
            } catch (err) {
              URL.revokeObjectURL(objectUrl);
              reject(err);
            }
          };
          img.onerror = function () {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("icon image decode failed"));
          };
          img.src = objectUrl;
        });
      })
      .then(function (pngUrl) {
        if (token === touchRenderToken) ensureLink("apple-touch-icon").href = pngUrl;
      })
      .catch(function () {
        if (token === touchRenderToken) ensureLink("apple-touch-icon").href = svgUrl;
      });
  }

  function applyIcons() {
    var mode = selectedMode();
    var iconUrl = iconUrlForMode(mode);
    touchRenderToken += 1;
    document.documentElement.dataset.addAsAppIcon = mode;
    ensureLink("icon", { type: "image/svg+xml" }).href = iconUrl;
    ensureLink("apple-touch-icon").href = iconUrl;
    writeManifest(iconUrl, mode);
    svgToPngTouchIcon(iconUrl, touchRenderToken);
    window.dispatchEvent(new CustomEvent("add-as-app-icon-change", { detail: { mode: mode, iconUrl: iconUrl } }));
  }

  function setIconMode(mode) {
    writeMode(mode === "auto" ? "auto" : mode === "dark" ? "dark" : "light");
    applyIcons();
  }

  function fallbackInstructions() {
    var ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua)) return "Open Share, then choose Add to Home Screen.";
    if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) {
      return "Use File > Add to Dock, or Share > Add to Dock when available.";
    }
    return "Use your browser menu and choose Install app, Add to Dock, or Add to Home Screen.";
  }

  async function install() {
    if (deferredPrompt) {
      var promptEvent = deferredPrompt;
      deferredPrompt = null;
      document.documentElement.dataset.addAsAppPrompt = "used";
      promptEvent.prompt();
      return promptEvent.userChoice;
    }
    return { outcome: "unavailable", instructions: fallbackInstructions() };
  }

  function bindInstallControls() {
    document.addEventListener("click", function (event) {
      var installButton = closest(event.target, "[data-add-as-app-install]");
      if (installButton) {
        install().then(function (result) {
          installButton.dispatchEvent(new CustomEvent("add-as-app-install-result", {
            bubbles: true,
            detail: result
          }));
        });
      }

      var iconButton = closest(event.target, "[data-add-as-app-icon]");
      if (iconButton) setIconMode(iconButton.getAttribute("data-add-as-app-icon"));
    });
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    document.documentElement.dataset.addAsAppPrompt = "ready";
    window.dispatchEvent(new CustomEvent("add-as-app-install-ready"));
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    document.documentElement.dataset.addAsAppPrompt = "installed";
    window.dispatchEvent(new CustomEvent("add-as-app-installed"));
  });

  if (window.matchMedia) {
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () {
      if (storedMode() === "auto") applyIcons();
    };
    if (media.addEventListener) media.addEventListener("change", onChange);
    else if (media.addListener) media.addListener(onChange);
  }

  window.AddAsApp = {
    apply: applyIcons,
    install: install,
    setIconMode: setIconMode,
    getIconMode: storedMode,
    getSelectedIconMode: selectedMode,
    getFallbackInstructions: fallbackInstructions
  };

  injectMeta();
  applyIcons();
  bindInstallControls();
})();
