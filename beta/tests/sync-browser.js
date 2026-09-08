// Runs only inside the isolated test page, with memory storage and a fake GitHub API.
window.runSyncIntegrationTests = async function () {
  const output = [];
  const check = (ok, label) => { if (!ok) throw new Error(label); output.push('PASS ' + label); };
  const delay = () => new Promise(resolve => setTimeout(resolve, 25));
  const until = async fn => { for (let i = 0; i < 200; i++) { if (fn()) return; await delay(); } throw new Error('Timed out waiting for sync UI'); };
  const $test = id => document.getElementById(id);
  const model = createTrailLogSyncData({ normalizeState, defaultState, defaultCloud: () => ({}) });
  try {
    check(!__syncTest.errors.length, 'App initializes without runtime errors');
    check(document.querySelector('.toolbar').firstElementChild.id === 'dataSyncBtn', 'Sync is the leftmost top-bar action');
    check(!['fixed', 'absolute'].includes(getComputedStyle($test('dataSyncBtn')).position), 'Sync is in toolbar flow');
    const local = normalizeState(defaultState());
    local.countriesSeeded = true;
    const id = local.levels[0].id;
    local.notes.CA = [normalizeNote({ id: 'test-note', date: '2026-09', details: 'Camp 🏕️', levelId: id, lat: 37.1, lng: -120.1, priority: '4' }, 'CA', local, new Set(local.levels.map(x => x.id)))];
    local.world.notes.FR = [normalizeNote({ id: 'test-world-note', date: '2026', details: 'Paris', levelId: id }, 'FR', local, new Set(local.levels.map(x => x.id)))];
    local.basecamp = normalizeBasecampState({ pads: [{ id: 'test-pad', name: 'Trip', icon: BASECAMP_PAD_DEFAULT_ICON, html: '<p>Itinerary <strong>Paris</strong></p>', linkedNotes: [{ noteId: 'test-world-note', regionCode: 'FR' }] }] }, local);
    const payload = model.syncPayload(local);
    check(model.syncHash(model.prepareSync(payload).state) === model.syncHash(local), 'Actual normalization round-trips notes, coordinates, dates and Basecamp links');
    const themed = normalizeState(defaultState()); themed.settings.theme = 'dark'; themed.levels[0].color = '#f97316';
    const downloaded = model.applySync(themed, local);
    check(downloaded.settings.theme === 'dark' && downloaded.levels[0].color === '#f97316', 'Actual download keeps local appearance and level colors');
    check(downloaded.world.notes.FR[0].date === '2026' && downloaded.basecamp.pads[0].linkedNotes[0].noteId === 'test-world-note', 'World notes and linked rich-text pads survive download');
    check(model.syncHash(model.prepareSync(local).state) === model.syncHash(local), 'Existing full JSON backups can seed cloud sync');
    const unsafe = JSON.parse(JSON.stringify(payload)); unsafe.data.basecamp.pads[0].html = '<img src=x onerror=alert(1)>';
    let rejected = false; try { model.prepareSync(unsafe); } catch { rejected = true; }
    check(rejected, 'Unsafe rich text is rejected before replacement');
    // Every bundled pack must survive the same content contract.
    for (const set of SUGGESTED_SETS) {
      const item = set.items?.[0];
      if (!item) continue;
      const packed = clone(local);
      packed.notes.CA[0] = normalizeNote({ ...packed.notes.CA[0], sourceSetId: set.id, sourceItemId: item.id, sourceSetGenerated: true, visitTypes: [set.defaultIconId] }, 'CA', packed, new Set(packed.levels.map(x => x.id)));
      model.prepareSync(model.syncPayload(normalizeState(packed)));
    }
    check(true, 'Bundled Waypoint Pack metadata round-trips');
    const sparse = clone(local); sparse.notes.CA = [{ id: 'sparse-note', date: '2026', levelId: id, details: 'Quick selection', text: 'Quick selection', where: '', what: '', who: '', visitTypes: [] }];
    model.prepareSync(model.syncPayload(sparse));
    check(true, 'Sparse quick-select notes can be synced before reloading');
    const set = SUGGESTED_SETS[0], item = set.items[0], customIcon = [...PACK_ICON_ID_SET].find(icon => icon !== set.defaultIconId);
    if (customIcon) {
      const packed = clone(local); packed.settings.suggestedSetIcons[set.id] = customIcon;
      packed.notes.CA[0] = normalizeNote({ ...packed.notes.CA[0], sourceSetId: set.id, sourceItemId: item.id, sourceSetGenerated: true, visitTypes: [customIcon] }, 'CA', packed, new Set(packed.levels.map(x => x.id)));
      model.prepareSync(model.syncPayload(normalizeState(packed)));
      check(true, 'Customized Waypoint Pack icons do not block content sync');
    }
    $test('dataSyncBtn').click();
    check($test('settingsDialog').open && $test('tab-dataSync').classList.contains('active'), 'Top-bar setup opens Data Sync settings');
    $test('syncPayloadDetails').open = true; await delay();
    check(JSON.parse($test('syncPayloadJson').textContent).syncFormat === 'trail-log-data', 'JSON preview shows the actual sync envelope');
    __syncTest.remote = model.syncPayload(state);
    $test('syncToken').value = 'synthetic-test-token'; $test('syncToken').dispatchEvent(new Event('input'));
    $test('testSyncButton').click();
    await until(() => $test('storedTokenLabel').textContent === 'Stored on this device');
    check($test('syncToken').type === 'password' && $test('syncToken').value === 'synthetic-test-token', 'Successful connection keeps token masked and marked stored');
    check(__syncTest.writes.length === 0, 'Test connection does not upload data');
    $test('syncNowButton').click(); await until(() => $test('dataSyncBtn').dataset.syncState === 'upToDate');
    check(true, 'Equal content establishes an Up to Date baseline');
    __syncTest.remote = model.syncPayload(local);
    $test('restoreCloudButton').click(); await until(() => $test('confirmDialog').open);
    $test('confirmCancelBtn').click(); await delay();
    check(!state.notes.CA?.some(x => x.id === 'test-note'), 'Cancelling Restore keeps local content');
    $test('restoreCloudButton').click(); await until(() => $test('confirmDialog').open); $test('confirmActionBtn').click();
    await until(() => state.notes.CA?.some(x => x.id === 'test-note'));
    check(JSON.parse(localStorage.getItem('trailLog.syncRecovery.v1')).state.notes.CA === undefined, 'Confirmed restore saves a recovery copy before replacement');
    check($test('mapTitle').textContent === local.mapName && !$test('restoreSyncRecoveryBtn').disabled, 'Restored content renders and recovery is available');
    state.notes.CA[0].details = state.notes.CA[0].text = 'Edited on this device'; save();
    const remote = clone(local); remote.notes.CA[0].details = remote.notes.CA[0].text = 'Edited on other device'; __syncTest.remote = model.syncPayload(remote);
    $test('syncNowButton').click(); await until(() => $test('syncChoiceDialog').open);
    check($test('syncChoices').children.length === 2, 'Conflicting note edits offer upload/download without an unsafe merge');
    $test('syncChoiceCancelBtn').click(); await delay();
    check(state.notes.CA[0].details === 'Edited on this device', 'Cancelling conflict leaves the local edit intact');
    check(!JSON.stringify(model.syncPayload(state)).includes('synthetic-test-token'), 'Credentials stay out of payload and JSON preview');
    check(!__syncTest.errors.length, 'No runtime errors throughout sync controls');
    parent.postMessage({ syncTest: true, message: output.join('\n') + '\nAll integration tests passed.' }, '*');
  } catch (error) {
    parent.postMessage({ syncTest: true, failed: true, message: output.join('\n') + '\nFAIL ' + error.message + '\n' + error.stack }, '*');
  }
};
parent.postMessage({ syncTest: true, message: 'App ready. Run integration tests; all writes use in-memory storage and a simulated GitHub API.' }, '*');
