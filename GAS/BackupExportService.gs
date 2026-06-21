function BackupService_create(actorEmail) {
  UserService_requireRole_(['admin'], actorEmail);
  const ss = getSpreadsheet_();
  const copy = DriveApp.getFileById(ss.getId()).makeCopy(ss.getName() + ' backup ' + nowIso_());
  appendObjects_(APP_CONFIG.sheets.backups, [
    'backup_id', 'timestamp', 'spreadsheet_copy_id', 'created_by', 'note'
  ], [{
    backup_id: Utilities.getUuid(),
    timestamp: nowIso_(),
    spreadsheet_copy_id: copy.getId(),
    created_by: actorEmail || currentUserEmail_(),
    note: 'Manual backup'
  }]);
  Audit_log('CREATE_BACKUP', APP_CONFIG.sheets.backups, copy.getId(), '', '', '', '', actorEmail);
  return success_({ fileId: copy.getId(), url: copy.getUrl() });
}
