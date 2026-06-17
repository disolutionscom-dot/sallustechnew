/**
 * Dispatch (Drive Relay) — Apps Script backend
 * ------------------------------------------------------------------
 * A code-based, device-to-device file transfer that works anywhere
 * Google does, including inside Google Sites embeds and locked-down
 * networks where WebRTC is blocked.
 *
 * How it works:
 *   • The sender creates a session  -> gets a short code.
 *   • Files are chunked and uploaded into a per-session Drive folder.
 *   • The receiver enters the code, sees the files, and downloads them
 *     chunk by chunk. The browser reassembles each file locally.
 *   • Sessions self-delete after TTL_HOURS (set a daily trigger).
 *
 * The UI is served by HtmlService and calls these functions through
 * google.script.run — so there is no CORS, fetch, or cross-origin step
 * that an embed could block.
 * ------------------------------------------------------------------
 */

var ROOT_NAME   = 'Dispatch Relay';   // root Drive folder (auto-created)
var TTL_HOURS   = 24;                  // sessions older than this are purged
var PART_PREFIX = 'p_';               // chunk file naming
var MANIFEST    = 'manifest.json';

/* ---------- Web app entry point ---------- */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Dispatch')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // allow Google Sites embed
}

/* ---------- Config ---------- */

function getConfig() {
  var url = '';
  try { url = ScriptApp.getService().getUrl(); } catch (e) {}
  return { url: url, ttlHours: TTL_HOURS };
}

/* ---------- Session lifecycle ---------- */

function createSession() {
  var root = getRoot_();
  var code, guard = 0;
  do { code = makeCode_(); guard++; } while (folderByName_(root, code) && guard < 25);
  var folder = root.createFolder(code);
  writeManifest_(folder, { code: code, created: new Date().toISOString(), files: [] });
  return code;
}

function listSession(code) {
  var folder = sessionFolder_(code);
  return readManifest_(folder);
}

/* ---------- Upload ---------- */

function uploadChunk(code, fileKey, mime, index, b64) {
  var folder = sessionFolder_(code);
  var name = PART_PREFIX + fileKey + '_' + index;
  removeByName_(folder, name); // make retries idempotent
  var bytes = Utilities.base64Decode(b64);
  var blob = Utilities.newBlob(bytes, mime || 'application/octet-stream', name);
  folder.createFile(blob);
  return true;
}

function finalizeFile(code, fileKey, fileName, mime, parts, size) {
  var folder = sessionFolder_(code);
  var m = readManifest_(folder);
  m.files = (m.files || []).filter(function (f) { return f.key !== fileKey; });
  m.files.push({
    key: fileKey,
    name: fileName,
    mime: mime || 'application/octet-stream',
    size: size,
    parts: parts,
    ready: true
  });
  writeManifest_(folder, m);
  return true;
}

/* ---------- Download ---------- */

function getFileInfo(code, fileKey) {
  var m = readManifest_(sessionFolder_(code));
  var hit = (m.files || []).filter(function (f) { return f.key === fileKey; })[0];
  if (!hit) throw new Error('That file is no longer available.');
  return hit;
}

function downloadChunk(code, fileKey, index) {
  var folder = sessionFolder_(code);
  var it = folder.getFilesByName(PART_PREFIX + fileKey + '_' + index);
  if (!it.hasNext()) throw new Error('Missing part ' + index + ' — the sender may still be uploading.');
  return Utilities.base64Encode(it.next().getBlob().getBytes());
}

/* ---------- Maintenance ---------- */

// Add a daily time-driven trigger on this function to keep Drive tidy.
function cleanupOldSessions() {
  var root = getRoot_();
  var cutoff = Date.now() - TTL_HOURS * 3600 * 1000;
  var it = root.getFolders();
  while (it.hasNext()) {
    var f = it.next();
    if (f.getDateCreated().getTime() < cutoff) f.setTrashed(true);
  }
}

/* ---------- Helpers ---------- */

function getRoot_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('rootId');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var f = DriveApp.createFolder(ROOT_NAME);
  props.setProperty('rootId', f.getId());
  return f;
}

function sessionFolder_(code) {
  var f = folderByName_(getRoot_(), String(code || '').toLowerCase().trim());
  if (!f) throw new Error('No transfer found for that code. Check it and try again.');
  return f;
}

function folderByName_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : null;
}

function removeByName_(folder, name) {
  var it = folder.getFilesByName(name);
  while (it.hasNext()) it.next().setTrashed(true);
}

function readManifest_(folder) {
  var it = folder.getFilesByName(MANIFEST);
  if (!it.hasNext()) return { code: folder.getName(), created: '', files: [] };
  return JSON.parse(it.next().getBlob().getDataAsString());
}

function writeManifest_(folder, obj) {
  removeByName_(folder, MANIFEST);
  folder.createFile(MANIFEST, JSON.stringify(obj), MimeType.PLAIN_TEXT);
}

function makeCode_() {
  var a = 'abcdefghjkmnpqrstuvwxyz23456789', s = '';
  for (var i = 0; i < 6; i++) s += a.charAt(Math.floor(Math.random() * a.length));
  return s;
}
