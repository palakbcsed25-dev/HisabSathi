Pages = window.Pages || {};

Pages.logPayment = function () {
  if (!Auth.requireAuth()) return document.createElement('div');
  const user = Auth.getCurrentUser();
  const loanId = Router.params.loanId;
  const page = document.createElement('div');
  page.className = 'page';
  page.appendChild(renderNavbar(user));

  const loan = DB.getLoanById(loanId);
  if (!loan) {
    Router.navigate('dashboard');
    return page;
  }

  const main = document.createElement('main');
  main.className = 'main-content';
  const today = new Date().toISOString().split('T')[0];

  main.innerHTML = `<div class="container" style="max-width:600px">
    <button class="back-btn" id="back-btn">← Back to Loan</button>
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title" style="font-size:1.3rem">Log a Payment</div>
          <div class="card-subtitle">${loan.lenderName} → ${loan.borrowerName} · Remaining: <b style="color:var(--danger)">${formatINR(loan.remainingAmount)}</b></div>
        </div>
        <span style="font-size:2rem">💰</span>
      </div>

      <form id="log-payment-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Payment Amount (₹)</label>
            <input class="form-input" id="lp-amount" type="number" min="1" max="${loan.remainingAmount}" placeholder="e.g. 2000" required />
            <div class="form-hint">Max: ${formatINR(loan.remainingAmount)}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Payment Date</label>
            <input class="form-input" id="lp-date" type="date" value="${today}" max="${today}" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Note (optional)</label>
          <input class="form-input" id="lp-note" type="text" placeholder="e.g. Cash payment, UPI, etc." />
        </div>

        <div style="background:rgba(61,119,114,0.08);border:1px solid rgba(61,119,114,0.25);border-radius:var(--radius-sm);padding:14px 16px;margin-bottom:20px;font-size:0.85rem;color:var(--text-muted);line-height:1.6">
          ⏳ <b>TrustLock:</b> After logging, the <b>other party</b> must confirm this payment. Once confirmed, a SHA-256 integrity hash is generated and the payment is marked <span style="color:var(--teal);font-weight:700">SECURE</span>.
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" id="submit-btn">Log Payment →</button>
      </form>

      <!-- Success state (hidden initially) -->
      <div id="success-panel" style="display:none;text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:12px">🎉</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:800;margin-bottom:8px">Payment Logged!</div>
        <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:4px">Amount: <b id="success-amount"></b></div>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:20px">Waiting for other party to confirm and generate integrity hash.</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="view-loan-btn">View Loan Ledger</button>
          <button class="btn btn-secondary" id="back-dashboard-btn">Dashboard</button>
        </div>
      </div>
    </div>
  </div>`;

  page.appendChild(main);
  page.querySelector('#back-btn').onclick = () => Router.navigate('loan-detail', { loanId });

  page.querySelector('#log-payment-form').onsubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(page.querySelector('#lp-amount').value);
    const date = page.querySelector('#lp-date').value;
    const note = page.querySelector('#lp-note').value.trim();

    if (!amount || amount <= 0) { showToast('Enter a valid amount.', 'error'); return; }
    if (amount > loan.remainingAmount) { showToast(`Amount cannot exceed remaining ₹${loan.remainingAmount}.`, 'error'); return; }

    const submitBtn = page.querySelector('#submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging…';

    const paymentId = 'p' + uid();
    const now = new Date().toISOString();

    const payment = {
      id: paymentId,
      loanId,
      amount,
      date,
      note,
      loggedBy: user.id,
      confirmedBy: null,
      hash: null,
      trustlockSecure: false,
      createdAt: now,
    };

    DB.addPayment(payment);

    // Update loan balance
    const newPaid = loan.paidAmount + amount;
    const newRemaining = loan.remainingAmount - amount;
    const updates = { paidAmount: newPaid, remainingAmount: newRemaining };
    if (newRemaining <= 0) updates.status = 'completed';
    DB.updateLoan(loanId, updates);

    // Show success
    page.querySelector('#log-payment-form').style.display = 'none';
    const panel = page.querySelector('#success-panel');
    panel.style.display = 'block';
    panel.querySelector('#success-amount').textContent = formatINR(amount);

    if (newRemaining <= 0) {
      showToast('🎉 Loan fully repaid! Marked as Completed.', 'success', 5000);
    } else {
      showToast(`Payment of ${formatINR(amount)} logged! Awaiting other party's confirmation.`, 'success');
    }

    panel.querySelector('#view-loan-btn').onclick = () => Router.navigate('loan-detail', { loanId });
    panel.querySelector('#back-dashboard-btn').onclick = () => Router.navigate('dashboard');
  };

  return page;
};
