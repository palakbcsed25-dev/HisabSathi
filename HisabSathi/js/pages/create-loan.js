Pages = window.Pages || {};

Pages.createLoan = function () {
  if (!Auth.requireAuth()) return document.createElement('div');
  const user = Auth.getCurrentUser();
  const page = document.createElement('div');
  page.className = 'page';
  page.appendChild(renderNavbar(user));

  const main = document.createElement('main');
  main.className = 'main-content';

  const users = DB.getUsers().filter(u => u.id !== user.id);
  const userOptions = users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
  const today = new Date().toISOString().split('T')[0];

  main.innerHTML = `<div class="container" style="max-width:600px">
    <button class="back-btn" id="back-btn">← Back to Dashboard</button>
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title" style="font-size:1.4rem">Create New Loan</div>
          <div class="card-subtitle">Both parties will need to confirm before the loan becomes active.</div>
        </div>
        <span style="font-size:2rem">📝</span>
      </div>

      <form id="create-loan-form">
        <div class="form-group">
          <label class="form-label">Your Role</label>
          <select class="form-input" id="cl-role">
            <option value="lender">I am lending money (Lender)</option>
            <option value="borrower">I am borrowing money (Borrower)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" id="counterparty-label">Borrower</label>
          <select class="form-input" id="cl-counterparty">
            <option value="">— Select a person —</option>
            ${userOptions}
          </select>
          <div class="form-hint">Only registered HissabSaathi users appear here.</div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Loan Amount (₹)</label>
            <input class="form-input" id="cl-amount" type="number" min="1" placeholder="e.g. 5000" required />
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input class="form-input" id="cl-due" type="date" min="${today}" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Note (optional)</label>
          <input class="form-input" id="cl-note" type="text" placeholder="e.g. For textbooks, trip expenses…" />
        </div>

        <div style="background:rgba(196,122,82,0.08);border:1px solid rgba(196,122,82,0.25);border-radius:var(--radius-sm);padding:14px 16px;margin-bottom:20px;font-size:0.85rem;color:var(--text-muted);line-height:1.6">
          🔒 <b>TrustLock:</b> After creation, both you and the other party must tap "Confirm" before the loan is activated. This is your mutual agreement on the ledger.
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg">Create Loan + Confirm as Me</button>
      </form>
    </div>
  </div>`;

  page.appendChild(main);
  page.querySelector('#back-btn').onclick = () => Router.navigate('dashboard');

  const roleSelect = page.querySelector('#cl-role');
  const label = page.querySelector('#counterparty-label');
  roleSelect.onchange = () => {
    label.textContent = roleSelect.value === 'lender' ? 'Borrower' : 'Lender';
  };

  page.querySelector('#create-loan-form').onsubmit = (e) => {
    e.preventDefault();
    const role = page.querySelector('#cl-role').value;
    const counterpartyId = page.querySelector('#cl-counterparty').value;
    const amount = parseFloat(page.querySelector('#cl-amount').value);
    const dueDate = page.querySelector('#cl-due').value;
    const note = page.querySelector('#cl-note').value.trim();

    if (!counterpartyId) { showToast('Please select the other person.', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Please enter a valid amount.', 'error'); return; }
    if (!dueDate) { showToast('Please select a due date.', 'error'); return; }

    const counterparty = DB.getUserById(counterpartyId);
    const lenderId = role === 'lender' ? user.id : counterpartyId;
    const borrowerId = role === 'lender' ? counterpartyId : user.id;
    const lenderName = role === 'lender' ? user.name : counterparty.name;
    const borrowerName = role === 'lender' ? counterparty.name : user.name;

    const loan = {
      id: 'l' + uid(),
      lenderId, lenderName,
      borrowerId, borrowerName,
      amount, paidAmount: 0, remainingAmount: amount,
      dueDate, note,
      status: 'pending',
      lenderConfirmed: role === 'lender',
      borrowerConfirmed: role === 'borrower',
      createdAt: new Date().toISOString(),
    };

    DB.addLoan(loan);
    showToast('Loan created! Waiting for other party to confirm.', 'success');
    Router.navigate('loan-detail', { loanId: loan.id });
  };

  return page;
};
