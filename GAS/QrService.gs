function QrService_generatePayload(candidateId, actorEmail) {
  UserService_requireRole_(['admin'], actorEmail);
  const participants = readObjects_(APP_CONFIG.sheets.participants);
  const participant = participants.find(row => row.candidate_id === candidateId);
  if (!participant) return failure_('Candidate not found');
  const payload = buildQrPayload_(participant);
  const updated = {
    ...participant,
    qr_payload: payload,
    qr_status: participant.qr_payload ? 'Regenerated' : 'Generated',
    qr_generated_at: nowIso_(),
    qr_generated_by: actorEmail || currentUserEmail_(),
    updated_at: nowIso_(),
    updated_by: actorEmail || currentUserEmail_()
  };
  updateObjectAtRow_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, participant.__rowNumber, updated);
  Audit_log('GENERATE_QR_PAYLOAD', APP_CONFIG.sheets.participants, candidateId, 'qr_payload', participant.qr_payload || '', payload, '', actorEmail);
  return success_(stripInternalRowNumber_(updated));
}

function QrService_generateMissingPayloads(actorEmail) {
  UserService_requireRole_(['admin'], actorEmail);
  const participants = readObjects_(APP_CONFIG.sheets.participants);
  const now = nowIso_();
  const user = actorEmail || currentUserEmail_();
  let count = 0;
  participants.forEach(participant => {
    if (participant.qr_payload) return;
    const updated = {
      ...participant,
      qr_payload: buildQrPayload_(participant),
      qr_status: 'Generated',
      qr_generated_at: now,
      qr_generated_by: user,
      updated_at: now,
      updated_by: user
    };
    updateObjectAtRow_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, participant.__rowNumber, updated);
    count += 1;
  });
  Audit_log('GENERATE_MISSING_QR_PAYLOADS', APP_CONFIG.sheets.participants, '', '', '', String(count), '', actorEmail);
  return success_({ generated: count });
}

function QrService_generateAllPayloads(actorEmail) {
  UserService_requireRole_(['admin'], actorEmail);
  const participants = readObjects_(APP_CONFIG.sheets.participants);
  const now = nowIso_();
  const user = actorEmail || currentUserEmail_();
  let count = 0;
  participants.forEach(participant => {
    const updated = {
      ...participant,
      qr_payload: buildQrPayload_(participant),
      qr_status: participant.qr_payload ? 'Regenerated' : 'Generated',
      qr_generated_at: now,
      qr_generated_by: user,
      updated_at: now,
      updated_by: user
    };
    updateObjectAtRow_(APP_CONFIG.sheets.participants, PARTICIPANT_HEADERS, participant.__rowNumber, updated);
    count += 1;
  });
  Audit_log('GENERATE_ALL_QR_PAYLOADS', APP_CONFIG.sheets.participants, '', '', '', String(count), '', actorEmail);
  return success_({ generated: count });
}

function buildQrPayload_(participant) {
  return [participant.full_name || '', participant.email || ''].join('|');
}
