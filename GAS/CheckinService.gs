function CheckinService_checkIn(candidateId, method, postCheckinNote, actorEmail) {
  UserService_requireRole_(['admin', 'staff', 'check-in'], actorEmail);

  // Get current day settings
  const settings = Settings_getAll();
  const dayOpen = settings.current_day_open === 'true';
  const dayLabel = settings.current_day_label || '';

  // Block if day system is active but day is closed
  if (dayLabel && !dayOpen) {
    return failure_('Check-in ngày "' + dayLabel + '" đã đóng. Admin cần mở ngày trước khi check-in.');
  }

  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const participants = readObjects_(APP_CONFIG.sheets.participants);
    const participant = participants.find(row => row.candidate_id === candidateId);
    if (!participant) return failure_('Không tìm thấy người tham dự');

    // Duplicate check: block if already checked in today (same calendar date, VN timezone)
    const todayStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
    const checkinDate = (participant.checkin_time || '').substring(0, 10);
    if (participant.checkin_status === 'Checked-in' && checkinDate === todayStr) {
      return failure_(
        dayLabel ? 'Đã check-in ' + dayLabel + ' rồi' : 'Đã check-in hôm nay rồi',
        stripInternalRowNumber_(participant)
      );
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
    appendCheckinLog_(updated, 'CHECK_IN', method || 'Manual search', previousStatus, 'Checked-in', postCheckinNote || '', actorEmail, dayLabel);
    Audit_log('CHECK_IN', APP_CONFIG.sheets.participants, candidateId, 'checkin_status', previousStatus, 'Checked-in', dayLabel, actorEmail);
    return success_(stripInternalRowNumber_({ ...updated, current_day_label: dayLabel }));
  } finally {
    lock.releaseLock();
  }
}

function CheckinService_undo(candidateId, actorEmail) {
  UserService_requireRole_(['admin'], actorEmail);
  const participants = readObjects_(APP_CONFIG.sheets.participants);
  const participant = participants.find(row => row.candidate_id === candidateId);
  if (!participant) return failure_('Không tìm thấy người tham dự');
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
  appendCheckinLog_(updated, 'UNDO_CHECK_IN', 'Admin', previousStatus, 'Not checked-in', '', actorEmail, '');
  Audit_log('UNDO_CHECK_IN', APP_CONFIG.sheets.participants, candidateId, 'checkin_status', previousStatus, 'Not checked-in', '', actorEmail);
  return success_(stripInternalRowNumber_(updated));
}

function appendCheckinLog_(participant, action, method, previousStatus, newStatus, note, actorEmail, dayLabel) {
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
    method: dayLabel ? '[' + dayLabel + '] ' + method : method,
    user_email: actorEmail || currentUserEmail_(),
    previous_status: previousStatus,
    new_status: newStatus,
    note
  }]);
}

// Batch reset all participants' checkin_status to "Not checked-in" for new day
function resetDailyStatus_() {
  const sheet = getSheet_(APP_CONFIG.sheets.participants);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return 0;
  const headers = data[0];
  const statusIdx = headers.indexOf('checkin_status');
  const timeIdx = headers.indexOf('checkin_time');
  const byIdx = headers.indexOf('checkin_by');
  const methodIdx = headers.indexOf('checkin_method');
  const deletedIdx = headers.indexOf('deleted');

  let resetCount = 0;
  for (let i = 1; i < data.length; i++) {
    if (deletedIdx >= 0 && String(data[i][deletedIdx]).toLowerCase() === 'true') continue;
    if (data[i][statusIdx] === 'Checked-in') {
      if (statusIdx >= 0) data[i][statusIdx] = 'Not checked-in';
      if (timeIdx >= 0) data[i][timeIdx] = '';
      if (byIdx >= 0) data[i][byIdx] = '';
      if (methodIdx >= 0) data[i][methodIdx] = '';
      resetCount++;
    }
  }
  if (resetCount > 0) {
    sheet.getDataRange().setValues(data);
  }
  return resetCount;
}
