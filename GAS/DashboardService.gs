function Dashboard_getSummary() {
  const participants = ParticipantService_listActive();
  const checked = participants.filter(row => row.checkin_status === 'Checked-in').length;
  const byGroup = participants.reduce((acc, row) => {
    const key = row.detailed_group || 'Uncategorized';
    if (!acc[key]) acc[key] = { total: 0, checked: 0 };
    acc[key].total += 1;
    if (row.checkin_status === 'Checked-in') acc[key].checked += 1;
    return acc;
  }, {});
  return {
    total: participants.length,
    checked,
    notChecked: participants.length - checked,
    byGroup
  };
}

// Per-day stats computed from CheckinLogs timestamps (no schema change needed)
function Dashboard_getDayStats() {
  const logs = readObjects_(APP_CONFIG.sheets.checkinLogs);
  const checkinLogs = logs.filter(function(l) { return l.action === 'CHECK_IN'; });

  const byDate = {};
  checkinLogs.forEach(function(l) {
    // Extract date in VN timezone from ISO timestamp
    const ts = l.timestamp || '';
    let dateStr = ts.substring(0, 10); // "2026-07-19"
    if (!dateStr) dateStr = 'unknown';

    // Extract day_label from method field "[Ngày 1] QR" → "Ngày 1"
    const methodStr = String(l.method || '');
    const labelMatch = methodStr.match(/^\[(.+?)\]/);
    const dayLabel = labelMatch ? labelMatch[1] : '';

    if (!byDate[dateStr]) byDate[dateStr] = { dayLabel: dayLabel, unique: {}, total: 0 };
    // Keep the most recent day label for that date
    if (dayLabel && !byDate[dateStr].dayLabel) byDate[dateStr].dayLabel = dayLabel;
    byDate[dateStr].unique[l.candidate_id] = true;
    byDate[dateStr].total++;
  });

  return Object.entries(byDate)
    .sort(function(a, b) { return a[0].localeCompare(b[0]); })
    .map(function(entry) {
      var date = entry[0];
      var data = entry[1];
      return {
        date: date,
        day_label: data.dayLabel || date,
        unique_checkins: Object.keys(data.unique).length,
        total_checkins: data.total
      };
    });
}
