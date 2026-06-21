function Database_setup() {
  const ss = getSpreadsheet_();
  const created = [];

  ensureSheet_(ss, APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, created);
  ensureSheet_(ss, APP_CONFIG.sheets.groups, [
    'main_group', 'detailed_group', 'color_hex', 'text_color_hex', 'priority', 'active'
  ], created);
  ensureSheet_(ss, APP_CONFIG.sheets.users, [
    'email', 'name', 'role', 'active', 'created_at', 'updated_at'
  ], created);
  ensureSheet_(ss, APP_CONFIG.sheets.checkinLogs, [
    'log_id', 'timestamp', 'candidate_id', 'full_name', 'email', 'action',
    'method', 'user_email', 'previous_status', 'new_status', 'note'
  ], created);
  ensureSheet_(ss, APP_CONFIG.sheets.auditLogs, [
    'audit_id', 'timestamp', 'user_email', 'role', 'action_type',
    'target_sheet', 'target_id', 'field_changed', 'old_value', 'new_value', 'note'
  ], created);
  ensureSheet_(ss, APP_CONFIG.sheets.settings, [
    'key', 'value', 'description', 'updated_at', 'updated_by'
  ], created);
  ensureSheet_(ss, APP_CONFIG.sheets.imports, [
    'batch_id', 'timestamp', 'user_email', 'file_name', 'rows_read',
    'rows_imported', 'rows_skipped', 'duplicates_approved', 'note'
  ], created);
  ensureSheet_(ss, APP_CONFIG.sheets.backups, [
    'backup_id', 'timestamp', 'spreadsheet_copy_id', 'created_by', 'note'
  ], created);

  seedGroups_();
  seedSettings_();
  seedCurrentUserAsAdmin_();

  return success_({
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    createdSheets: created
  });
}

function getSheet_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Missing sheet: ' + sheetName + '. Run setupDatabase() first.');
  }
  return sheet;
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(APP_CONFIG.spreadsheetId);
}

function readObjects_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map((row, index) => {
      const obj = objectFromRow_(headers, row);
      obj.__rowNumber = index + 2;
      return obj;
    });
}

function appendObjects_(sheetName, headers, objects) {
  if (!objects.length) return;
  const sheet = getSheet_(sheetName);
  sheet.getRange(sheet.getLastRow() + 1, 1, objects.length, headers.length)
    .setValues(objects.map(obj => rowFromObject_(headers, obj)));
}

function updateObjectAtRow_(sheetName, headers, rowNumber, obj) {
  getSheet_(sheetName)
    .getRange(rowNumber, 1, 1, headers.length)
    .setValues([rowFromObject_(headers, obj)]);
}

function ensureSheet_(ss, sheetName, headers, created) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    created.push(sheetName);
  }
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
  const hasHeaders = headers.every((header, index) => current[index] === header);
  if (!hasHeaders) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function seedGroups_() {
  const sheetName = APP_CONFIG.sheets.groups;
  const existing = readObjects_(sheetName);
  if (existing.length) return;
  appendObjects_(sheetName, ['main_group', 'detailed_group', 'color_hex', 'text_color_hex', 'priority', 'active'],
    GROUPS.map(group => ({ ...group, active: true })));
}

function seedSettings_() {
  const sheetName = APP_CONFIG.sheets.settings;
  const existing = readObjects_(sheetName);
  if (existing.length) return;
  const now = nowIso_();
  const user = currentUserEmail_();
  appendObjects_(sheetName, ['key', 'value', 'description', 'updated_at', 'updated_by'],
    SETTINGS_DEFAULTS.map(row => ({
      key: row[0],
      value: row[1],
      description: row[2],
      updated_at: now,
      updated_by: user
    })));
}

function seedCurrentUserAsAdmin_() {
  const email = currentUserEmail_();
  if (!email || email === 'unknown') return;
  const users = readObjects_(APP_CONFIG.sheets.users);
  if (users.some(user => normalizeText_(user.email) === normalizeText_(email))) return;
  const now = nowIso_();
  appendObjects_(APP_CONFIG.sheets.users, ['email', 'name', 'role', 'active', 'created_at', 'updated_at'], [{
    email,
    name: email,
    role: 'admin',
    active: true,
    created_at: now,
    updated_at: now
  }]);
}

function Audit_log(actionType, targetSheet, targetId, field, oldValue, newValue, note, actorEmail) {
  const user = UserService_getCurrentUser(actorEmail);
  appendObjects_(APP_CONFIG.sheets.auditLogs, [
    'audit_id', 'timestamp', 'user_email', 'role', 'action_type',
    'target_sheet', 'target_id', 'field_changed', 'old_value', 'new_value', 'note'
  ], [{
    audit_id: Utilities.getUuid(),
    timestamp: nowIso_(),
    user_email: user.email,
    role: user.role,
    action_type: actionType,
    target_sheet: targetSheet,
    target_id: targetId,
    field_changed: field || '',
    old_value: oldValue || '',
    new_value: newValue || '',
    note: note || ''
  }]);
}
