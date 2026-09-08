// The template's combined local/cloud control, hosted in Trail Log's top bar.
function initTrailLogSync(hooks) {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const icon = name => TRAIL_LOG_SYNC_ICONS[name] || TRAIL_LOG_SYNC_ICONS.icloud;
  let localAvailable = true;
  try { localStorage.setItem("trailLog.storageProbe", "1"); localStorage.removeItem("trailLog.storageProbe"); }
  catch { localAvailable = false; }
  const storage = createTrailLogSyncStorage({ ...hooks, storageFailed: () => { localAvailable = false; } });
  const model = createTrailLogSyncData({ ...hooks, defaultCloud: storage.defaults });
  const config = { cloudSync: storage.target, features: { cloudSync: true }, controls: { syncCheckIntervalMs: 5 * 60 * 1000 }, identity: { shortName: "Trail Log", version: hooks.version } };
  const utils = { clone: value => JSON.parse(JSON.stringify(value)), plainObject: value => value && typeof value === "object" ? value : {}, cleanLine: (value, limit) => String(value || "").replace(/[\r\n\t]/g, " ").trim().slice(0, limit), stableJson: model.stableJson, isoNow: () => new Date().toISOString() };

  function confirm(options) {
    return new Promise(resolve => {
      let accepted = false;
      hooks.requestConfirm({ title: options.title, message: options.message, actionLabel: options.confirmLabel,
        danger: options.danger === true, preserveOpenDialogs: true, onConfirm: () => { accepted = true; resolve(true); } });
      $("#confirmDialog").addEventListener("close", () => { if (!accepted) resolve(false); }, { once: true });
    });
  }
  function choose(options) {
    return new Promise(resolve => {
      const dialog = $("#syncChoiceDialog"), list = $("#syncChoices");
      let value = "";
      $("#syncChoiceTitle").textContent = options.title;
      $("#syncChoiceMessage").textContent = options.message;
      list.replaceChildren();
      options.choices.forEach(choice => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sync-choice" + (choice.kind === "primary" ? " primary" : "");
        button.innerHTML = '<span class="sync-choice-icon" aria-hidden="true">' + icon(choice.symbol) + '</span><span><strong></strong><small></small></span>';
        button.querySelector("strong").textContent = choice.label;
        button.querySelector("small").textContent = choice.description;
        button.addEventListener("click", () => { value = choice.value; dialog.close(); });
        list.append(button);
      });
      dialog.addEventListener("close", () => resolve(value), { once: true });
      dialog.showModal();
      list.querySelector("button")?.focus();
    });
  }
  const sync = createTrailLogSync({ config, utils, stateModel: model, storage, components: {
    confirm, choose, toast: (message, options = {}) => hooks.toast(options.title || "Data Sync", message), message: hooks.message
  } });
  function renderVisual(element, info) {
    element.dataset.kind = info.kind;
    element.dataset.syncState = info.state;
    element.dataset.animation = info.animation;
    const glyph = element.querySelector("[data-sync-icon]");
    if (glyph.dataset.symbol !== info.symbol) { glyph.innerHTML = icon(info.symbol); glyph.dataset.symbol = info.symbol; }
  }
  function renderPayload() {
    if (!$("#syncPayloadDetails").open) return;
    $("#syncPayloadJson").textContent = JSON.stringify(model.syncPayload(hooks.getState()), null, 2);
  }
  function render() {
    const info = sync.getInfo(), cloud = storage.readCloud(), button = $("#dataSyncBtn");
    renderVisual(button, info);
    button.disabled = info.busy;
    const localLabel = localAvailable ? "Saved locally" : "Storage unavailable";
    button.dataset.localStorage = localAvailable ? "available" : "unavailable";
    button.querySelector("[data-local-label]").textContent = localLabel;
    button.querySelector("[data-cloud-label]").textContent = "GitHub · " + info.title;
    button.title = localLabel + ". " + info.help + " " + info.action;
    button.setAttribute("aria-label", button.title);
    renderVisual($("#syncSettingsState"), info);
    $("#syncSettingsState [data-sync-label]").textContent = info.title;
    $("#syncStatusMessage").textContent = info.message;
    $("#syncLocalStatus").textContent = localAvailable ? "Browser storage is working. Your changes save automatically on this device." : "Browser storage is unavailable. Export a JSON backup before reloading.";
    $("#syncLastChecked").textContent = info.checkedAt ? "Last checked: " + new Date(info.checkedAt).toLocaleString() : "Not checked yet.";
    for (const [id, action, enabled] of [["syncNowButton", "syncNow", info.canSync], ["restoreCloudButton", "restore", info.canRestore]]) {
      const control = $("#" + id);
      control.querySelector("[data-sync-action-icon]").innerHTML = icon(sync.actions[action].symbol);
      control.disabled = !enabled;
      control.title = sync.actions[action].help;
    }
    const token = $("#syncToken"), remember = $("#syncRememberToken"), hasSecret = storage.hasSecret();
    if (token.dataset.dirty !== "true") token.value = storage.getSecret();
    if (remember.dataset.dirty !== "true") remember.checked = cloud.rememberToken;
    $("#storedTokenLabel").textContent = hasSecret ? (cloud.rememberToken ? "Stored on this device" : "Stored for this tab") : "Required";
    for (const id of ["saveSyncButton", "testSyncButton"]) $("#" + id).disabled = info.busy;
    $("#forgetSyncButton").disabled = info.busy || (!hasSecret && !cloud.enabled && !cloud.baselineHash);
    const recovery = storage.getRecovery();
    $("#syncRecoveryMessage").textContent = recovery ? "Saved " + new Date(recovery.createdAt).toLocaleString() + " · " + recovery.reason : "A recovery copy is saved before downloading or merging cloud content.";
    $("#restoreSyncRecoveryBtn").disabled = !recovery || info.busy;
    $("#exportSyncRecoveryBtn").disabled = !recovery;
    renderPayload();
  }
  function cleanFields() {
    delete $("#syncToken").dataset.dirty;
    delete $("#syncRememberToken").dataset.dirty;
  }
  function form() { return { ...storage.target, token: $("#syncToken").value, rememberToken: $("#syncRememberToken").checked }; }
  async function action(callback) {
    try { hooks.flushPending?.(); await callback(); }
    catch (error) { hooks.message("Data Sync", error.message || "The action could not be completed."); }
    finally { render(); }
  }
  function openSettings() { hooks.openSettings(); render(); $("#syncToken").focus(); }
  $("#dataSyncBtn").addEventListener("click", event => action(() => sync.syncNow(event.currentTarget)));
  $("#syncNowButton").addEventListener("click", event => action(() => sync.syncNow(event.currentTarget)));
  $("#restoreCloudButton").addEventListener("click", event => action(() => sync.restoreFromCloud(event.currentTarget)));
  $("#syncChoiceCancelBtn").addEventListener("click", () => $("#syncChoiceDialog").close());
  $("#saveSyncButton").addEventListener("click", () => action(async () => {
    sync.saveConfiguration(form()); cleanFields(); render();
    hooks.toast("Sync configured", "The connection was saved. Sync Now compares and transfers your saved content.");
    await sync.check(true);
  }));
  $("#testSyncButton").addEventListener("click", () => action(async () => {
    const result = await sync.testConnection(form());
    if (result) { cleanFields(); hooks.toast("Connection succeeded", result.message); }
  }));
  $("#forgetSyncButton").addEventListener("click", () => action(async () => {
    if (!await confirm({ title: "Forget GitHub token?", message: "Remove the token and sync history from this device? Your Trail Log and the GitHub file will stay as they are.", confirmLabel: "Forget token", danger: true })) return;
    await sync.forget(); cleanFields();
  }));
  $("#restoreSyncRecoveryBtn").addEventListener("click", () => action(async () => {
    const recovery = storage.getRecovery();
    if (!recovery || !await confirm({ title: "Restore recovery copy?", message: "Replace this device’s saved content with its pre-sync recovery copy? Device settings stay here. This does not change GitHub.", confirmLabel: "Restore recovery", danger: true })) return;
    storage.replace(model.applySync(hooks.getState(), model.prepareSync(recovery.state).state));
    hooks.toast("Recovery restored", "Your earlier content is back on this device. Sync Now can compare it with GitHub.");
  }));
  $("#exportSyncRecoveryBtn").addEventListener("click", () => {
    const recovery = storage.getRecovery();
    if (recovery) hooks.downloadFile("trail-log-recovery.json", "application/json", JSON.stringify(recovery.state, null, 2));
  });
  $("#syncToken").addEventListener("input", event => { event.currentTarget.dataset.dirty = "true"; });
  $("#syncRememberToken").addEventListener("change", event => { event.currentTarget.dataset.dirty = "true"; });
  $("#syncPayloadDetails").addEventListener("toggle", renderPayload);
  window.addEventListener("app:syncchange", render);
  window.addEventListener("app:opensyncsettings", openSettings);
  window.addEventListener("storage", event => { if (Object.values(storage.keys).includes(event.key)) render(); });
  sync.init();
  return { render, openSettings, saved: () => { localAvailable = true; render(); }, failed: () => { localAvailable = false; render(); } };
}
