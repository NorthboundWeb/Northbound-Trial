/**
 * Northbound Web — client area store.
 *
 * A Google Sheet holds every project and its updates; the website reads and
 * writes it through this script, deployed as a web app. The script also
 * sends the sign-in emails, from the Google account that owns the Sheet.
 *
 * It also delivers the website's "Email me" form to your inbox (and logs it
 * in the Messages tab), with Reply-To set to the sender.
 *
 * Set up once:
 *   1. Create a Google Sheet ("Northbound clients"), then Extensions → Apps Script.
 *   2. Paste this whole file over the starter code and save.
 *   3. Choose `setup` in the function list and press Run. Allow the permissions.
 *   4. Deploy → New deployment → type "Web app". Execute as: Me.
 *      Who has access: Anyone. Deploy, and copy the web app URL.
 *   5. In Vercel (project northbound-trial → Settings → Environment Variables)
 *      add PORTAL_SCRIPT_URL (the web app URL) and PORTAL_SCRIPT_TOKEN (printed
 *      in the execution log in step 3), then redeploy.
 *
 * You can edit the Projects tab by hand: change Stage from the dropdown,
 * type a Progress number (0–100), a due date, a preview link or a note.
 * Customers see it the next time they open their page.
 *
 * setup() creates the shared secret the website sends with every request and
 * prints it in the execution log as PORTAL_SCRIPT_TOKEN. SETUP_TOKEN can force
 * a specific value; never commit a real one, the copy in Git is blank.
 */

const SETUP_TOKEN = ''

/** Where website messages go. Blank means the Google account that owns this script. */
const NOTIFY_EMAIL = ''

const STAGES = ['Request received', 'Processing', 'Building', 'Preview ready', 'Changes', 'Live']

const TABS = {
  Projects: ['id', 'ref', 'client_name', 'client_email', 'business', 'title', 'stage', 'progress', 'due_date', 'preview_url', 'live_url', 'note', 'created_at', 'updated_at'],
  Updates: ['id', 'project_id', 'body', 'created_at'],
  Tokens: ['token_hash', 'email', 'expires_at', 'used_at', 'created_at'],
  Messages: ['id', 'name', 'email', 'subject', 'message', 'created_at'],
}

const HEADINGS = {
  Projects: ['ID (leave)', 'Ref', 'Client name', 'Client email', 'Business', 'Project', 'Stage', 'Progress %', 'Due date (yyyy-mm-dd)', 'Preview link', 'Live link', 'Note for the client', 'Created', 'Updated'],
  Updates: ['ID (leave)', 'Project ID', 'Update', 'Posted'],
  Tokens: ['Token hash', 'Email', 'Expires', 'Used', 'Created'],
  Messages: ['ID', 'Name', 'Email', 'Subject', 'Message', 'Received'],
}

// ---------------------------------------------------------------------------
// One-off setup, run from the editor.

function setup() {
  const ss = SpreadsheetApp.getActive()
  Object.keys(TABS).forEach(function (name) {
    let sh = ss.getSheetByName(name)
    if (!sh) sh = ss.insertSheet(name)
    const cols = TABS[name].length
    sh.getRange(1, 1, 1, cols).setValues([HEADINGS[name]]).setFontWeight('bold')
    sh.setFrozenRows(1)
    // Plain text everywhere, so Sheets never turns a date or link into something else.
    sh.getRange(1, 1, sh.getMaxRows(), cols).setNumberFormat('@')
  })
  const projects = ss.getSheetByName('Projects')
  const stageCol = TABS.Projects.indexOf('stage') + 1
  projects
    .getRange(2, stageCol, projects.getMaxRows() - 1, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STAGES, true).setAllowInvalid(false).build())
  projects.hideColumns(1)
  ss.getSheetByName('Tokens').hideSheet()
  const first = ss.getSheetByName('Sheet1')
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first)

  const props = PropertiesService.getScriptProperties()
  if (SETUP_TOKEN) props.setProperty('PORTAL_TOKEN', SETUP_TOKEN)
  if (!props.getProperty('PORTAL_TOKEN')) props.setProperty('PORTAL_TOKEN', (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ''))
  // Asking for mail permission now means the first sign-in email does not fail.
  MailApp.getRemainingDailyQuota()
  Logger.log('PORTAL_SCRIPT_TOKEN = ' + props.getProperty('PORTAL_TOKEN'))
  Logger.log('Copy that value into Vercel as PORTAL_SCRIPT_TOKEN. Then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone) and copy the URL into Vercel as PORTAL_SCRIPT_URL.')
}

// ---------------------------------------------------------------------------
// Web app entry points.

function doGet() {
  return json({ ok: true, service: 'northbound-portal' })
}

function doPost(e) {
  let body
  try {
    body = JSON.parse(e.postData.contents)
  } catch (err) {
    return json({ ok: false, error: 'bad request' })
  }
  const token = PropertiesService.getScriptProperties().getProperty('PORTAL_TOKEN')
  if (!token || !body || typeof body.token !== 'string' || body.token !== token) return json({ ok: false, error: 'forbidden' })

  const lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    return json(handle(String(body.action || ''), body.args || {}))
  } catch (err) {
    return json({ ok: false, error: String((err && err.message) || err) })
  } finally {
    lock.releaseLock()
  }
}

function handle(action, a) {
  const now = new Date()
  switch (action) {
    case 'create_token': {
      const email = lower(a.email)
      const hourAgo = now.getTime() - 3600 * 1000
      const recent = rows('Tokens').filter(function (t) {
        return t.email === email && Date.parse(t.created_at) > hourAgo
      }).length
      if (recent >= (Number(a.max_per_hour) || 5)) return { ok: false, reason: 'rate' }
      const ttl = Math.min(Number(a.ttl_minutes) || 20, 60 * 24 * 7)
      append('Tokens', { token_hash: String(a.token_hash), email: email, expires_at: iso(new Date(now.getTime() + ttl * 60000)), used_at: '', created_at: iso(now) })
      pruneTokens(now)
      if (a.send_email && a.link) sendLink(email, String(a.link), String(a.name || ''), ttl)
      return { ok: true }
    }
    case 'consume_token': {
      const t = rows('Tokens').filter(function (r) {
        return r.token_hash === String(a.token_hash)
      })[0]
      if (!t || t.used_at || Date.parse(t.expires_at) < now.getTime()) return { ok: false }
      t.used_at = iso(now)
      write('Tokens', t)
      return { ok: true, email: t.email }
    }
    case 'has_projects': {
      const email = lower(a.email)
      return { ok: true, has: rows('Projects').some(function (p) { return lower(p.client_email) === email }) }
    }
    case 'list': {
      const email = a.email ? lower(a.email) : ''
      const updates = rows('Updates')
      const list = rows('Projects')
        .filter(function (p) { return !email || lower(p.client_email) === email })
        .map(function (p) {
          const mine = updates
            .filter(function (u) { return u.project_id === p.id })
            .sort(function (x, y) { return String(y.created_at).localeCompare(String(x.created_at)) })
            .map(clean)
          const out = clean(p)
          out.updates = mine
          return out
        })
        .sort(function (x, y) { return String(y.updated_at).localeCompare(String(x.updated_at)) })
      return { ok: true, projects: list }
    }
    case 'save_project': {
      const fields = ['ref', 'client_name', 'client_email', 'business', 'title', 'stage', 'progress', 'due_date', 'preview_url', 'live_url', 'note']
      if (a.id) {
        const p = rows('Projects').filter(function (r) { return r.id === String(a.id) })[0]
        if (!p) return { ok: false, error: 'not found' }
        fields.forEach(function (f) { if (f !== 'ref' && a[f] !== undefined) p[f] = f === 'client_email' ? lower(a[f]) : a[f] })
        p.updated_at = iso(now)
        write('Projects', p)
        return { ok: true, id: p.id }
      }
      const fresh = { id: Utilities.getUuid(), created_at: iso(now), updated_at: iso(now) }
      fields.forEach(function (f) { fresh[f] = a[f] === undefined ? '' : f === 'client_email' ? lower(a[f]) : a[f] })
      if (!fresh.stage) fresh.stage = STAGES[0]
      append('Projects', fresh)
      return { ok: true, id: fresh.id }
    }
    case 'add_update': {
      append('Updates', { id: Utilities.getUuid(), project_id: String(a.project_id), body: String(a.body || ''), created_at: iso(now) })
      const p = rows('Projects').filter(function (r) { return r.id === String(a.project_id) })[0]
      if (p) {
        p.updated_at = iso(now)
        write('Projects', p)
      }
      return { ok: true }
    }
    case 'delete_update': {
      removeWhere('Updates', function (u) { return u.id === String(a.id) })
      return { ok: true }
    }
    case 'contact': {
      const email = lower(a.email)
      const msg = { id: Utilities.getUuid(), name: String(a.name || ''), email: email, subject: String(a.subject || 'Website message'), message: String(a.message || ''), created_at: iso(now) }
      append('Messages', msg)
      const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail()
      MailApp.sendEmail({
        to: to,
        replyTo: email,
        name: 'Northbound Web site',
        subject: msg.subject + (msg.name ? ' — ' + msg.name : ''),
        body: 'From: ' + msg.name + ' <' + email + '>\n\n' + msg.message + '\n\nReply to this email to answer them.',
        htmlBody:
          '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#0c1220;max-width:600px">' +
          '<p style="color:#535d70;font-size:13px">From the website · reply to answer</p>' +
          '<p><b>' + esc(msg.name) + '</b> &lt;' + esc(email) + '&gt;</p>' +
          '<div style="white-space:pre-wrap;border-left:3px solid #2f7bff;padding-left:14px">' + esc(msg.message) + '</div></div>',
      })
      return { ok: true }
    }
    case 'delete_project': {
      removeWhere('Updates', function (u) { return u.project_id === String(a.id) })
      removeWhere('Projects', function (p) { return p.id === String(a.id) })
      return { ok: true }
    }
  }
  return { ok: false, error: 'unknown action' }
}

// ---------------------------------------------------------------------------
// Sign-in email.

function sendLink(email, link, name, ttl) {
  const hi = name ? 'Hi ' + name.split(/\s+/)[0] + ',' : 'Hi,'
  const mins = ttl >= 60 * 24 ? Math.round(ttl / 60 / 24) + ' days' : ttl + ' minutes'
  const text = hi + '\n\nHere is your link to see how your website is coming along:\n\n' + link + '\n\nIt works once and expires in ' + mins + '. If you did not ask for it, you can ignore this email.\n\nChe\nNorthbound Web'
  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#0c1220;max-width:520px">' +
    '<p>' + esc(hi) + '</p>' +
    '<p>Here is your link to see how your website is coming along.</p>' +
    '<p style="margin:28px 0"><a href="' + esc(link) + '" style="background:#2f7bff;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;display:inline-block;font-weight:bold">Open my project</a></p>' +
    '<p style="color:#535d70;font-size:13px">It works once and expires in ' + esc(mins) + '. If you did not ask for it, you can ignore this email.</p>' +
    '<p>Che<br>Northbound Web</p></div>'
  MailApp.sendEmail({ to: email, subject: 'Your Northbound Web project link', body: text, htmlBody: html, name: 'Northbound Web' })
}

// ---------------------------------------------------------------------------
// Sheet helpers. Every row is read as an object keyed by the TABS field names.

function sheet(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name)
  if (!sh) throw new Error('Missing tab "' + name + '". Run setup() in the script editor.')
  return sh
}

function rows(name) {
  const sh = sheet(name)
  const last = sh.getLastRow()
  if (last < 2) return []
  const head = TABS[name]
  return sh
    .getRange(2, 1, last - 1, head.length)
    .getValues()
    .map(function (r, i) {
      const o = { _row: i + 2 }
      head.forEach(function (h, j) { o[h] = cell(r[j]) })
      return o
    })
    .filter(function (o) { return o[head[0]] !== '' })
}

function append(name, obj) {
  const sh = sheet(name)
  sh.appendRow(TABS[name].map(function (h) { return safe(obj[h]) }))
}

function write(name, obj) {
  const head = TABS[name]
  sheet(name)
    .getRange(obj._row, 1, 1, head.length)
    .setValues([head.map(function (h) { return safe(obj[h]) })])
}

function removeWhere(name, test) {
  const sh = sheet(name)
  rows(name)
    .filter(test)
    .map(function (o) { return o._row })
    .sort(function (x, y) { return y - x })
    .forEach(function (r) { sh.deleteRow(r) })
}

function pruneTokens(now) {
  const cutoff = now.getTime() - 24 * 3600 * 1000
  removeWhere('Tokens', function (t) { return Date.parse(t.expires_at) < cutoff })
}

function clean(o) {
  const out = {}
  Object.keys(o).forEach(function (k) { if (k !== '_row') out[k] = o[k] })
  return out
}

function cell(v) {
  if (v instanceof Date) {
    const tz = Session.getScriptTimeZone()
    const midnight = v.getHours() === 0 && v.getMinutes() === 0 && v.getSeconds() === 0
    return midnight ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : iso(v)
  }
  return v === null || v === undefined ? '' : String(v)
}

/** Text that starts like a formula is stored as text, never run. */
function safe(v) {
  if (v === null || v === undefined) return ''
  const s = String(v).slice(0, 5000)
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s
}

function lower(v) {
  return String(v || '').trim().toLowerCase()
}

function iso(d) {
  return d.toISOString()
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  })
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)
}
