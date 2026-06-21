function UserService_getCurrentUser(actorEmail) {
  const email = actorEmail || currentUserEmail_();
  const users = readObjects_(APP_CONFIG.sheets.users);
  const found = users.find(user => normalizeText_(user.email) === normalizeText_(email));
  if (!found) {
    return { email, name: email, role: 'guest', active: false };
  }
  return {
    email: found.email,
    name: found.name || found.email,
    role: found.role || 'staff',
    active: String(found.active).toLowerCase() !== 'false'
  };
}

function UserService_requireRole_(allowedRoles, actorEmail) {
  const user = UserService_getCurrentUser(actorEmail);
  if (!user.active || !allowedRoles.includes(user.role)) {
    throw new Error('Permission denied for ' + user.email);
  }
  return user;
}

function Settings_getAll() {
  return readObjects_(APP_CONFIG.sheets.settings).reduce((settings, row) => {
    settings[row.key] = row.value;
    return settings;
  }, {});
}

function Groups_list() {
  return readObjects_(APP_CONFIG.sheets.groups)
    .filter(group => String(group.active).toLowerCase() !== 'false')
    .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
}
