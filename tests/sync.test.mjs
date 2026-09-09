import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const clone = value => JSON.parse(JSON.stringify(value));
const response = (status, body = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
function memoryStorage() {
  const values = new Map();
  return { fail: false, getItem: key => values.get(key) || null, setItem(key, value) { if (this.fail) throw Error('Quota exceeded'); values.set(key, value); }, removeItem: key => values.delete(key), values };
}
function note(id = 'n1', details = 'Visited 🏕️') {
  return { id, date: '2026-09', levelId: 'visited', city: 'Chicago', where: '', what: '', who: '', lat: '', lng: '', geocodeLabel: '', details, visitTypes: [], priority: '3' };
}
function defaultState() {
  return { appVersion: '5.0.0.1', mapName: 'Your Trail Log', settings: { theme: 'dark' },
    levels: [{ id: 'visited', name: 'Visited', definition: 'Been there', countsTowardStats: true, isBucketList: false, color: '#123456' }],
    states: {}, notes: {}, world: { regions: {}, notes: {} }, basecamp: { pads: [], activePadId: '', legacyMigrated: true }, visitTypes: [], dismissedHints: ['local'] };
}
function harness({ token = 'test-token', online = true } = {}) {
  const events = [], requests = [], toasts = [], replacements = [];
  let current = defaultState();
  const localStorage = memoryStorage(), sessionStorage = memoryStorage();
  const listeners = new Map();
  const window = { addEventListener(name, fn) { listeners.set(name, fn); }, dispatchEvent(event) { events.push(event); listeners.get(event.type)?.(event); }, setInterval() {}, setTimeout() {} };
  const context = vm.createContext({ window, document: { addEventListener() {} }, navigator: { onLine: online }, localStorage, sessionStorage, TextEncoder, TextDecoder, Uint8Array, AbortController, atob, btoa,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    fetch: async (url, options) => { requests.push({ url, options }); return h.respond(url, options); } });
  for (const file of ['sync-data', 'sync-storage', 'sync', 'sync-icons']) vm.runInContext(readFileSync(new URL('../assets/js/' + file + '.js', import.meta.url), 'utf8'), context);
  const storage = context.createTrailLogSyncStorage({ stateKey: 'usStateVisitMap.v1', getState: () => current, replaceState: next => { replacements.push(next); current = next; }, storageFailed() {} });
  const model = context.createTrailLogSyncData({ defaultState, defaultCloud: storage.defaults, normalizeState: clone });
  const h = { context, model, storage, events, requests, toasts, replacements, localStorage, sessionStorage,
    get state() { return current; }, set state(next) { current = next; }, choice: '', confirmation: false, choices: [], get token() { return storage.getSecret(); } };
  const config = { cloudSync: storage.target, features: { cloudSync: true }, controls: { syncCheckIntervalMs: 300000 }, identity: { shortName: 'Trail Log', version: '5.0.0.1' } };
  const utils = { clone, plainObject: x => x, cleanLine: (x, n) => String(x || '').trim().slice(0, n), stableJson: model.stableJson, isoNow: () => new Date().toISOString() };
  h.sync = context.createTrailLogSync({ config, utils, stateModel: model, storage, components: {
    toast: (message, options) => toasts.push({ message, ...options }), message: (title, message) => toasts.push({ title, message }),
    choose: async options => { h.choices.push(options); return typeof h.choice === 'function' ? h.choice() : h.choice; }, confirm: async () => h.confirmation
  } });
  storage.mutate(state => { state.modules.cloudSync.enabled = true; });
  if (token) storage.setSecret(token, true);
  h.remote = clone(current);
  h.file = () => response(200, { type: 'file', encoding: 'base64', sha: 'remote-sha', content: Buffer.from(JSON.stringify(model.syncPayload(h.remote))).toString('base64') });
  h.respond = (url, options) => options.method === 'PUT' ? response(200, { content: { sha: 'saved-sha' } }) : h.file();
  h.setBaseline = () => storage.mutate(state => Object.assign(state.modules.cloudSync, { baselineTarget: 'themadat/app-data/main/data/visit-tracker.json', baselineSha: 'base-sha', baselineHash: model.syncHash(current) }));
  return h;
}

test('payload carries map/US/world/notes/Basecamp and excludes credentials, appearance and generated fields', () => {
  const h = harness();
  h.state.notes.CA = [note()]; h.state.states.CA = ['visited'];
  h.state.world.notes.FR = [note('n2')];
  h.state.basecamp.pads = [{ id: 'pad1', name: 'Trip', icon: 'book', html: '<p>Plan</p>', linkedNotes: [{ noteId: 'n1', regionCode: 'CA' }], created: '2026-09-01', updated: '2026-09-02', plainText: 'Plan' }];
  const payload = clone(h.model.syncPayload(h.storage.getState()));
  assert.equal(payload.data.notes.CA[0].details, 'Visited 🏕️');
  assert.equal(payload.data.world.notes.FR.length, 1);
  assert.deepEqual(Object.keys(payload.data.basecamp.pads[0]).sort(), ['html', 'icon', 'id', 'linkedNotes', 'name']);
  assert.doesNotMatch(JSON.stringify(payload), /test-token|settings|modules|appVersion|color|updated|created|plainText|activePadId/);
  const hash = h.model.syncHash(h.state); h.state.settings.theme = 'light'; h.state.levels[0].color = '#ffffff'; h.state.basecamp.pads[0].updated = '2030-01-01';
  assert.equal(h.model.syncHash(h.state), hash);
});

test('downloads preserve device settings, local legend colors and active pad', () => {
  const h = harness(); h.remote.notes.CA = [note()]; h.remote.levels[0].color = '#ffffff'; h.remote.settings.theme = 'light';
  const next = h.model.applySync(h.state, h.remote);
  assert.equal(next.settings.theme, 'dark'); assert.equal(next.levels[0].color, '#123456'); assert.equal(next.notes.CA[0].id, 'n1');
  assert.deepEqual(clone(next.dismissedHints), ['local']);
});

test('validation rejects another app, future schema, invalid IDs, duplicate notes, and over-limit pads', () => {
  const h = harness();
  for (const input of [{}, { syncFormat: 'local-first-app-data', syncVersion: 1, data: {} }, { ...h.model.syncPayload(h.state), syncVersion: 2 }]) assert.throws(() => h.model.prepareSync(input));
  const data = clone(h.model.syncPayload(h.state)); data.data.states.CA = ['unknown']; assert.throws(() => h.model.prepareSync(data));
  data.data.states = {}; data.data.notes.CA = [note(), note()]; assert.throws(() => h.model.prepareSync(data));
  data.data.notes = {}; data.data.basecamp.pads = Array.from({ length: 21 }, (_, i) => ({ id: String(i) })); assert.throws(() => h.model.prepareSync(data));
});

test('all fourteen cloud states have template glyphs and only syncing rotates', () => {
  const h = harness();
  assert.equal(Object.keys(h.sync.CloudSyncState).length, 14);
  for (const state of Object.values(h.sync.CloudSyncState)) {
    const info = h.sync.presentation(state);
    assert.ok(info.title && info.help);
    assert.equal(info.animation, state === 'syncing' ? 'rotate' : 'none');
    assert.ok(vm.runInContext('TRAIL_LOG_SYNC_ICONS', h.context)[info.symbol].includes('currentColor'));
  }
});

test('disabled, missing token and offline states open setup without network writes', async () => {
  const h = harness({ token: '' }); assert.equal(h.sync.getInfo().state, 'authenticationRequired');
  await h.sync.syncNow(); assert.equal(h.events.at(-1).type, 'app:opensyncsettings'); assert.equal(h.requests.length, 0);
  h.context.navigator.onLine = false; assert.equal(h.sync.getInfo().state, 'offline');
  h.storage.mutate(state => { state.modules.cloudSync.enabled = false; }); assert.equal(h.sync.getInfo().state, 'disabled');
});

test('connection config is pinned and token lives outside app state and exports', () => {
  const h = harness(); h.sync.saveConfiguration({ owner: 'evil', repo: 'other', path: 'bad.json', token: 'replacement', rememberToken: false });
  assert.equal(h.storage.readCloud().path, 'data/visit-tracker.json'); assert.equal(h.storage.readCloud().owner, 'themadat');
  assert.equal(h.localStorage.getItem(h.storage.keys.secret), null); assert.equal(h.sessionStorage.getItem(h.storage.keys.session), 'replacement');
  assert.doesNotMatch(JSON.stringify(h.state), /replacement|githubToken/);
});

test('equal content establishes baseline, checks never upload, local and remote changes queue', async () => {
  const h = harness(); await h.sync.check(true); assert.equal(h.sync.getInfo().state, 'upToDate');
  assert.ok(h.storage.readCloud().baselineHash.startsWith('data-v1:')); assert.equal(h.requests.some(r => r.options.method === 'PUT'), false);
  h.state.notes.CA = [note()]; assert.equal(h.sync.getInfo().change, 'local'); assert.equal(h.sync.getInfo().state, 'pending');
});

test('first sync requires an explicit copy choice; cancellation leaves both copies intact', async () => {
  const h = harness(); h.remote.notes.CA = [note()];
  await h.sync.syncNow(); assert.equal(h.choices.length, 1); assert.equal(h.replacements.length, 0); assert.equal(h.requests.some(r => r.options.method === 'PUT'), false);
});

test('missing file checks repository/branch and creates only after choosing Upload', async () => {
  const h = harness();
  h.respond = (url, options) => options.method === 'PUT' ? response(201, { content: { sha: 'created' } }) : url.includes('/contents/') ? response(404) : response(200);
  h.choice = 'upload'; await h.sync.syncNow();
  assert.equal(h.requests.length, 4); assert.equal(h.requests.at(-1).options.method, 'PUT');
  const body = JSON.parse(h.requests.at(-1).options.body); assert.equal(body.sha, undefined); assert.equal(body.branch, 'main');
});

test('401, 403, rate limit and server errors have distinct states', async () => {
  for (const [status, message, expected] of [[401, '', 'authenticationRequired'], [403, '', 'permissionDenied'], [403, 'API rate limit exceeded', 'warning'], [429, '', 'warning'], [500, '', 'failed']]) {
    const h = harness(); h.respond = () => response(status, { message }); await h.sync.check(true); assert.equal(h.sync.getInfo().state, expected);
  }
});

test('failed token test does not persist newly entered credentials', async () => {
  const h = harness({ token: '' }); h.respond = () => response(401);
  await assert.rejects(h.sync.testConnection({ token: 'bad-token' })); assert.equal(h.token, '');
});

test('successful connection test saves masked-input backing token without transferring content', async () => {
  const h = harness({ token: '' }); const result = await h.sync.testConnection({ token: 'valid-test-token', rememberToken: false });
  assert.equal(result.ok, true); assert.equal(h.token, 'valid-test-token'); assert.equal(h.sync.getInfo().state, 'connected');
  assert.equal(h.requests.some(r => r.options.method === 'PUT'), false);
});

test('local upload uses remote SHA and UTF-8; edits during upload remain pending', async () => {
  const h = harness(); h.setBaseline(); h.state.notes.CA = [note()];
  h.respond = (url, options) => {
    if (options.method !== 'PUT') return h.file();
    const body = JSON.parse(options.body); assert.equal(body.sha, 'remote-sha');
    assert.equal(JSON.parse(Buffer.from(body.content, 'base64').toString()).data.notes.CA[0].details, 'Visited 🏕️');
    h.state.notes.CA[0].details = 'Edited during upload'; return response(200, { content: { sha: 'saved' } });
  };
  await h.sync.syncNow(); assert.equal(h.sync.getInfo().change, 'local');
});

test('remote-only update downloads after recovery, keeping appearance', async () => {
  const h = harness(); h.setBaseline(); h.remote.notes.CA = [note()]; await h.sync.syncNow();
  assert.equal(h.state.notes.CA[0].id, 'n1'); assert.equal(h.state.settings.theme, 'dark');
  assert.equal(h.storage.getRecovery().state.notes.CA, undefined); assert.equal(h.sync.getInfo().state, 'upToDate');
});

test('storage quota/recovery failure blocks download', async () => {
  const h = harness(); h.setBaseline(); h.remote.notes.CA = [note()];
  await h.sync.check(true); h.localStorage.fail = true;
  // Force the next explicit check to fail safely as well: never replace user content.
  await h.sync.syncNow(); assert.equal(h.replacements.length, 0); assert.equal(h.state.notes.CA, undefined);
});

test('recovery failure during a confirmed restore blocks replacement', async () => {
  const h = harness(); h.setBaseline(); h.remote.notes.CA = [note()]; h.storage.saveRecovery = () => false; h.confirmation = true;
  await h.sync.check(true); await h.sync.restoreFromCloud(); assert.equal(h.replacements.length, 0); assert.equal(h.sync.getInfo().state, 'failed');
});

test('restore cancellation leaves the local copy untouched', async () => {
  const h = harness(); h.remote.notes.CA = [note()]; await h.sync.check(true); await h.sync.restoreFromCloud();
  assert.equal(h.replacements.length, 0);
});

test('merge keeps separate notes and regions but rejects conflicting edits and excessive pads', async () => {
  const h = harness(); h.setBaseline(); h.state.notes.CA = [note('local')]; h.remote.notes.FR = [note('remote')];
  assert.equal(h.model.canMerge(h.state, h.remote), true); h.choice = 'merge'; await h.sync.syncNow();
  assert.ok(h.state.notes.CA && h.state.notes.FR); assert.ok(h.storage.getRecovery());
  h.remote = clone(h.state); h.remote.notes.CA[0].details = 'Other edit'; assert.equal(h.model.canMerge(h.state, h.remote), false);
});

test('local edits during a copy choice cancel the stale download', async () => {
  const h = harness(); h.remote.notes.CA = [note()]; h.choice = () => { h.state.notes.NY = [note('new')]; return 'download'; };
  await h.sync.syncNow(); assert.equal(h.replacements.length, 0); assert.ok(h.state.notes.NY);
});

test('SHA conflict preserves baseline and local content', async () => {
  const h = harness(); h.setBaseline(); const baseline = h.storage.readCloud().baselineHash; h.state.notes.CA = [note()];
  h.respond = (url, options) => options.method === 'PUT' ? response(409) : h.file();
  await h.sync.syncNow(); assert.equal(h.sync.getInfo().state, 'warning'); assert.equal(h.storage.readCloud().baselineHash, baseline); assert.ok(h.state.notes.CA);
});

test('forget clears both token stores and sync history without erasing content', async () => {
  const h = harness(); h.setBaseline(); h.state.notes.CA = [note()]; await h.sync.forget();
  assert.equal(h.token, ''); assert.equal(h.sync.getInfo().state, 'disabled'); assert.equal(h.storage.readCloud().baselineHash, ''); assert.ok(h.state.notes.CA);
});

test('large GitHub files use raw content with a matching revision check', async () => {
  const h = harness();
  h.respond = (url, options) => options.headers.Accept === 'application/vnd.github.raw+json'
    ? { ...response(200), text: async () => JSON.stringify(h.model.syncPayload(h.remote)) }
    : response(200, { type: 'file', encoding: 'none', content: '', sha: 'large-sha', size: 1100000 });
  await h.sync.check(true); assert.equal(h.sync.getInfo().state, 'upToDate'); assert.equal(h.requests.length, 3);
});

test('a changed revision during a large-file read cannot establish a baseline', async () => {
  const h = harness(); let count = 0;
  h.respond = (url, options) => options.headers.Accept === 'application/vnd.github.raw+json'
    ? { ...response(200), text: async () => JSON.stringify(h.model.syncPayload(h.remote)) }
    : response(200, { type: 'file', encoding: 'none', content: '', sha: ++count === 1 ? 'old' : 'new', size: 1100000 });
  await h.sync.check(true); assert.equal(h.sync.getInfo().state, 'warning'); assert.equal(h.storage.readCloud().baselineHash, '');
});

test('a failed local replacement write never changes the live state', () => {
  const h = harness(); const previous = h.state; h.localStorage.fail = true;
  assert.throws(() => h.storage.replace({ ...h.state, notes: { CA: [note()] } }));
  assert.equal(h.state, previous); assert.equal(h.replacements.length, 0);
});
