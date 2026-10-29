/**
 * Northbound Web: enquiry inbox (Google Apps Script)
 *
 * The website's enquiry form (src/lib/contact/actions.ts) POSTs each enquiry
 * here. This script then:
 *   1. emails it to you from your own Google account (reply goes to the
 *      person who enquired), and
 *   2. adds a row to a Google Sheet, so there is a log even if an email is
 *      missed.
 *
 * ── SETUP (once, about 5 minutes) ─────────────────────────────────────────
 * 1. Sign in as the Google account that should receive enquiries
 *    (che@northboundweb.co.uk).
 * 2. Create a Google Sheet called "Northbound enquiries". Copy its ID from the
 *    address bar: docs.google.com/spreadsheets/d/<THIS PART>/edit
 * 3. Go to script.google.com → New project → delete the sample code → paste
 *    this whole file → name the project "Northbound enquiries".
 * 4. Project Settings (cog) → Script properties → Add script property:
 *        SHARED_SECRET = a long random string (30+ characters; a password
 *                        manager will generate one). The website needs the
 *                        same value.
 *        SHEET_ID      = the Sheet ID from step 2
 *        NOTIFY_TO     = (optional) another address to send enquiries to.
 *                        Leave it out to use the account you are signed in as.
 * 5. Pick the function "testEnquiry" in the toolbar and press Run. Google asks
 *    you to authorise the script (email + Sheets). Allow it. You should get a
 *    test email, and a row in the Sheet.
 * 6. Deploy → New deployment → type "Web app":
 *        Execute as:      Me
 *        Who has access:  Anyone
 *    ("Anyone" is needed so the website's server can call it. The secret in
 *    step 4 is what keeps strangers out.) Copy the Web app URL.
 * 7. In Vercel → Project → Settings → Environment Variables add:
 *        ENQUIRY_WEBHOOK_URL   = the Web app URL from step 6
 *        ENQUIRY_WEBHOOK_TOKEN = the SHARED_SECRET from step 4
 *    Keep both server-side. Never prefix them NEXT_PUBLIC_.
 *
 * ── CHANGING THIS SCRIPT LATER ────────────────────────────────────────────
 * Edits are NOT live until you Deploy → Manage deployments → pencil icon →
 * Version: New version → Deploy. The URL stays the same.
 *
 * ── LIMITS ────────────────────────────────────────────────────────────────
 * Google caps emails a script can send per day (about 1,500 on Google
 * Workspace, 100 on a free account). Every enquiry is also written to the
 * Sheet first, so nothing is lost if the cap is ever hit.
 */

var FIELDS = ['name', 'email', 'business', 'projectType', 'budget', 'message'];
var MAX_LEN = { name: 120, email: 254, business: 160, projectType: 120, budget: 60, message: 8000 };
/** Photos sent with a free-build request: at most this many, each at most this many bytes. */
var MAX_PHOTOS = 6;
var MAX_PHOTO_BYTES = 1500000;
var PHOTO_FOLDER = 'Northbound enquiry photos';
var SHEET_TAB = 'Enquiries';
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Opening the Web app URL in a browser shows this, which confirms it deployed. */
function doGet() {
  return reply_({ ok: true, service: 'northbound-enquiries' });
}

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('SHARED_SECRET');
    if (!secret || secret.length < 16) return reply_({ ok: false, error: 'not-configured' });

    var data;
    try {
      data = JSON.parse((e && e.postData && e.postData.contents) || '');
    } catch (parseError) {
      return reply_({ ok: false, error: 'bad-request' });
    }
    if (!data || typeof data !== 'object') return reply_({ ok: false, error: 'bad-request' });

    if (!safeEqual_(String(data.token || ''), secret)) return reply_({ ok: false, error: 'unauthorised' });

    // Same checks as the website, repeated here so this endpoint is safe on its own.
    var enquiry = {};
    FIELDS.forEach(function (field) {
      var raw = data[field] == null ? '' : String(data[field]);
      var cleaned = field === 'message' ? raw.replace(/\r\n?/g, '\n') : oneLine_(raw);
      enquiry[field] = cleaned.trim().slice(0, MAX_LEN[field]);
    });
    if (enquiry.name.length < 2 || !EMAIL_RE.test(enquiry.email) || enquiry.message.length < 1) {
      return reply_({ ok: false, error: 'invalid' });
    }

    // The same enquiry arriving twice (a double click, a retry) is only handled once.
    var ref = oneLine_(String(data.id || '')).slice(0, 64);
    var cache = CacheService.getScriptCache();
    if (ref && cache.get('enq:' + ref)) return reply_({ ok: true, duplicate: true });

    var receivedAt = new Date();
    var logged = false;
    var emailed = false;

    // Photos (optional): saved to Drive in a folder per request and attached to the email.
    var photos = [];
    var photoLink = '';
    try {
      var saved = savePhotos_(data.photos, ref || String(receivedAt.getTime()));
      photos = saved.blobs;
      photoLink = saved.url;
    } catch (photoError) {
      console.error('Photos not saved: ' + photoError);
    }
    if (photoLink) enquiry.message += '\n\nPhotos: ' + photoLink;

    try {
      logged = logToSheet_(props.getProperty('SHEET_ID'), receivedAt, enquiry, ref);
    } catch (sheetError) {
      console.error('Sheet log failed: ' + sheetError);
    }

    try {
      emailed = sendEmail_(props.getProperty('NOTIFY_TO'), receivedAt, enquiry, photos);
    } catch (mailError) {
      console.error('Email failed: ' + mailError);
    }

    // Success means the enquiry reached at least one place a human will see it.
    if (!logged && !emailed) return reply_({ ok: false, error: 'not-delivered' });

    if (ref) cache.put('enq:' + ref, '1', 21600);
    return reply_({ ok: true, emailed: emailed, logged: logged });
  } catch (error) {
    console.error('Unexpected error: ' + error);
    return reply_({ ok: false, error: 'server-error' });
  }
}

/** Run this from the editor to authorise the script and check the whole chain. */
function testEnquiry() {
  var secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
  var result = doPost({
    postData: {
      contents: JSON.stringify({
        token: secret,
        id: 'test-' + new Date().getTime(),
        name: 'Test Person',
        email: 'test@example.com',
        business: 'Test Business',
        projectType: 'Pro build',
        budget: '',
        message: 'This is a test enquiry from the Apps Script editor. If you can read it, the inbox works.',
      }),
    },
  });
  console.log(result.getContent());
}

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Accepts [{ name, type, data }] where data is base64 JPEG/PNG/WebP. Anything
 * else, oversized or beyond MAX_PHOTOS is skipped. Returns the blobs (for the
 * email) and a link to the Drive folder they were saved in.
 */
function savePhotos_(list, ref) {
  var out = { blobs: [], url: '' };
  if (!list || !list.length) return out;
  var allowed = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  var blobs = [];
  for (var i = 0; i < list.length && blobs.length < MAX_PHOTOS; i++) {
    var p = list[i] || {};
    var type = String(p.type || '');
    if (!allowed[type]) continue;
    var bytes;
    try {
      bytes = Utilities.base64Decode(String(p.data || ''));
    } catch (decodeError) {
      continue;
    }
    if (!bytes.length || bytes.length > MAX_PHOTO_BYTES) continue;
    var name = 'photo-' + (blobs.length + 1) + '.' + allowed[type];
    blobs.push(Utilities.newBlob(bytes, type, name));
  }
  if (!blobs.length) return out;
  var parents = DriveApp.getFoldersByName(PHOTO_FOLDER);
  var root = parents.hasNext() ? parents.next() : DriveApp.createFolder(PHOTO_FOLDER);
  var folder = root.createFolder(oneLine_(ref).slice(0, 60));
  blobs.forEach(function (b) { folder.createFile(b); });
  out.blobs = blobs;
  out.url = folder.getUrl();
  return out;
}


function sendEmail_(notifyTo, receivedAt, enquiry, photos) {
  var to = notifyTo || Session.getEffectiveUser().getEmail();
  var subject = 'New enquiry: ' + enquiry.name + (enquiry.business ? ' (' + enquiry.business + ')' : '');
  var rows = [
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Business', enquiry.business || '-'],
    ['Project type', enquiry.projectType || '-'],
    ['Budget', enquiry.budget || '-'],
  ];
  var text = rows
    .map(function (r) { return r[0] + ': ' + r[1]; })
    .join('\n') + '\n\n' + enquiry.message;
  var html =
    '<table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">' +
    rows
      .map(function (r) {
        return '<tr><td style="padding:4px 16px 4px 0;color:#666">' + r[0] +
          '</td><td style="padding:4px 0"><strong>' + escapeHtml_(r[1]) + '</strong></td></tr>';
      })
      .join('') +
    '</table><hr style="margin:20px 0;border:none;border-top:1px solid #e5e5e5">' +
    '<p style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap">' +
    escapeHtml_(enquiry.message) + '</p>';

  MailApp.sendEmail({
    to: to,
    replyTo: enquiry.email,
    subject: subject,
    body: text,
    htmlBody: html,
    name: 'Northbound enquiries',
    attachments: photos && photos.length ? photos : undefined,
  });
  return true;
}

function logToSheet_(sheetId, receivedAt, enquiry, ref) {
  if (!sheetId) return false;
  var book = SpreadsheetApp.openById(sheetId);
  var sheet = book.getSheetByName(SHEET_TAB) || book.insertSheet(SHEET_TAB);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Received', 'Name', 'Email', 'Business', 'Project type', 'Budget', 'Message', 'Status', 'Ref']);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    receivedAt,
    sheetSafe_(enquiry.name),
    sheetSafe_(enquiry.email),
    sheetSafe_(enquiry.business),
    sheetSafe_(enquiry.projectType),
    sheetSafe_(enquiry.budget),
    sheetSafe_(enquiry.message),
    'New',
    sheetSafe_(ref),
  ]);
  return true;
}

/**
 * A cell that starts with = + - or @ is run as a formula by Sheets. Visitor
 * text must never be able to do that, so it is stored as plain text.
 */
function sheetSafe_(value) {
  var s = String(value == null ? '' : value);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

/** Strips line breaks and control characters from anything used in a header or subject. */
function oneLine_(value) {
  return String(value).replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ');
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Compares without stopping at the first difference. */
function safeEqual_(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function reply_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
