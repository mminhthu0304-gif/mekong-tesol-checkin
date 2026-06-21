function ParticipantService_listActive() {
  return readObjects_(APP_CONFIG.sheets.participants)
    .filter(row => String(row.deleted).toLowerCase() !== 'true')
    .map(stripInternalRowNumber_);
}

function ParticipantService_search(query) {
  const q = normalizeText_(query);
  if (!q) return ParticipantService_listActive().slice(0, 25);
  return ParticipantService_listActive()
    .filter(p => [
      p.full_name, p.email, p.phone, p.affiliation, p.detailed_group,
      p.media_consent, p.notes, p.pre_checkin_note, p.post_checkin_note
    ].join(' ').toLowerCase().includes(q))
    .slice(0, 50);
}

function ParticipantService_save(input) {
  const actor = input && input.actorEmail;
  UserService_requireRole_(['admin', 'staff', 'check-in'], actor);
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const now = nowIso_();
    const user = actor || currentUserEmail_();
    const participants = readObjects_(APP_CONFIG.sheets.participants);
    const requestedId = input.candidate_id || input.id || '';
    const existing = requestedId
      ? participants.find(p => p.candidate_id === requestedId)
      : null;
    const normalized = normalizeParticipantInput_(input);

    if (existing) {
      const updated = {
        ...existing,
        ...normalized,
        updated_at: now,
        updated_by: user
      };
      updateObjectAtRow_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, existing.__rowNumber, updated);
      Audit_log('UPDATE_PARTICIPANT', APP_CONFIG.sheets.participants, existing.candidate_id, '', JSON.stringify(existing), JSON.stringify(updated), '', actor);
      return success_(stripInternalRowNumber_(updated));
    }

    const created = {
      ...emptyParticipant_(),
      ...normalized,
      candidate_id: nextCandidateId_(),
      on_site_status: input.on_site_status || getDefaultOnSiteStatus_(),
      checkin_status: 'Not checked-in',
      checkin_count: 0,
      qr_status: 'Not generated',
      created_at: now,
      created_by: user,
      updated_at: now,
      updated_by: user,
      deleted: false
    };
    appendObjects_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, [created]);
    Audit_log('CREATE_PARTICIPANT', APP_CONFIG.sheets.participants, created.candidate_id, '', '', JSON.stringify(created), '', actor);
    return success_(created);
  } finally {
    lock.releaseLock();
  }
}

function ParticipantService_deleteMany(candidateIds, actorEmail) {
  UserService_requireRole_(['admin'], actorEmail);
  const ids = [...new Set((candidateIds || []).map(String).filter(Boolean))];
  if (!ids.length) return success_({ deleted: 0, candidateIds: [] });
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const now = nowIso_();
    const user = actorEmail || currentUserEmail_();
    const participants = readObjects_(APP_CONFIG.sheets.participants);
    const deletedIds = [];
    participants.forEach(participant => {
      if (!ids.includes(String(participant.candidate_id || ''))) return;
      if (String(participant.deleted).toLowerCase() === 'true') return;
      const updated = {
        ...participant,
        deleted: true,
        updated_at: now,
        updated_by: user
      };
      updateObjectAtRow_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, participant.__rowNumber, updated);
      deletedIds.push(participant.candidate_id);
      Audit_log('DELETE_PARTICIPANT', APP_CONFIG.sheets.participants, participant.candidate_id, 'deleted', String(participant.deleted || ''), 'true', '', actorEmail);
    });
    return success_({ deleted: deletedIds.length, candidateIds: deletedIds });
  } finally {
    lock.releaseLock();
  }
}

function normalizeParticipantInput_(input) {
  const groups = Groups_list();
  const detailed = input.detailed_group || input.detailedGroup || 'Participant';
  const group = groups.find(item => item.detailed_group === detailed) || groups[0];
  return {
    title: input.title || '',
    title_other_text: input.title_other_text || input.titleOtherText || '',
    full_name: input.full_name || input.name || '',
    email: input.email || '',
    phone: input.phone || '',
    affiliation: input.affiliation || '',
    nationality: input.nationality || '',
    country: input.country || '',
    province: input.province || '',
    job: input.job || '',
    job_other_institution: input.job_other_institution || input.jobOtherInstitution || '',
    institution: input.institution || '',
    years_expe: input.years_expe || input.yearsExperience || '',
    first_attend: input.first_attend || input.firstAttend || '',
    source: input.source || input.sourceOriginal || '',
    source_oth: input.source_oth || input.sourceOther || '',
    media_consent: input.media_consent || input.mediaConsent || '',
    ecert_cons: input.ecert_cons || input.ecertConsent || '',
    post_conference: input.post_conference || input.postConference || '',
    notes: input.notes || '',
    main_group: group.main_group,
    detailed_group: group.detailed_group,
    pre_checkin_note: input.pre_checkin_note || input.preNote || input.notes || '',
    post_checkin_note: input.post_checkin_note || input.postNote || ''
  };
}

function emptyParticipant_() {
  return PARTICIPANT_HEADERS.reduce((obj, header) => {
    obj[header] = '';
    return obj;
  }, {});
}

function stripInternalRowNumber_(obj) {
  const copy = { ...obj };
  delete copy.__rowNumber;
  return copy;
}

function nextCandidateId_() {
  return buildCandidateId_(getNextCandidateSequence_());
}

function nextCandidateIdWithOffset_(offset) {
  return buildCandidateId_(getNextCandidateSequence_() + Number(offset || 0));
}

function buildCandidateId_(sequence) {
  const prefix = getCandidateIdPrefix_();
  return prefix + String(sequence).padStart(5, '0');
}

function getNextCandidateSequence_() {
  const prefix = getCandidateIdPrefix_();
  const participants = readObjects_(APP_CONFIG.sheets.participants);
  const max = participants.reduce((current, row) => {
    const id = String(row.candidate_id || '');
    if (!id.startsWith(prefix)) return current;
    return Math.max(current, Number(id.replace(prefix, '')) || 0);
  }, 0);
  return max + 1;
}

function getCandidateIdPrefix_() {
  const year = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy');
  return APP_CONFIG.candidateIdPrefix + '-' + year + '-';
}

function getDefaultOnSiteStatus_() {
  const settings = Settings_getAll();
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return settings.onsite_registration_date === today ? 'On-site Registration' : 'Pre-registered';
}
