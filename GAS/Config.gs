const APP_CONFIG = {
  appName: 'Mekong TESOL Check-in',
  spreadsheetId: '1L2u9vwKjRe-dOev_OwUIKG05CVrc3Bxv88z4HKrgXtk',
  candidateIdPrefix: 'CAND',
  sheets: {
    participants: 'Participants',
    groups: 'Groups',
    users: 'Users',
    checkinLogs: 'CheckinLogs',
    auditLogs: 'AuditLogs',
    settings: 'Settings',
    imports: 'ImportBatches',
    backups: 'Backups'
  }
};

const GROUPS = [
  { main_group: 'Participant', detailed_group: 'Participant', color_hex: '#5aa7e8', text_color_hex: '#0f0d2e', priority: 1 },
  { main_group: 'Delegate', detailed_group: 'Delegate', color_hex: '#0f7895', text_color_hex: '#ffffff', priority: 2 },
  { main_group: 'Presenter', detailed_group: 'Oral presenter', color_hex: '#2703a6', text_color_hex: '#ffffff', priority: 3 },
  { main_group: 'Presenter', detailed_group: 'Poster presenter', color_hex: '#dd9a4a', text_color_hex: '#1a0d00', priority: 4 },
  { main_group: 'Presenter', detailed_group: 'Workshop presenter', color_hex: '#1a8f45', text_color_hex: '#ffffff', priority: 5 },
  { main_group: 'Speaker', detailed_group: 'Invited speaker', color_hex: '#6a2ea6', text_color_hex: '#ffffff', priority: 6 },
  { main_group: 'Speaker', detailed_group: 'Keynote speaker', color_hex: '#b4235a', text_color_hex: '#ffffff', priority: 7 }
];

const PARTICIPANT_HEADERS = [
  'candidate_id',
  'title',
  'title_other_text',
  'full_name',
  'email',
  'phone',
  'affiliation',
  'nationality',
  'country',
  'province',
  'job',
  'job_other_institution',
  'institution',
  'years_expe',
  'first_attend',
  'source',
  'source_oth',
  'media_consent',
  'ecert_cons',
  'post_conference',
  'notes',
  'main_group',
  'detailed_group',
  'on_site_status',
  'checkin_status',
  'checkin_time',
  'checkin_by',
  'checkin_method',
  'checkin_count',
  'pre_checkin_note',
  'post_checkin_note',
  'qr_payload',
  'qr_status',
  'qr_generated_at',
  'qr_generated_by',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted'
];

const IMPORT_TEMPLATE_HEADERS = [
  'title',
  'title_other_text',
  'full_name',
  'email',
  'phone',
  'affiliation',
  'nationality',
  'country',
  'province',
  'job',
  'job_other_institution',
  'institution',
  'years_expe',
  'first_attend',
  'source',
  'source_oth',
  'media_consent',
  'ecert_cons',
  'post_conference',
  'notes'
];

const SETTINGS_DEFAULTS = [
  ['onsite_registration_date', '2026-07-19', 'Date used to mark newly added people as On-site Registration'],
  ['allow_staff_delete', 'false', 'Whether check-in staff can delete participants'],
  ['qr_payload_format', 'full_name|email', 'QR payload format. App matches by email first.']
];
