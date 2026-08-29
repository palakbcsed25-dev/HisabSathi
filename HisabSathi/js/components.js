// ===== SHARED COMPONENTS =====
function renderNavbar(user) {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  
  const pendingCount = user ? DB.getPendingCount(user.id) : 0;

  nav.innerHTML = `
    <div class="container">
      <div class="navbar-inner">
        <div class="navbar-logo" style="cursor:pointer" id="nav-logo">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#C47A52" opacity="0.15"/>
            <path d="M10 22 L16 10 L22 22" stroke="#C47A52" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.5 18 h7" stroke="#C47A52" stroke-width="2" stroke-linecap="round"/>
          </svg>
          HissabSaathi
        </div>
        <div class="navbar-actions">
          ${user ? `
            <button class="btn btn-secondary btn-sm" id="nav-pending" title="Pending Verifications">
              🔔 Pending ${pendingCount > 0 ? `<span class="pending-badge">${pendingCount}</span>` : ''}
            </button>
          ` : ''}
          <button class="theme-toggle" id="theme-btn" title="Toggle dark/light mode">🌙</button>
          ${user ? `
            <div class="nav-user">
              <div class="nav-avatar">${user.initials || getInitials(user.name)}</div>
              <span class="hide-mobile">${user.name.split(' ')[0]}</span>
            </div>
            <button class="btn-logout" id="nav-logout">Logout</button>
          ` : ''}
        </div>
        <!-- Hamburger (mobile only) -->
        <button class="hamburger" id="hamburger-btn" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <!-- Mobile Menu Drawer -->
    <div class="mobile-menu" id="mobile-menu">
      <button class="theme-toggle" id="theme-btn-mobile" title="Toggle dark/light mode" style="align-self:flex-start">🌙</button>
      ${user ? `
        <div class="nav-user">
          <div class="nav-avatar">${user.initials || getInitials(user.name)}</div>
          <span style="font-weight:600">${user.name}</span>
        </div>
        ${pendingCount > 0 ? `
          <button class="btn btn-secondary" id="mob-pending">
            🔔 Pending Verifications <span class="pending-badge">${pendingCount}</span>
          </button>
        ` : ''}
        <button class="btn-logout" id="mob-logout">Logout</button>
      ` : ''}
    </div>`;

  nav.querySelector('#nav-logo').onclick = () => {
    if (Auth.getCurrentUser()) Router.navigate('dashboard');
    else Router.navigate('landing');
  };

  const pendingBtn = nav.querySelector('#nav-pending');
  if (pendingBtn) {
    pendingBtn.onclick = () => Router.navigate('pending-verifications');
  }

  const themeBtn = nav.querySelector('#theme-btn');
  const updateThemeIcon = () => {
    themeBtn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  };
  updateThemeIcon();
  themeBtn.onclick = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('hissab_theme', isDark ? 'light' : 'dark');
    updateThemeIcon();
  };

  if (user) {
    nav.querySelector('#nav-logout').onclick = () => {
      Auth.logout();
      showToast('Logged out successfully', 'info');
      Router.navigate('landing');
    };
  }

  // ---- Hamburger toggle ----
  const hamburger = nav.querySelector('#hamburger-btn');
  const mobileMenu = nav.querySelector('#mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.onclick = () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    };

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });

    // Mobile theme toggle
    const mobilethemeBtn = nav.querySelector('#theme-btn-mobile');
    if (mobilethemeBtn) {
      const updateMobileIcon = () => {
        mobilethemeBtn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
      };
      updateMobileIcon();
      mobilethemeBtn.onclick = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('hissab_theme', isDark ? 'light' : 'dark');
        updateMobileIcon();
        themeBtn.textContent = isDark ? '☀️' : '🌙';
      };
    }

    // Mobile pending btn
    const mobPending = nav.querySelector('#mob-pending');
    if (mobPending) {
      mobPending.onclick = () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        Router.navigate('pending-verifications');
      };
    }

    // Mobile logout
    const mobLogout = nav.querySelector('#mob-logout');
    if (mobLogout) {
      mobLogout.onclick = () => {
        Auth.logout();
        showToast('Logged out successfully', 'info');
        Router.navigate('landing');
      };
    }
  }

  return nav;
}

function renderLoanCard(loan, onClick) {
  const pct = loan.amount > 0 ? Math.round((loan.paidAmount / loan.amount) * 100) : 100;
  const card = document.createElement('div');
  card.className = `loan-card ${loan.status} fade-in`;
  card.innerHTML = `
    <div class="loan-card-header">
      <div>
        <div class="loan-parties">
          <span style="color:var(--teal);font-weight:700">${loan.lenderName}</span>
          <span style="color:var(--text-muted);font-size:0.8rem;margin:0 6px">→</span>
          <span style="color:var(--copper);font-weight:700">${loan.borrowerName}</span>
        </div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:3px">Due: ${formatDate(loan.dueDate)}</div>
      </div>
      <div style="text-align:right">
        <div class="loan-amount">${formatINR(loan.amount)}</div>
        <div style="margin-top:4px">${renderBadgeHTML(loan.status)}</div>
      </div>
    </div>
    <div class="loan-progress-bar">
      <div class="loan-progress-fill" style="width:${pct}%"></div>
    </div>
    <div class="loan-meta">
      <span>Paid: <b>${formatINR(loan.paidAmount)}</b></span>
      <span>Remaining: <b style="color:${loan.remainingAmount > 0 ? 'var(--danger)' : 'var(--teal)'}">${formatINR(loan.remainingAmount)}</b></span>
      <span>${pct}% complete</span>
      ${loan.note ? `<span>📝 ${loan.note}</span>` : ''}
    </div>`;
  if (loan.status === 'overdue') {
    const flag = document.createElement('div');
    flag.style = 'position:absolute;top:12px;right:12px;font-size:1.2rem';
    flag.textContent = '🚩';
    card.appendChild(flag);
  }
  card.style.cursor = 'pointer';
  card.onclick = onClick;
  return card;
}

function renderBadgeHTML(status) {
  const map = {
    active: '<span class="badge badge-active">● Active</span>',
    completed: '<span class="badge badge-completed">✓ Completed</span>',
    overdue: '<span class="badge badge-overdue">⚠ Overdue</span>',
    pending: '<span class="badge badge-pending">◌ Pending</span>',
    declined: '<span class="badge badge-pending" style="background:rgba(192,57,43,0.15);color:var(--danger)">✕ Declined</span>',
  };
  return map[status] || '';
}

function renderTrustLockBadge(state) {
  if (state === 'declined' || state?.status === 'declined') {
    return '<span class="trustlock-declined">🛡️ TrustLock: DECLINED</span>';
  }
  if (state === true || state?.trustlockSecure || state === 'secure') {
    return '<span class="trustlock-secure">🔒 TrustLock: SECURE</span>';
  }
  return '<span class="trustlock-pending">⏳ TrustLock: AWAITING VERIFICATION</span>';
}

function renderVerificationDetails(item) {
  const isDeclined = item.status === 'declined';
  const isSecure = item.trustlockSecure || (item.lenderConfirmed && item.borrowerConfirmed);
  const isSigned = item.digitallySigned || isSecure;

  return `
    <details class="verification-details">
      <summary>View Verification Details</summary>
      <div class="details-checklist">
        ${isDeclined ? `
          <div class="check-item failed">✕ Transaction declined by peer</div>
          ${item.declineReason ? `<div class="check-item-sub">Reason: "${item.declineReason}"</div>` : ''}
        ` : `
          <div class="check-item ${isSecure ? 'passed' : 'pending'}">
            ${isSecure ? '✓' : '⏳'} Both peers confirmed
          </div>
          <div class="check-item ${isSigned ? 'passed' : 'pending'}">
            ${isSigned ? '✓' : '⏳'} Digitally signed and verified
          </div>
          <div class="check-item ${isSecure ? 'passed' : 'pending'}">
            ${isSecure ? '✓' : '⏳'} Shared ledger entry synchronized
          </div>
        `}
      </div>
    </details>
  `;
}

