Pages = window.Pages || {};

Pages.dashboard = function () {
  if (!Auth.requireAuth()) return document.createElement('div');
  const user = Auth.getCurrentUser();
  const page = document.createElement('div');
  page.className = 'page';
  page.appendChild(renderNavbar(user));

  const main = document.createElement('main');
  main.className = 'main-content';
  const pendingCount = DB.getPendingCount(user.id);

  main.innerHTML = `<div class="container">
    <div class="dashboard-greeting">
      <h2>Welcome back, ${user.name.split(' ')[0]} 👋</h2>
      <p>Here's your financial overview for today, ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    </div>

    ${pendingCount > 0 ? `
      <div class="confirm-banner fade-in" style="background:rgba(196,122,82,0.12);border-color:rgba(196,122,82,0.35);margin-bottom:24px">
        <span class="confirm-text" style="color:var(--copper)">
          🔔 You have <b>${pendingCount} pending verification request${pendingCount === 1 ? '' : 's'}</b> awaiting your confirmation.
        </span>
        <button class="btn btn-primary btn-sm" id="dash-pending-btn">Review Requests (${pendingCount}) →</button>
      </div>
    ` : ''}

    <div class="stats-grid" id="stats-grid"></div>
    <div class="section-header">
      <span class="section-title">Your Loans</span>
      <button class="btn btn-primary btn-sm" id="new-loan-btn">+ New Loan</button>
    </div>
    <div class="loans-filter">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="overdue">Overdue</button>
      <button class="filter-btn" data-filter="completed">Completed</button>
    </div>
    <div id="loans-list"></div>
  </div>`;

  page.appendChild(main);

  const dashPendingBtn = page.querySelector('#dash-pending-btn');
  if (dashPendingBtn) {
    dashPendingBtn.onclick = () => Router.navigate('pending-verifications');
  }

  const allLoans = DB.getLoansByUser(user.id);

  // Stats
  const lent = allLoans.filter(l => l.lenderId === user.id).reduce((s, l) => s + l.amount, 0);
  const borrowed = allLoans.filter(l => l.borrowerId === user.id).reduce((s, l) => s + l.amount, 0);
  const active = allLoans.filter(l => l.status === 'active').length;
  const overdue = allLoans.filter(l => l.status === 'overdue').length;

  const stats = [
    { label: 'Total Lent', value: formatINR(lent), icon: '💸', cls: '' },
    { label: 'Total Borrowed', value: formatINR(borrowed), icon: '🏦', cls: 'teal' },
    { label: 'Active Loans', value: active, icon: '📋', cls: 'warning' },
    { label: 'Overdue', value: overdue, icon: '🚩', cls: 'danger' },
  ];
  const grid = page.querySelector('#stats-grid');
  stats.forEach(s => {
    const card = document.createElement('div');
    card.className = `stat-card ${s.cls}`;
    card.innerHTML = `
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-icon">${s.icon}</div>`;
    grid.appendChild(card);
  });

  let currentFilter = 'all';
  const renderLoans = () => {
    const list = page.querySelector('#loans-list');
    list.innerHTML = '';
    const filtered = currentFilter === 'all' ? allLoans : allLoans.filter(l => l.status === currentFilter);

    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state">
        <div class="empty-icon">${currentFilter === 'overdue' ? '✅' : '📭'}</div>
        <div class="empty-title">${currentFilter === 'overdue' ? 'No overdue loans!' : 'No loans found'}</div>
        <div style="margin-top:8px;color:var(--text-muted);font-size:0.85rem">
          ${currentFilter === 'all' ? 'Create your first loan to get started.' : ''}
        </div>
        ${currentFilter === 'all' ? '<button class="btn btn-primary" style="margin-top:16px" id="empty-new-loan">+ Create First Loan</button>' : ''}
      </div>`;
      const enl = list.querySelector('#empty-new-loan');
      if (enl) enl.onclick = () => Router.navigate('create-loan');
      return;
    }

    filtered.sort((a, b) => {
      const order = { overdue: 0, active: 1, pending: 2, completed: 3 };
      return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    });

    filtered.forEach(loan => {
      list.appendChild(renderLoanCard(loan, () => Router.navigate('loan-detail', { loanId: loan.id })));
    });
  };

  page.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      page.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderLoans();
    };
  });

  page.querySelector('#new-loan-btn').onclick = () => Router.navigate('create-loan');

  renderLoans();
  return page;
};
