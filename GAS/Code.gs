function doGet(e) {
  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle(APP_CONFIG.appName)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setupDatabase() {
  return Database_setup();
}

function loginWithEmail(email) {
  try {
    if (!email || !email.trim()) return failure_('Vui lòng nhập email.');
    const users = readObjects_(APP_CONFIG.sheets.users);
    const found = users.find(function(u) {
      return normalizeText_(u.email) === normalizeText_(email.trim());
    });
    if (!found) return failure_('Email không có quyền truy cập hệ thống này.');
    if (String(found.active).toLowerCase() === 'false') return failure_('Tài khoản này đã bị vô hiệu hoá. Liên hệ admin.');
    return success_({
      email: String(found.email || ''),
      name: String(found.name || found.email || ''),
      role: String(found.role || 'guest')
    });
  } catch(err) {
    return failure_(err.message || 'Lỗi xác thực. Thử lại sau.');
  }
}

function getBootstrapDataForUser(email) {
  try {
    if (!email) return failure_('Cần email để tải dữ liệu.');
    // Re-verify access
    const loginCheck = loginWithEmail(email);
    if (!loginCheck.ok) return loginCheck;

    const participants = ParticipantService_listActive().map(function(p) {
      const safe = {};
      Object.keys(p).forEach(function(k) { safe[k] = String(p[k] === null || p[k] === undefined ? '' : p[k]); });
      return safe;
    });
    const groups = Groups_list().map(function(g) {
      const safe = {};
      Object.keys(g).forEach(function(k) { safe[k] = String(g[k] === null || g[k] === undefined ? '' : g[k]); });
      return safe;
    });
    const settings = Settings_getAll();
    const safeSettings = {};
    Object.keys(settings).forEach(function(k) { safeSettings[k] = String(settings[k] === null || settings[k] === undefined ? '' : settings[k]); });
    return success_({
      settings: safeSettings,
      groups: groups,
      participants: participants
    });
  } catch(err) {
    return failure_(err.message || 'Server error in getBootstrapDataForUser');
  }
}

function getBootstrapData() {
  try {
    const participants = ParticipantService_listActive().map(p => {
      const safe = {};
      Object.keys(p).forEach(k => { safe[k] = String(p[k] === null || p[k] === undefined ? '' : p[k]); });
      return safe;
    });
    const groups = Groups_list().map(g => {
      const safe = {};
      Object.keys(g).forEach(k => { safe[k] = String(g[k] === null || g[k] === undefined ? '' : g[k]); });
      return safe;
    });
    const settings = Settings_getAll();
    const safeSettings = {};
    Object.keys(settings).forEach(k => { safeSettings[k] = String(settings[k] === null || settings[k] === undefined ? '' : settings[k]); });
    const user = UserService_getCurrentUser();
    const safeUser = {
      email: String(user.email || ''),
      name: String(user.name || ''),
      role: String(user.role || 'guest'),
      active: user.active === true || user.active === 'true'
    };
    const dashboard = Dashboard_getSummary();
    return success_({
      user: safeUser,
      settings: safeSettings,
      groups: groups,
      participants: participants,
      dashboard: dashboard
    });
  } catch (err) {
    return failure_(err.message || 'Server error in getBootstrapData');
  }
}

function searchParticipants(query) {
  return success_(ParticipantService_search(query));
}

function saveParticipant(participant) {
  return ParticipantService_save(participant);
}

function deleteParticipants(candidateIds, actorEmail) {
  return ParticipantService_deleteMany(candidateIds, actorEmail);
}

function checkInParticipant(candidateId, method, postCheckinNote, actorEmail) {
  return CheckinService_checkIn(candidateId, method, postCheckinNote, actorEmail);
}

function undoCheckIn(candidateId, actorEmail) {
  return CheckinService_undo(candidateId, actorEmail);
}

function getImportTemplate() {
  return success_({ headers: IMPORT_TEMPLATE_HEADERS });
}

function reviewImportRows(rows, actorEmail) {
  return ImportService_reviewRows(rows, actorEmail);
}

function commitImportRows(cleanRows, approvedDuplicateRows, actorEmail) {
  return ImportService_commitRows(cleanRows || [], approvedDuplicateRows || [], actorEmail);
}

function generateQrPayload(candidateId, actorEmail) {
  return QrService_generatePayload(candidateId, actorEmail);
}

function generateMissingQrPayloads(actorEmail) {
  return QrService_generateMissingPayloads(actorEmail);
}

function generateAllQrPayloads(actorEmail) {
  return QrService_generateAllPayloads(actorEmail);
}

function createBackup(actorEmail) {
  return BackupService_create(actorEmail);
}

// ─── User Management (Admin only) ───────────────────────
function listUsers(actorEmail) {
  try {
    UserService_requireRole_(['admin'], actorEmail);
    const users = readObjects_(APP_CONFIG.sheets.users);
    const safe = users.map(function(u) {
      return {
        email: String(u.email || ''),
        name: String(u.name || u.email || ''),
        role: String(u.role || 'check-in'),
        active: String(u.active || 'TRUE')
      };
    });
    return success_(safe);
  } catch(err) {
    return failure_(err.message || 'Không lấy được danh sách người dùng.');
  }
}

function saveUser(userData) {
  try {
    UserService_requireRole_(['admin'], userData && userData.actorEmail);
    if (!userData || !userData.email) return failure_('Thiếu email.');
    const now = nowIso_();
    const users = readObjects_(APP_CONFIG.sheets.users);
    const USER_HEADERS = ['email', 'name', 'role', 'active', 'created_at', 'updated_at'];
    const targetEmail = (userData.originalEmail || userData.email).toLowerCase().trim();
    const idx = users.findIndex(function(u) {
      return String(u.email || '').toLowerCase().trim() === targetEmail;
    });
    const record = {
      email: userData.email.toLowerCase().trim(),
      name: userData.name || userData.email,
      role: userData.role || 'check-in',
      active: userData.active || 'TRUE',
      updated_at: now
    };
    if (idx >= 0) {
      // Update existing
      record.created_at = users[idx].created_at || now;
      updateObjectAtRow_(APP_CONFIG.sheets.users, USER_HEADERS, users[idx].__rowNumber, record);
      Audit_log('UPDATE_USER', APP_CONFIG.sheets.users, record.email, 'user', '', JSON.stringify(record), '', userData.actorEmail);
    } else {
      // Insert new
      record.created_at = now;
      appendObjects_(APP_CONFIG.sheets.users, USER_HEADERS, [record]);
      Audit_log('CREATE_USER', APP_CONFIG.sheets.users, record.email, 'user', '', JSON.stringify(record), '', userData.actorEmail);
    }
    return success_(record);
  } catch(err) {
    return failure_(err.message || 'Không lưu được người dùng.');
  }
}

function deleteUser(email, actorEmail) {
  try {
    UserService_requireRole_(['admin'], actorEmail);
    if (!email) return failure_('Thiếu email.');
    const users = readObjects_(APP_CONFIG.sheets.users);
    const found = users.find(function(u) {
      return String(u.email || '').toLowerCase().trim() === email.toLowerCase().trim();
    });
    if (!found) return failure_('Không tìm thấy người dùng.');
    // Hard delete row
    const ss = SpreadsheetApp.openById(APP_CONFIG.spreadsheetId);
    const sheet = ss.getSheetByName(APP_CONFIG.sheets.users);
    sheet.deleteRow(found.__rowNumber);
    Audit_log('DELETE_USER', APP_CONFIG.sheets.users, email, 'user', JSON.stringify(found), '', '', actorEmail);
    return success_({ deleted: email });
  } catch(err) {
    return failure_(err.message || 'Không xoá được người dùng.');
  }
}
