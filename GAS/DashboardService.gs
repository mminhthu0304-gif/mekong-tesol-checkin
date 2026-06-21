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

