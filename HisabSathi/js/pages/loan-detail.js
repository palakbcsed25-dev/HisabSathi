Pages = window.Pages || {};

Pages.loanDetail = function () {
  if (!Auth.requireAuth()) return document.createElement('div');
  const user = Auth.getCurrentUser();
  const loanId = Router.params.loanId;
  const page = document.createElement('div');
  page.className = 'page';
  page.appendChild(renderNavbar(user));

  const main = document.createElement('main');
  main.className = 'main-content';
  page.appendChild(main);

  const render = () => {
    const loan = DB.getLoanById(loanId);
    if (!loan) {
      main.innerHTML = `<div class="container"><div class="empty-state"><div class="empty-icon">❓</div><div class="empty-title">Loan not found</div></div></div>`;
      return;
    }

    const payments = DB.getPaymentsByLoan(loanId);
    const isLender = loan.lenderId === user.id;
    const isBorrower = loan.borrowerId === user.id;
    const canConfirm = (isLender && !loan.lenderConfirmed) || (isBorrower && !loan.borrowerConfirmed);
    const pct = loan.amount > 0 ? Math.round((loan.paidAmount / loan.amount) * 100) : 100;

    const overdueLabel = isOverdue(loan) && loan.status !== 'completed'
      ? `<span style="color:var(--danger);font-weight:700;font-size:0.85rem">🚩 OVERDUE — ${Math.floor((new Date() - new Date(loan.dueDate)) / 86400000)} days past due</span>`
      : '';

    main.innerHTML = `<div class="container">
      <button class="back-btn" id="back-btn">← Back to Dashboard</button>

      ${canConfirm && loan.status === 'pending' ? `
        <div class="confirm-banner">
          <span class="confirm-text">⏳ Waiting for your TrustLock confirmation to activate this loan.</span>
          <div style="display:flex;gap:10px">
            <button class="btn btn-secondary" id="decline-loan-btn">✕ Decline Loan</button>
            <button class="btn btn-success" id="confirm-loan-btn">✓ Confirm Loan</button>
          </div>
        </div>` : ''}

      <div class="loan-detail-hero">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:12px">
          <div>
            <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:4px">Loan Agreement</div>
            <h2>${loan.lenderName} → ${loan.borrowerName}</h2>
            ${overdueLabel}
          </div>
          <div>${renderBadgeHTML(loan.status)}</div>
        </div>

        <div class="amount-big">${formatINR(loan.amount)}</div>

        <div class="progress-wrap">
          <div class="progress-label">
            <span>Repaid: ${formatINR(loan.paidAmount)}</span>
            <span>Remaining: <b style="color:${loan.remainingAmount > 0 ? 'var(--danger)' : 'var(--teal)'}">${formatINR(loan.remainingAmount)}</b></span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div style="font-size:0.78rem;color:var(--text-muted);text-align:right;margin-top:4px">${pct}% complete</div>
        </div>

        <div class="detail-meta-grid">
          <div class="detail-meta-item"><div class="label">Due Date</div><div class="value">${formatDate(loan.dueDate)}</div></div>
          <div class="detail-meta-item"><div class="label">Created</div><div class="value">${formatDate(loan.createdAt)}</div></div>
          <div class="detail-meta-item"><div class="label">Note</div><div class="value">${loan.note || '—'}</div></div>
          <div class="detail-meta-item">
            <div class="label">TrustLock Status</div>
            <div class="value" style="margin-top:4px">
              <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">
                ${loan.lenderConfirmed ? '✅' : '⬜'} ${loan.lenderName.split(' ')[0]} (Lender)
                &nbsp;·&nbsp;
                ${loan.borrowerConfirmed ? '✅' : '⬜'} ${loan.borrowerName.split(' ')[0]} (Borrower)
              </div>
            </div>
          </div>
        </div>

        ${renderVerificationDetails(loan)}
      </div>

      <!-- Ledger -->
      <div class="section-header">
        <span class="section-title">📒 Shared Ledger</span>
        ${loan.status !== 'completed' && loan.status !== 'pending' && loan.status !== 'declined' ? `
          <button class="btn btn-primary btn-sm" id="log-payment-btn">+ Log Payment</button>
        ` : ''}
      </div>

      <div id="ledger-entries"></div>
      ${payments.length === 0 ? '<div class="empty-state" style="padding:24px"><div class="empty-icon">💳</div><div class="empty-title">No payments yet</div></div>' : ''}
    </div>`;

    // Back
    main.querySelector('#back-btn').onclick = () => Router.navigate('dashboard');
    const lpBtn = main.querySelector('#log-payment-btn');
    if (lpBtn) lpBtn.onclick = () => Router.navigate('log-payment', { loanId: loan.id });

    // Confirm loan
    const confirmLoanBtn = main.querySelector('#confirm-loan-btn');
    if (confirmLoanBtn) {
      confirmLoanBtn.onclick = () => {
        showModal({
          title: '🔒 Confirm Loan Agreement',
          body: `You are confirming the loan of <b>${formatINR(loan.amount)}</b> between <b>${loan.lenderName}</b> and <b>${loan.borrowerName}</b>. This activates the TrustLock agreement.`,
          confirmText: 'Yes, Confirm',
          onConfirm: () => {
            const updates = isLender ? { lenderConfirmed: true } : { borrowerConfirmed: true };
            const updatedLoan = { ...loan, ...updates };
            if (updatedLoan.lenderConfirmed && updatedLoan.borrowerConfirmed) {
              updates.status = isOverdue(updatedLoan) ? 'overdue' : 'active';
            }
            DB.updateLoan(loanId, updates);
            showToast('Loan confirmed! TrustLock activated. 🔒', 'success');
            render();
          }
        });
      };
    }

    // Decline loan
    const declineLoanBtn = main.querySelector('#decline-loan-btn');
    if (declineLoanBtn) {
      declineLoanBtn.onclick = () => {
        showModal({
          title: 'Decline Loan Request',
          body: `
            <p>Are you sure you want to decline this loan request?</p>
            <div class="form-group" style="margin-top:14px">
              <label class="form-label">Reason for declining (optional)</label>
              <input class="form-input" id="decline-loan-reason" placeholder="e.g. Terms not agreed / wrong amount" />
            </div>
          `,
          confirmText: 'Decline Loan',
          danger: true,
          onConfirm: () => {
            const reasonInput = document.getElementById('decline-loan-reason');
            const reason = reasonInput ? reasonInput.value.trim() : '';
            DB.declineLoan(loanId, reason, user.id);
            showToast('Loan request declined.', 'info');
            render();
          }
        });
      };
    }

    // Ledger entries
    const ledgerDiv = main.querySelector('#ledger-entries');
    if (!ledgerDiv) return;
    [...payments].reverse().forEach(p => {
      const isPendingPayment = p.status !== 'declined' && !p.confirmedBy;
      const canActOnPayment = isPendingPayment && p.loggedBy !== user.id;

      const entry = document.createElement('div');
      entry.className = `ledger-entry fade-in ${p.status === 'declined' ? 'declined-entry' : ''}`;
      entry.innerHTML = `
        <div class="ledger-entry-header">
          <div>
            <b>${formatINR(p.amount)}</b>
            <span style="color:var(--text-muted);font-size:0.82rem;margin-left:8px">on ${formatDate(p.date)}</span>
            ${p.note ? `<span style="color:var(--text-muted);font-size:0.8rem;margin-left:8px">· ${p.note}</span>` : ''}
          </div>
          <div>${renderTrustLockBadge(p)}</div>
        </div>
        <div style="font-size:0.78rem;color:var(--text-muted)">
          Logged by: <b>${DB.getUserById(p.loggedBy)?.name || 'Unknown'}</b>
          ${p.confirmedBy ? `· Confirmed by: <b>${DB.getUserById(p.confirmedBy)?.name || 'Unknown'}</b>` : ''}
          ${p.status === 'declined' ? `· Declined by: <b>${DB.getUserById(p.declinedBy)?.name || 'Peer'}</b>` : ''}
        </div>
        ${renderVerificationDetails(p)}
        ${canActOnPayment ? `
          <div style="margin-top:12px;display:flex;gap:10px;align-items:center">
            <button class="btn btn-secondary btn-sm" data-decline-pid="${p.id}">✕ Decline</button>
            <button class="btn btn-success btn-sm" data-confirm-pid="${p.id}">✓ Confirm Payment</button>
          </div>
        ` : ''}`;
      ledgerDiv.appendChild(entry);
    });

    // Confirm payment buttons
    main.querySelectorAll('[data-confirm-pid]').forEach(btn => {
      btn.onclick = async () => {
        const pid = btn.dataset.confirmPid;
        const payment = DB.getPayments().find(p => p.id === pid);
        if (!payment) return;
        btn.disabled = true;
        btn.textContent = 'Signing…';

        const signature = await signTransactionData(pid, payment.amount, payment.createdAt);
        const verified = await verifyTransactionData(pid, payment.amount, payment.createdAt, signature);
        const hash = await generateTxHash(pid, payment.amount, payment.createdAt);

        DB.updatePayment(pid, {
          confirmedBy: user.id,
          hash,
          signature,
          digitallySigned: true,
          signatureVerified: verified,
          trustlockSecure: verified,
          status: verified ? 'confirmed' : 'unverified'
        });

        showToast('Payment confirmed and digitally signed! TrustLock: SECURE 🔒', 'success');
        render();
      };
    });

    // Decline payment buttons
    main.querySelectorAll('[data-decline-pid]').forEach(btn => {
      btn.onclick = () => {
        const pid = btn.dataset.declinePid;
        showModal({
          title: 'Decline Payment Log',
          body: `
            <p>Are you sure you want to decline this payment log?</p>
            <p style="font-size:0.82rem;color:var(--text-muted);margin-top:6px">The record will be preserved in the shared ledger as DECLINED and balance will remain unchanged.</p>
            <div class="form-group" style="margin-top:14px">
              <label class="form-label">Reason for declining (optional)</label>
              <input class="form-input" id="decline-payment-reason" placeholder="e.g. Payment not received / wrong amount" />
            </div>
          `,
          confirmText: 'Decline Payment',
          danger: true,
          onConfirm: () => {
            const reasonInput = document.getElementById('decline-payment-reason');
            const reason = reasonInput ? reasonInput.value.trim() : '';
            DB.declinePayment(pid, reason, user.id);
            showToast('Payment declined. Balance unchanged.', 'info');
            render();
          }
        });
      };
    });
  };

  render();
  return page;
};
