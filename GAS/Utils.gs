function nowIso_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function currentUserEmail_() {
  return Session.getActiveUser().getEmail() || 'unknown';
}

function normalizeText_(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone_(value) {
  return String(value || '').replace(/[^\d+]/g, '').replace(/^00/, '+');
}

function objectFromRow_(headers, row) {
  return headers.reduce((obj, header, index) => {
    obj[header] = row[index] === undefined ? '' : row[index];
    return obj;
  }, {});
}

function rowFromObject_(headers, obj) {
  return headers.map(header => obj[header] === undefined ? '' : obj[header]);
}

function success_(data) {
  return { ok: true, data: data || null };
}

function failure_(message, details) {
  return { ok: false, message: message, details: details || null };
}

