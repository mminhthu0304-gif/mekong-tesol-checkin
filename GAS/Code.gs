// ─── HTTP Entry Points ───────────────────────────────────────────────────────

function doGet(e) {
  // Still serve the GAS UI for admin who open the script URL directly
  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle(APP_CONFIG.appName)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  try {
    const body = JSON.parse(e.postData.contents);
    const result = routeAction_(body);
    output.setContent(JSON.stringify(result));
  } catch (err) {
    output.setContent(JSON.stringify(failure_('Server error: ' + err.message)));
  }
  return output;
}

// OPTIONS preflight — GAS doesn't call doOptions but handle via doGet fallback
// CORS headers are set in appsscript.json via webapp executeAs

// ─── Router ──────────────────────────────────────────────────────────────────

function routeAction_(body) {
  const action = body && body.action;
  if (!action) return failure_('Missing action');

  // Public: login does not require prior auth
  if (action === 'login') return Api_login(body.pin);

  // All other actions require PIN
  const auth = verifyPin_(body.pin);
  if (!auth.ok) return auth;
  const actor = auth.data;

  switch (action) {
    // ── Bootstrap ──
    case 'bootstrap':        return Api_bootstrap(actor);

    // ── Check-in ──
    case 'checkin':          return Api_checkin(body, actor);
    case 'undo_checkin':     return Api_undoCheckin(body, actor);

    // ── Participants ──
    case 'search':           return Api_search(body, actor);
    case 'save_participant': return Api_saveParticipant(body, actor);
    case 'delete_participants': return Api_deleteParticipants(body, actor);
    case 'add_note':         return Api_addNote(body, actor);

    // ── Dashboard / Export (Admin only) ──
    case 'dashboard':        return Api_dashboard(actor);
    case 'export':           return Api_export(body, actor);

    // ── Import (Admin only) ──
    case 'review_import':    return Api_reviewImport(body, actor);
    case 'commit_import':    return Api_commitImport(body, actor);

    // ── QR (Admin only) ──
    case 'generate_qr':      return Api_generateQr(body, actor);
    case 'generate_missing_qr': return Api_generateMissingQr(actor);
    case 'generate_all_qr':  return Api_generateAllQr(actor);

    // ── Backup (Admin only) ──
    case 'backup':           return Api_backup(actor);

    // ── Users (Admin only) ──
    case 'list_users':       return Api_listUsers(actor);
    case 'save_user':        return Api_saveUser(body, actor);
    case 'delete_user':      return Api_deleteUser(body, actor);

    // ── Settings ──
    case 'get_settings':     return success_(Settings_getAll());
    case 'groups':           return success_(Groups_list());

    default: return failure_('Unknown action: ' + action);
  }
}

// ─── PIN Auth ────────────────────────────────────────────────────────────────

function verifyPin_(pin) {
  if (!pin) return failure_('PIN là bắt buộc');
  const users = readObjects_(APP_CONFIG.sheets.users);
  const found = users.find(function(u) {
    return String(u.pin || '').trim() === String(pin).trim()
      && String(u.active).toLowerCase() !== 'false';
  });
  if (!found) return failure_('PIN không đúng hoặc tài khoản đã bị khoá');
  return success_({
    email: String(found.email || found.pin || ''),
    name: String(found.name || ''),
    role: String(found.role || 'staff'),
    pin: String(found.pin || '')
  });
}

function Api_login(pin) {
  return verifyPin_(pin);
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

function Api_bootstrap(actor) {
  try {
    const participants = ParticipantService_listActive().map(safeStringify_);
    const groups = Groups_list().map(safeStringify_);
    const settings = Settings_getAll();
    const safeSettings = {};
    Object.keys(settings).forEach(function(k) { safeSettings[k] = String(settings[k] || ''); });
    const dashboard = Dashboard_getSummary();
    return success_({ user: actor, settings: safeSettings, groups: groups, participants: participants, dashboard: dashboard });
  } catch (err) {
    return failure_(err.message);
  }
}

// ─── Check-in ────────────────────────────────────────────────────────────────

function Api_checkin(body, actor) {
  return CheckinService_checkIn(body.candidate_id, body.method || 'QR', body.post_checkin_note || '', actor.email);
}

function Api_undoCheckin(body, actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được bỏ check-in');
  return CheckinService_undo(body.candidate_id, actor.email);
}

// ─── Participants ─────────────────────────────────────────────────────────────

function Api_search(body, actor) {
  try {
    return success_(ParticipantService_search(body.query || ''));
  } catch (err) {
    return failure_(err.message);
  }
}

function Api_saveParticipant(body, actor) {
  const input = Object.assign({}, body.participant || {}, { actorEmail: actor.email });
  return ParticipantService_save(input);
}

function Api_deleteParticipants(body, actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được xoá');
  return ParticipantService_deleteMany(body.candidate_ids || [], actor.email);
}

function Api_addNote(body, actor) {
  try {
    const participants = readObjects_(APP_CONFIG.sheets.participants);
    const p = participants.find(function(row) { return row.candidate_id === body.candidate_id; });
    if (!p) return failure_('Không tìm thấy người tham dự');
    const now = nowIso_();
    const updated = Object.assign({}, p, {
      post_checkin_note: body.note || '',
      updated_at: now,
      updated_by: actor.email
    });
    updateObjectAtRow_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, p.__rowNumber, updated);
    Audit_log('ADD_NOTE', APP_CONFIG.sheets.participants, body.candidate_id, 'post_checkin_note', p.post_checkin_note || '', body.note || '', '', actor.email);
    return success_(stripInternalRowNumber_(updated));
  } catch (err) {
    return failure_(err.message);
  }
}

// ─── Dashboard / Export ───────────────────────────────────────────────────────

function Api_dashboard(actor) {
  try {
    const summary = Dashboard_getSummary();
    const groups = Groups_list();
    return success_({ summary: summary, groups: groups });
  } catch (err) {
    return failure_(err.message);
  }
}

function Api_export(body, actor) {
  try {
    let rows = ParticipantService_listActive();
    const filter = body.filter || 'all';
    if (filter === 'checked_in') rows = rows.filter(function(p) { return p.checkin_status === 'Checked-in'; });
    if (filter === 'not_checked_in') rows = rows.filter(function(p) { return p.checkin_status !== 'Checked-in'; });
    if (filter === 'onsite') rows = rows.filter(function(p) { return p.on_site_status === 'On-site Registration'; });
    return success_(rows.map(safeStringify_));
  } catch (err) {
    return failure_(err.message);
  }
}

// ─── Import ───────────────────────────────────────────────────────────────────

function Api_reviewImport(body, actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được import');
  return ImportService_reviewRows(body.rows || [], actor.email);
}

function Api_commitImport(body, actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được import');
  return ImportService_commitRows(body.clean_rows || [], body.approved_rows || [], actor.email);
}

// ─── QR ──────────────────────────────────────────────────────────────────────

function Api_generateQr(body, actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được tạo QR');
  return QrService_generatePayload(body.candidate_id, actor.email);
}

function Api_generateMissingQr(actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được tạo QR');
  return QrService_generateMissingPayloads(actor.email);
}

function Api_generateAllQr(actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được tạo QR');
  return QrService_generateAllPayloads(actor.email);
}

// ─── Backup ───────────────────────────────────────────────────────────────────

function Api_backup(actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được backup');
  return BackupService_create(actor.email);
}

// ─── Users (Admin only) ──────────────────────────────────────────────────────

function Api_listUsers(actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới xem được danh sách users');
  const users = readObjects_(APP_CONFIG.sheets.users);
  return success_(users.map(function(u) {
    return {
      email: String(u.email || ''),
      name: String(u.name || ''),
      role: String(u.role || 'staff'),
      pin: String(u.pin || ''),
      active: String(u.active || 'TRUE')
    };
  }));
}

function Api_saveUser(body, actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được quản lý users');
  const userData = Object.assign({}, body.user || {}, { actorEmail: actor.email });
  if (!userData.email && !userData.name) return failure_('Thiếu thông tin user');
  const now = nowIso_();
  const users = readObjects_(APP_CONFIG.sheets.users);
  const targetEmail = (userData.originalEmail || userData.email || '').toLowerCase().trim();
  const idx = users.findIndex(function(u) {
    return String(u.email || '').toLowerCase().trim() === targetEmail;
  });
  const record = {
    email: (userData.email || '').toLowerCase().trim(),
    name: userData.name || userData.email || '',
    role: userData.role || 'staff',
    pin: userData.pin || '',
    active: userData.active !== undefined ? String(userData.active) : 'TRUE',
    updated_at: now
  };
  if (idx >= 0) {
    record.created_at = users[idx].created_at || now;
    updateObjectAtRow_(APP_CONFIG.sheets.users, USER_HEADERS_, users[idx].__rowNumber, record);
    Audit_log('UPDATE_USER', APP_CONFIG.sheets.users, record.email, 'user', '', JSON.stringify(record), '', actor.email);
  } else {
    record.created_at = now;
    appendObjects_(APP_CONFIG.sheets.users, USER_HEADERS_, [record]);
    Audit_log('CREATE_USER', APP_CONFIG.sheets.users, record.email, 'user', '', JSON.stringify(record), '', actor.email);
  }
  return success_(record);
}

function Api_deleteUser(body, actor) {
  if (actor.role !== 'admin') return failure_('Chỉ Admin mới được xoá users');
  const email = body.email || '';
  if (!email) return failure_('Thiếu email');
  const users = readObjects_(APP_CONFIG.sheets.users);
  const found = users.find(function(u) { return String(u.email || '').toLowerCase().trim() === email.toLowerCase().trim(); });
  if (!found) return failure_('Không tìm thấy user');
  const ss = SpreadsheetApp.openById(APP_CONFIG.spreadsheetId);
  ss.getSheetByName(APP_CONFIG.sheets.users).deleteRow(found.__rowNumber);
  Audit_log('DELETE_USER', APP_CONFIG.sheets.users, email, 'user', JSON.stringify(found), '', '', actor.email);
  return success_({ deleted: email });
}

// ─── Legacy GAS UI functions (kept for direct GAS access) ────────────────────

function setupDatabase() { return Database_setup(); }

function loginWithEmail(email) {
  try {
    if (!email || !email.trim()) return failure_('Vui lòng nhập email.');
    const users = readObjects_(APP_CONFIG.sheets.users);
    const found = users.find(function(u) {
      return normalizeText_(u.email) === normalizeText_(email.trim());
    });
    if (!found) return failure_('Email không có quyền truy cập.');
    if (String(found.active).toLowerCase() === 'false') return failure_('Tài khoản đã bị vô hiệu hoá.');
    return success_({ email: String(found.email || ''), name: String(found.name || found.email || ''), role: String(found.role || 'guest') });
  } catch(err) { return failure_(err.message); }
}

function getBootstrapDataForUser(email) {
  const loginCheck = loginWithEmail(email);
  if (!loginCheck.ok) return loginCheck;
  const actor = { email: email, role: loginCheck.data.role };
  return Api_bootstrap(actor);
}

function searchParticipants(query) { return success_(ParticipantService_search(query)); }
function saveParticipant(participant) { return ParticipantService_save(participant); }
function deleteParticipants(candidateIds, actorEmail) { return ParticipantService_deleteMany(candidateIds, actorEmail); }
function checkInParticipant(candidateId, method, postCheckinNote, actorEmail) { return CheckinService_checkIn(candidateId, method, postCheckinNote, actorEmail); }
function undoCheckIn(candidateId, actorEmail) { return CheckinService_undo(candidateId, actorEmail); }
function getImportTemplate() { return success_({ headers: IMPORT_TEMPLATE_HEADERS }); }
function reviewImportRows(rows, actorEmail) { return ImportService_reviewRows(rows, actorEmail); }
function commitImportRows(cleanRows, approvedDuplicateRows, actorEmail) { return ImportService_commitRows(cleanRows || [], approvedDuplicateRows || [], actorEmail); }
function generateQrPayload(candidateId, actorEmail) { return QrService_generatePayload(candidateId, actorEmail); }
function generateMissingQrPayloads(actorEmail) { return QrService_generateMissingPayloads(actorEmail); }
function generateAllQrPayloads(actorEmail) { return QrService_generateAllPayloads(actorEmail); }
function createBackup(actorEmail) { return BackupService_create(actorEmail); }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const USER_HEADERS_ = ['email', 'name', 'role', 'pin', 'active', 'created_at', 'updated_at'];

function safeStringify_(obj) {
  const out = {};
  Object.keys(obj).forEach(function(k) {
    out[k] = String(obj[k] === null || obj[k] === undefined ? '' : obj[k]);
  });
  return out;
}
