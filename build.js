const fs = require('fs');

let html = fs.readFileSync('checkin-app-prototype.html', 'utf8');

// ═══════════════════════════════════════════════════════════════
// 1. Fix Google Fonts: replace <link> tags with @import
// ═══════════════════════════════════════════════════════════════
html = html.replace(
  /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">[\s\S]*?<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*">/,
  `<style>@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');</style>`
);

// ═══════════════════════════════════════════════════════════════
// 2. Remove mock data
// ═══════════════════════════════════════════════════════════════
html = html.replace(/participants:\[[\s\S]*?\],\s*logs:\[[\s\S]*?\]/, 'participants:[], logs:[]');

// ═══════════════════════════════════════════════════════════════
// 3. Add extra CSS (spinner + auto-login state)
// ═══════════════════════════════════════════════════════════════
html = html.replace(
  '.login-hint{font-size:12px;color:var(--ink-300);text-align:center;margin-top:16px}',
  `.login-hint{font-size:12px;color:var(--ink-300);text-align:center;margin-top:16px}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spinner{width:28px;height:28px;border:3px solid #e8e4ff;border-top-color:#6a2ea6;border-radius:50%;animation:spin .8s linear infinite;margin:18px auto 6px}
    .auto-login-info{text-align:center;color:var(--ink-500);font-size:14px;line-height:1.7;padding-bottom:4px}
    .auto-login-email{font-weight:700;color:var(--ink-900);font-family:'Sora';display:block;margin-top:4px;word-break:break-all}
    .auto-login-switch{font-size:12px;color:var(--bl);cursor:pointer;text-decoration:underline;background:none;border:none;padding:0;font-family:inherit;margin-top:8px;display:block;width:100%;text-align:center}
    .auto-login-switch:hover{color:var(--ink-900)}
    .remember-row{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:13px;color:var(--ink-500)}
    .remember-row input{width:16px;height:16px;accent-color:#6a2ea6;cursor:pointer}`
);

// ═══════════════════════════════════════════════════════════════
// 4. Replace login overlay HTML (cleaner, auto-login-aware)
// ═══════════════════════════════════════════════════════════════
html = html.replace(
  `<div id="loginOverlay" class="login-overlay">
    <div class="login-card">
      <div class="login-logo">MT</div>
      <h1 class="login-title">Mekong TESOL Check-in</h1>
      <p class="login-sub">Nhập địa chỉ email của bạn để xác nhận quyền truy cập.</p>
      <div class="field">
        <label for="loginEmailInput">Email đăng nhập</label>
        <input class="input" id="loginEmailInput" type="email" placeholder="your@email.com" autocomplete="email" style="min-height:52px;font-size:16px">
      </div>
      <div id="loginErrBox" class="login-err"></div>
      <button class="btn btn-primary" id="loginSubmitBtn" style="width:100%;margin-top:18px;min-height:50px;font-size:16px">
        <i data-lucide="log-in"></i>Đăng nhập
      </button>
      <p class="login-hint" id="loginHintText">Demo: admin@mekongtesol.vn · staff01@mekongtesol.vn</p>
    </div>
  </div>`,
  `<div id="loginOverlay" class="login-overlay">
    <div class="login-card">
      <div class="login-logo">MT</div>
      <h1 class="login-title">Mekong TESOL Check-in</h1>

      <!-- Auto-login state (shown when saved email found) -->
      <div id="autoLoginState" style="display:none">
        <p class="auto-login-info">Đang xác thực tài khoản...<span class="auto-login-email" id="autoLoginEmail"></span></p>
        <div class="spinner"></div>
        <button class="auto-login-switch" id="switchAccountBtn">Dùng tài khoản khác</button>
      </div>

      <!-- Manual email form -->
      <div id="manualLoginState">
        <p class="login-sub" style="margin-bottom:20px">Nhập email được cấp quyền truy cập hệ thống.</p>
        <div class="field">
          <label for="loginEmailInput">Email Google</label>
          <input class="input" id="loginEmailInput" type="email" placeholder="your@email.com" autocomplete="email" style="min-height:52px;font-size:16px">
        </div>
        <label class="remember-row">
          <input type="checkbox" id="rememberMeCheck" checked>
          Ghi nhớ đăng nhập trên thiết bị này
        </label>
        <div id="loginErrBox" class="login-err"></div>
        <button class="btn btn-primary" id="loginSubmitBtn" style="width:100%;margin-top:16px;min-height:50px;font-size:16px">
          <i data-lucide="log-in"></i>Đăng nhập
        </button>
        <p class="login-hint" id="loginHintText">Demo: admin@mekongtesol.vn · staff01@mekongtesol.vn</p>
      </div>
    </div>
  </div>`
);

// ═══════════════════════════════════════════════════════════════
// 5. Replace standalone attemptLogin with GAS + localStorage version
// ═══════════════════════════════════════════════════════════════
html = html.replace(
  /\/\/ Standalone mock login[\s\S]*?function attemptLogin\(email\)\{[\s\S]*?\}\s*\n\s*function bindLoginEvents/,
  `// GAS login with localStorage persistence
    const LS_KEY = 'mt_checkin_email';

    function getSavedEmail() {
      try { return localStorage.getItem(LS_KEY) || ''; } catch(e) { return ''; }
    }
    function saveEmail(email) {
      try {
        const remember = document.getElementById('rememberMeCheck');
        if(!remember || remember.checked) localStorage.setItem(LS_KEY, email);
      } catch(e) {}
    }
    function clearSavedEmail() {
      try { localStorage.removeItem(LS_KEY); } catch(e) {}
    }

    function showAutoLoginState(email) {
      const autoState = document.getElementById('autoLoginState');
      const manualState = document.getElementById('manualLoginState');
      const emailEl = document.getElementById('autoLoginEmail');
      if(autoState) autoState.style.display = '';
      if(manualState) manualState.style.display = 'none';
      if(emailEl) emailEl.textContent = email;
    }

    function showManualLoginState() {
      const autoState = document.getElementById('autoLoginState');
      const manualState = document.getElementById('manualLoginState');
      if(autoState) autoState.style.display = 'none';
      if(manualState) manualState.style.display = '';
      clearLoginError();
      clearSavedEmail();
      lucide.createIcons();
    }

    function attemptLogin(email) {
      clearLoginError();
      if(window.google && google.script) {
        google.script.run
          .withSuccessHandler(function(res) {
            if(res && res.ok && res.data) {
              const roleMap = { 'admin':'admin','staff':'staff','check-in':'staff','guest':'guest' };
              res.data.role = roleMap[res.data.role] || 'guest';
              saveEmail(email);
              loadParticipantData(res.data);
            } else {
              clearSavedEmail();
              showManualLoginState();
              showLoginError((res && res.message) || 'Email không có quyền truy cập hệ thống này.');
            }
          })
          .withFailureHandler(function(err) {
            clearSavedEmail();
            showManualLoginState();
            showLoginError('Lỗi kết nối: ' + (err.message || 'Không rõ nguyên nhân. Thử lại sau.'));
          })
          .loginWithEmail(email);
      } else {
        // Standalone mock
        const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
        if(found) {
          saveEmail(email);
          loginSuccess(found);
        } else {
          showLoginError('Email không có trong danh sách. Demo: admin@mekongtesol.vn hoặc staff01@mekongtesol.vn');
        }
      }
    }

    function loadParticipantData(userInfo) {
      const loadingEl = document.createElement('div');
      loadingEl.id = 'dataLoadingBar';
      loadingEl.style.cssText = 'position:fixed;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#6a2ea6,#dd9a4a);z-index:600';
      document.body.appendChild(loadingEl);
      google.script.run
        .withSuccessHandler(function(res) {
          const bar = document.getElementById('dataLoadingBar');
          if(bar) bar.remove();
          if(res && res.ok && res.data) {
            state.participants = (res.data.participants || []).map(function(p) {
              return {
                id: p.candidate_id || '',
                name: p.full_name || '',
                email: p.email || '',
                phone: p.phone || '',
                affiliation: p.affiliation || '',
                title: p.title || '',
                titleOtherText: p.title_other_text || '',
                mainGroup: p.main_group || 'Participant',
                detailedGroup: p.detailed_group || 'Participant',
                source: p.on_site_status || 'Pre-registered',
                status: p.checkin_status || 'Not checked-in',
                checkinTime: p.checkin_time || '',
                checkinBy: p.checkin_by || '',
                method: p.checkin_method || '',
                counter: Number(p.checkin_count) || 0,
                qrStatus: p.qr_status || 'Not generated',
                qrPayload: p.qr_payload || '',
                preNote: p.pre_checkin_note || '',
                postNote: p.post_checkin_note || '',
                mediaConsent: p.media_consent || '',
                notes: p.notes || '',
                nationality: p.nationality || '',
                country: p.country || '',
                province: p.province || '',
                job: p.job || '',
                jobOtherInstitution: p.job_other_institution || '',
                institution: p.institution || '',
                yearsExperience: p.years_expe || '',
                firstAttend: p.first_attend || '',
                sourceOriginal: p.source || '',
                sourceOther: p.source_oth || '',
                ecertConsent: p.ecert_cons || '',
                postConference: p.post_conference || ''
              };
            });
            if(res.data.groups && res.data.groups.length) {
              window.GROUPS = res.data.groups.map(function(g) {
                return { main: g.main_group, detail: g.detailed_group, color: g.color_hex, text: g.text_color_hex };
              });
            }
            if(res.data.settings && res.data.settings.onsite_registration_date) {
              state.settings.onsiteDate = res.data.settings.onsite_registration_date;
            }
          }
          loginSuccess(userInfo);
        })
        .withFailureHandler(function(err) {
          const bar = document.getElementById('dataLoadingBar');
          if(bar) bar.remove();
          loginSuccess(userInfo);
          toast('Cảnh báo', 'Không tải được dữ liệu: ' + (err.message || ''));
        })
        .getBootstrapDataForUser(userInfo.email);
    }

    let loginEventsBound = false;
    function bindLoginEvents`
);

// ═══════════════════════════════════════════════════════════════
// 6. Fix double-binding guard + add switch account button binding
// ═══════════════════════════════════════════════════════════════
html = html.replace(
  /let loginEventsBound = false;\s*function bindLoginEvents\(\)\{/,
  `let loginEventsBound = false;
    function bindLoginEvents(){
      if(loginEventsBound) return;
      loginEventsBound = true;`
);

// Add binding for switchAccountBtn inside bindLoginEvents
html = html.replace(
  `if(logoutBtn) logoutBtn.addEventListener('click', logout);
    }`,
  `if(logoutBtn) logoutBtn.addEventListener('click', logout);
      const switchBtn = document.getElementById('switchAccountBtn');
      if(switchBtn) switchBtn.addEventListener('click', showManualLoginState);
    }`
);

// ═══════════════════════════════════════════════════════════════
// 7. Replace entry-point: check localStorage, auto-login if found
// ═══════════════════════════════════════════════════════════════
html = html.replace(
  /\/\/ Always bind login events so the button works[\s\S]*?lucide\.createIcons\(\);[\s\S]*?state\.role/,
  `// ── Entry Point ──
    bindLoginEvents();
    lucide.createIcons();

    // Auto-login from localStorage if email is saved
    (function checkAutoLogin() {
      if(!window.google || !google.script) return; // only in GAS mode
      const saved = getSavedEmail();
      if(saved) {
        showAutoLoginState(saved);
        attemptLogin(saved);
      }
    })();

    state.role`
);

// ═══════════════════════════════════════════════════════════════
// 8. Also clear localStorage on logout
// ═══════════════════════════════════════════════════════════════
html = html.replace(
  `function logout(){
      state.currentUser = null;
      state.role = 'guest';
      state.participants = [];
      state.logs = [];
      state.selectedId = null;
      showLogin();
      lucide.createIcons();
    }`,
  `function logout(){
      clearSavedEmail();
      state.currentUser = null;
      state.role = 'guest';
      state.participants = [];
      state.logs = [];
      state.selectedId = null;
      showManualLoginState();
      showLogin();
      lucide.createIcons();
    }`
);

// GAS write-backs live in the prototype source. Do not inject additional calls here.

fs.writeFileSync('GAS/Index.html', html);
console.log('GAS/Index.html has been generated successfully.');
