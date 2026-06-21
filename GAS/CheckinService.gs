function CheckinService_checkIn(candidateId, method, postCheckinNote, actorEmail) {
  UserService_requireRole_(['admin', 'staff', 'check-in'], actorEmail);
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const participants = readObjects_(APP_CONFIG.sheets.participants);
    const participant = participants.find(row => row.candidate_id === candidateId);
    if (!participant) return failure_('Candidate not found');
    if (participant.checkin_status === 'Checked-in') {
      return failure_('Candidate already checked in', stripInternalRowNumber_(participant));
    }

    const previousStatus = participant.checkin_status || 'Not checked-in';
    const now = nowIso_();
    const user = actorEmail || currentUserEmail_();
    const updated = {
      ...participant,
      checkin_status: 'Checked-in',
      checkin_time: now,
      checkin_by: user,
      checkin_method: method || 'Manual search',
      checkin_count: Number(participant.checkin_count || 0) + 1,
      post_checkin_note: postCheckinNote || participant.post_checkin_note || '',
      updated_at: now,
      updated_by: user
    };
    updateObjectAtRow_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, participant.__rowNumber, updated);
    appendCheckinLog_(updated, 'CHECK_IN', method || 'Manual search', previousStatus, 'Checked-in', postCheckinNote || '', actorEmail);
    Audit_log('CHECK_IN', APP_CONFIG.sheets.participants, candidateId, 'checkin_status', previousStatus, 'Checked-in', '', actorEmail);
    return success_(stripInternalRowNumber_(updated));
  } finally {
    lock.releaseLock();
  }
}

function CheckinService_undo(candidateId, actorEmail) {
  UserService_requireRole_(['admin'], actorEmail);
  const participants = readObjects_(APP_CONFIG.sheets.participants);
  const participant = participants.find(row => row.candidate_id === candidateId);
  if (!participant) return failure_('Candidate not found');
  const previousStatus = participant.checkin_status || '';
  const updated = {
    ...participant,
    checkin_status: 'Not checked-in',
    checkin_time: '',
    checkin_by: '',
    checkin_method: '',
    updated_at: nowIso_(),
    updated_by: actorEmail || currentUserEmail_()
  };
  updateObjectAtRow_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, participant.__rowNumber, updated);
  appendCheckinLog_(updated, 'UNDO_CHECK_IN', 'Admin', previousStatus, 'Not checked-in', '', actorEmail);
  Audit_log('UNDO_CHECK_IN', APP_CONFIG.sheets.participants, candidateId, 'checkin_status', previousStatus, 'Not checked-in', '', actorEmail);
  return success_(stripInternalRowNumber_(updated));
}

function appendCheckinLog_(participant, action, method, previousStatus, newStatus, note, actorEmail) {
  appendObjects_(APP_CONFIG.sheets.checkinLogs, [
    'log_id', 'timestamp', 'candidate_id', 'full_name', 'email', 'action',
    'method', 'user_email', 'previous_status', 'new_status', 'note'
  ], [{
    log_id: Utilities.getUuid(),
    timestamp: nowIso_(),
    candidate_id: participant.candidate_id,
    full_name: participant.full_name,
    email: participant.email,
    action,
    method,
    user_email: actorEmail || currentUserEmail_(),
    previous_status: previousStatus,
    new_status: newStatus,
    note
  }]);
}
