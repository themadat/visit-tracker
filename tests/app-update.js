// Run with macOS JavaScriptCore: jsc tests/app-update.js -- <scenario>
const scenario = arguments[0] || "auto";
let now = 100000, reloads = 0, flushed = 0, requests = [];
Date.now = () => now;
const intervals = [], events = {};
const button = { disabled: false, addEventListener: (name, fn) => { button.click = fn; } };
const status = { textContent: "" };
let dialogs = scenario === "editor" ? [{ id: "noteDialog" }] : [];
const document = {
  visibilityState: "visible", activeElement: { matches: () => false },
  getElementById: id => id === "forceUpdateBtn" ? button : status,
  addEventListener: (name, fn) => { events[name] = fn; },
  querySelectorAll: selector => selector === "dialog[open]" ? dialogs : [{ src: "https://example.test/beta/app.js" }]
};
const window = { addEventListener() {} };
const location = { protocol: scenario === "file" ? "file:" : "https:", href: "https://example.test/beta/index.html#map", replace: href => { if (!href.includes("/beta/") || !href.includes("#map")) throw Error("Lost channel/hash"); reloads++; } };
// Minimal URL stand-in; production uses the browser URL implementation.
function URL(href) { this.href = href; this.hash = ""; this.searchParams = { set: () => {} }; }
function setInterval(fn, ms) { intervals.push({ fn, ms }); }
async function fetch(url, options) {
  requests.push(options.cache);
  if (scenario === "offline") throw Error("offline");
  return { ok: true, text: async () => 'id="appNameLabel" const APP_VERSION = "' + (scenario === "same" || scenario === "force" ? "1.0.0" : "1.0.1") + '";', arrayBuffer: async () => [] };
}
load("assets/js/app-update.js");
initTrailLogUpdates({ version: "1.0.0", beforeReload: () => { flushed++; }, isBusy: () => scenario === "busy" });
async function settle() { for (let i = 0; i < 30; i++) await Promise.resolve(); }
(async () => {
  await settle();
  if (reloads) throw Error("Reloaded before idle");
  now += 61000;
  if (scenario === "force") button.click();
  else for (const timer of intervals) if (timer.ms === 15000) timer.fn();
  await settle();
  const expected = scenario === "auto" || scenario === "force" ? 1 : 0;
  if (reloads !== expected || flushed !== expected) throw Error("Unexpected reload count " + reloads);
  if (expected && !requests.includes("reload")) throw Error("Did not refresh assets");
  if (scenario === "file" && (!button.disabled || requests.length)) throw Error("Local file attempted update");
  print("PASS " + scenario);
})().catch(error => { print(error); quit(1); });
