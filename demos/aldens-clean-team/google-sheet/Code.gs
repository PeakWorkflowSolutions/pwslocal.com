/**
 * Alden's Clean Team - quote requests -> Google Sheet
 *
 * Paste this into the Google Sheet's Apps Script editor
 * (Extensions > Apps Script), then Deploy > New deployment > Web app,
 * Execute as: Me, Who has access: Anyone. Copy the Web app URL into
 * js/config.js (sheet.url). Full steps: SETUP.md.
 *
 * Each website request becomes one new row on the "Requests" tab.
 * The last three columns (Status, Who's going, Price quoted) are for
 * the team to fill in by hand.
 */

// Optional: an email address to notify for every new request ("" = off).
var NOTIFY_EMAIL = "";

var SHEET_NAME = "Requests";

var COLUMNS = [
  ["Received", "submittedAt"],
  ["Reference", "ref"],
  ["Service", "service"],
  ["How often", "frequency"],
  ["Preferred day", "preferredDateLabel"],
  ["Time of day", "timeOfDay"],
  ["Street", "street"],
  ["City", "city"],
  ["Bedrooms", "bedrooms"],
  ["Bathrooms", "bathrooms"],
  ["Size", "size"],
  ["Name", "name"],
  ["Phone", "phone"],
  ["Email", "email"],
  ["Notes", "notes"],
  ["Status", null],        // team fills in: New / Called / Visited / Quoted / Booked / Not a fit
  ["Who's going", null],   // team fills in: Dave / Lyndsay / Leah
  ["Price quoted", null]   // team fills in
];

var REQUIRED = ["service", "frequency", "preferredDateLabel", "timeOfDay", "street", "city", "name", "phone"];

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    for (var i = 0; i < REQUIRED.length; i++) {
      if (!clean_(data[REQUIRED[i]])) return json_({ ok: false, error: "Missing " + REQUIRED[i] });
    }
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet_();
      var row = COLUMNS.map(function (c) {
        if (!c[1]) return c[0] === "Status" ? "New" : "";
        if (c[1] === "submittedAt") return new Date();
        return clean_(data[c[1]]);
      });
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL,
        "New quote request: " + clean_(data.service) + " (" + clean_(data.name) + ")",
        COLUMNS.filter(function (c) { return c[1] && c[1] !== "submittedAt"; })
          .map(function (c) { return c[0] + ": " + clean_(data[c[1]]); }).join("\n"));
    }
    return json_({ ok: true, ref: clean_(data.ref) });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* A quick check that the deployment is live: open the Web app URL in a browser. */
function doGet() {
  return json_({ ok: true, message: "Alden's Clean Team quote requests endpoint is running." });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(function (c) { return c[0]; }));
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold").setBackground("#1F2A6E").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/* Plain text only, trimmed, max 500 characters. A leading = + - @ is
   escaped so a value can never run as a spreadsheet formula. */
function clean_(v) {
  var s = String(v == null ? "" : v).replace(/[\u0000-\u001F]/g, " ").trim().slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
