function ImportService_reviewRows(rows, actorEmail) {
  UserService_requireRole_(['admin'], actorEmail);
  const normalized = (rows || []).map(normalizeParticipantInput_);
  const existing = ParticipantService_listActive();
  const existingEmails = new Map(existing.map(row => [normalizeText_(row.email), row]));
  const existingPhones = new Map(existing.filter(row => row.phone).map(row => [normalizePhone_(row.phone), row]));
  const seenEmails = new Map();
  const seenPhones = new Map();
  const clean = [];
  const duplicates = [];

  normalized.forEach((row, index) => {
    const reasons = [];
    const emailKey = normalizeText_(row.email);
    const phoneKey = normalizePhone_(row.phone);
    if (!row.full_name || !row.email || !row.affiliation) {
      reasons.push('Missing required full_name/email/affiliation');
    }
    if (existingEmails.has(emailKey)) reasons.push('Duplicate email: ' + existingEmails.get(emailKey).full_name);
    if (phoneKey && existingPhones.has(phoneKey)) reasons.push('Duplicate phone: ' + existingPhones.get(phoneKey).full_name);
    if (seenEmails.has(emailKey)) reasons.push('Duplicate email inside import row ' + (seenEmails.get(emailKey) + 2));
    if (phoneKey && seenPhones.has(phoneKey)) reasons.push('Duplicate phone inside import row ' + (seenPhones.get(phoneKey) + 2));
    seenEmails.set(emailKey, index);
    if (phoneKey) seenPhones.set(phoneKey, index);
    if (reasons.length) duplicates.push({ row, reasons });
    else clean.push(row);
  });

  return success_({ clean, duplicates, rowsRead: normalized.length });
}

function ImportService_commitRows(cleanRows, approvedDuplicateRows, actorEmail) {
  UserService_requireRole_(['admin'], actorEmail);
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const now = nowIso_();
    const user = actorEmail || currentUserEmail_();
    const startNumber = getNextCandidateSequence_();
    const rows = [...(cleanRows || []), ...(approvedDuplicateRows || [])].map((row, index) => ({
      ...emptyParticipant_(),
      ...normalizeParticipantInput_(row),
      candidate_id: buildCandidateId_(startNumber + index),
      on_site_status: getDefaultOnSiteStatus_(),
      checkin_status: 'Not checked-in',
      checkin_count: 0,
      qr_status: 'Not generated',
      created_at: now,
      created_by: user,
      updated_at: now,
      updated_by: user,
      deleted: false
    }));
    appendObjects_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, rows);
    appendObjects_(APP_CONFIG.sheets.imports, [
      'batch_id', 'timestamp', 'user_email', 'file_name', 'rows_read',
      'rows_imported', 'rows_skipped', 'duplicates_approved', 'note'
    ], [{
      batch_id: Utilities.getUuid(),
      timestamp: now,
      user_email: user,
      file_name: '',
      rows_read: rows.length,
      rows_imported: rows.length,
      rows_skipped: 0,
      duplicates_approved: (approvedDuplicateRows || []).length,
      note: 'Imported through web app'
    }]);
    Audit_log('IMPORT_PARTICIPANTS', APP_CONFIG.sheets.participants, '', '', '', String(rows.length), '', actorEmail);
    return success_({ imported: rows.length, participants: rows.map(stripInternalRowNumber_) });
  } finally {
    lock.releaseLock();
  }
}
