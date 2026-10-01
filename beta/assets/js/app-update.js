// App-code updates are independent of optional cloud data sync.
function initTrailLogUpdates({ version, beforeReload, isBusy }) {
  const button = document.getElementById("forceUpdateBtn");
  const status = document.getElementById("appUpdateStatus");
  const hosted = /^https?:$/.test(location.protocol);
  let checking = false;
  let pending = false;
  let lastActivity = Date.now();
  let lastCheck = 0;
  const say = text => { status.textContent = text; };
  const active = () => { lastActivity = Date.now(); };
  for (const event of ["pointerdown", "keydown", "input", "wheel"]) {
    document.addEventListener(event, active, { passive: true });
  }
  function safeToReload(manual) {
    const dialogs = [...document.querySelectorAll("dialog[open]")];
    return !isBusy() && !dialogs.some(dialog => !manual || dialog.id !== "settingsDialog") &&
      (manual || (document.visibilityState === "visible" && Date.now() - lastActivity >= 60000 &&
        !document.activeElement?.matches("input, textarea, select, [contenteditable='true']")));
  }
  async function check(manual = false) {
    if (!hosted || checking || (!manual && document.visibilityState !== "visible")) return;
    if (manual && !safeToReload(true)) {
      say("Finish editing or syncing, then try Force Update again.");
      return;
    }
    if (!manual && !pending && Date.now() - lastCheck < 60000) return;
    checking = true;
    button.disabled = true;
    try {
      if (!pending || manual) {
        lastCheck = Date.now();
        if (manual) say("Checking for the latest app…");
        const url = new URL(location.href);
        url.hash = "";
        url.searchParams.set("_tlUpdate", Date.now());
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("App download failed");
        const html = await response.text();
        const match = html.match(/const APP_VERSION = "(\d+\.\d+\.\d+(?:\.\d+)?)";/);
        if (!match || !html.includes('id="appNameLabel"')) throw new Error("Invalid app response");
        pending = manual || match[1] !== version;
      }
      if (!pending) return;
      if (!safeToReload(manual)) {
        say("An app update is ready. It will install when the app is idle and editors are closed.");
        return;
      }
      say("Downloading app files…");
      // Refresh cached companion files too, including same-version forced reloads.
      const urls = [...document.querySelectorAll("script[src], link[rel='stylesheet']")]
        .map(element => element.src || element.href);
      await Promise.all(urls.map(async url => {
        const response = await fetch(url, { cache: "reload" });
        if (!response.ok) throw new Error("Asset download failed");
        await response.arrayBuffer();
      }));
      // The user may have started editing while the download was in flight.
      if (!safeToReload(manual)) return;
      beforeReload();
      const destination = new URL(location.href);
      destination.searchParams.set("_tlUpdate", Date.now());
      location.replace(destination.href);
    } catch (error) {
      pending = false;
      say("Could not update the app. Your data is still here; try again when connected.");
    } finally {
      checking = false;
      button.disabled = false;
    }
  }
  button.disabled = !hosted;
  if (!hosted) {
    say("Automatic updates require the hosted app. Replace local files to update this copy.");
    return;
  }
  button.addEventListener("click", () => check(true));
  document.addEventListener("visibilitychange", () => check());
  window.addEventListener("online", () => check());
  setInterval(() => check(), 300000);
  setInterval(() => { if (pending) check(); }, 15000);
  check();
}
