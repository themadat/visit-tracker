// Credentials and sync bookkeeping are device-local, outside usStateVisitMap.v1/backups.
function createTrailLogSyncStorage(hooks) {
  "use strict";
  const keys = Object.freeze({ metadata: "trailLog.sync.v1", secret: "trailLog.githubToken.v1", session: "trailLog.githubToken.session.v1", recovery: "trailLog.syncRecovery.v1" });
  const target = Object.freeze({ owner: "themadat", repo: "app-data", branch: "main", path: "data/visit-tracker.json" });
  const clone = value => JSON.parse(JSON.stringify(value));
  const defaults = () => ({ ...target, enabled: false, rememberToken: true, baselineTarget: "", baselineSha: "", baselineHash: "", lastSyncedAt: "", lastCheckedAt: "" });
  function read(key, store = localStorage) { try { return store.getItem(key) || ""; } catch { return ""; } }
  function readCloud() {
    let saved;
    try { saved = JSON.parse(read(keys.metadata)); } catch { saved = null; }
    const next = defaults();
    if (saved && typeof saved === "object") {
      next.enabled = saved.enabled === true;
      next.rememberToken = saved.rememberToken !== false;
      for (const key of ["baselineTarget", "baselineSha", "baselineHash", "lastSyncedAt", "lastCheckedAt"]) {
        if (typeof saved[key] === "string") next[key] = saved[key].slice(0, 600);
      }
    }
    return next;
  }
  function getSecret() { return read(keys.secret) || read(keys.session, sessionStorage); }
  function setSecret(token, remember) {
    try {
      if (remember) { localStorage.setItem(keys.secret, token); sessionStorage.removeItem(keys.session); }
      else { sessionStorage.setItem(keys.session, token); localStorage.removeItem(keys.secret); }
      return true;
    } catch { return false; }
  }
  function clearSecret() {
    localStorage.removeItem(keys.secret);
    sessionStorage.removeItem(keys.session);
  }
  function getRecovery() {
    try {
      const saved = JSON.parse(read(keys.recovery));
      return saved && typeof saved.createdAt === "string" && saved.state ? saved : null;
    } catch { return null; }
  }
  return { keys, target, defaults, readCloud, getRecovery, getSecret, setSecret, clearSecret,
    hasSecret: () => Boolean(getSecret()),
    getState: () => ({ ...hooks.getState(), modules: { cloudSync: readCloud() } }),
    mutate: callback => {
      const next = { modules: { cloudSync: readCloud() } };
      callback(next);
      localStorage.setItem(keys.metadata, JSON.stringify({ ...next.modules.cloudSync, ...target }));
    },
    saveRecovery: reason => {
      try {
        localStorage.setItem(keys.recovery, JSON.stringify({ createdAt: new Date().toISOString(), reason, state: clone(hooks.getState()) }));
        return true;
      } catch { return false; }
    },
    replace: next => {
      const clean = clone(next);
      delete clean.modules;
      // Persist successfully before swapping the live map/notes. A failed write keeps local content intact.
      try { localStorage.setItem(hooks.stateKey, JSON.stringify(clean)); }
      catch { hooks.storageFailed(); throw new Error("Browser storage could not save the downloaded content. The current local copy was kept."); }
      hooks.replaceState(clean);
    }
  };
}
