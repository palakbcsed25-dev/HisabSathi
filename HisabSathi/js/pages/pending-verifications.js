Pages = window.Pages || {};

Pages.pendingVerifications = function () {
  if (!Auth.requireAuth()) return document.createElement('div');
  const user = Auth.getCurrentUser();
  const page = document.createElement('div');
  page.className = 'page';
  page.appendChild(renderNavbar(user));

  const main = document.createElement('main');
  main.className = 'main-content';
  page.appendChild(main);

  const render = () => {
    const { pendingLoans, pendingPayments } = DB.getPendingVerifications(user.id);
    const totalPending = pendingLoans.length + pendingPayments.length;

    main.innerHTML = `<div class="container">
      <button class="back-btn" id="back-btn">← Back to Dashboard</button>

      <div class="section-header" style="margin-bottom:12px">
        <div>
          <span class="section-title">🔔 Pending Verification Requests</span>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-top:4px">
            All loans and payments awaiting your confirmation in one place.
          </div>
        </div>
        <span class="badge badge-pending" style="font-size:0.9rem;padding:6px 14px">${totalPending} Action${totalPending === 1 ? '' : 's'} Required</span>
      </div>

      ${totalPending === 0 ? `
        <div class="empty-state" style="padding:48px;background:var(--surface);border-radius:var(--radius);border:1px solid var(--border)">
          <div class="empty-icon">🎉</div>
          <div class="empty-title">All clear! No pending requests</div>
          <div style="color:var(--text-muted);font-size:0.85rem;margin-top:6px">You have verified or responded to all incoming loan & payment requests.</div>
        </div>
      ` : ''}

      <!-- PENDING LOAN AGREEMENTS -->
      ${pendingLoans.length > 0 ? `
        <div style="margin-top:24px;margin-bottom:28px">
          <h3 style="font-family:var(--font-display);font-size:1.1rem;margin-bottom:14px;color:var(--text)">
            📝 Loan Agreements Awaiting Your Confirmation (${pendingLoans.length})
          </h3>
          <div class="pending-list">
            ${pendingLoans.map(loan => `
              <div class="card fade-in" style="margin-bottom:14px">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
                  <div>
                    <div style="font-size:0.8rem;color:var(--text-muted)">Loan Request from <b>${loan.lenderId === user.id ? loan.borrowerName : loan.lenderName}</b></div>
                    <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--copper);margin:4px 0">
                      ${formatINR(loan.amount)}
                    </div>
                    <div style="font-size:0.82rem;color:var(--text-muted)">
                      Due Date: ${formatDate(loan.dueDate)} ${loan.note ? `· 📝 ${loan.note}` : ''}
                    </div>
                  </div>
                  <div style="display:flex;gap:10px;align-items:center">
                    <button class="btn btn-secondary btn-sm" data-decline-loan="${loan.id}">✕ Decline</button>
                    <button class="btn btn-success btn-sm" data-confirm-loan="${loan.id}">✓ Confirm Loan</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- PENDING PAYMENTS -->
      ${pendingPayments.length > 0 ? `
        <div style="margin-top:24px">
          <h3 style="font-family:var(--font-display);font-size:1.1rem;margin-bottom:14px;color:var(--text)">
            💳 Payment Logs Awaiting Your Confirmation (${pendingPayments.length})
          </h3>
          <div class="pending-list">
            ${pendingPayments.map(item => `
              <div class="card fade-in" style="margin-bottom:14px">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
                  <div>
                    <div style="font-size:0.8rem;color:var(--text-muted)">
                      Logged by <b>${DB.getUserById(item.loggedBy)?.name || 'Peer'}</b> on ${item.loan.lenderName} → ${item.loan.borrowerName}
                    </div>
                    <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--teal);margin:4px 0">
                      ${formatINR(item.amount)}
                    </div>
                    <div style="font-size:0.82rem;color:var(--text-muted)">
                      Date: ${formatDate(item.date)} ${item.note ? `· Note: "${item.note}"` : ''}
                    </div>
                  </div>
                  <div style="display:flex;gap:10px;align-items:center">
                    <button class="btn btn-secondary btn-sm" data-decline-payment="${item.id}">✕ Decline</button>
                    <button class="btn btn-success btn-sm" data-confirm-payment="${item.id}">✓ Confirm Payment</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>`;

    main.querySelector('#back-btn').onclick = () => Router.navigate('dashboard');

    // Confirm Loan
    main.querySelectorAll('[data-confirm-loan]').forEach(btn => {
      btn.onclick = () => {
        const loanId = btn.dataset.confirmLoan;
        const loan = DB.getLoanById(loanId);
        if (!loan) return;
        
        const isLender = loan.lenderId === user.id;
        const updates = isLender ? { lenderConfirmed: true } : { borrowerConfirmed: true };
        const updatedLoan = { ...loan, ...updates };
        
        if (updatedLoan.lenderConfirmed && updatedLoan.borrowerConfirmed) {
          updates.status = isOverdue(updatedLoan) ? 'overdue' : 'active';
        }
        DB.updateLoan(loanId, updates);
        showToast('Loan agreement confirmed! TrustLock activated. 🔒', 'success');
        render();
      };
    });

    // Decline Loan
    main.querySelectorAll('[data-decline-loan]').forEach(btn => {
      btn.onclick = () => {
        const loanId = btn.dataset.declineLoan;
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
    });

    // Confirm Payment
    main.querySelectorAll('[data-confirm-payment]').forEach(btn => {
      btn.onclick = async () => {
        const pid = btn.dataset.confirmPayment;
        const payment = DB.getPayments().find(p => p.id === pid);
        if (!payment) return;
        
        btn.disabled = true;
        btn.textContent = 'Signing…';

        // Digital signature via Web Crypto API
        const signature = await signTransactionData(pid, payment.amount, payment.createdAt);
        const verified = await verifyTransactionData(pid, payment.amount, payment.createdAt, signature);
        const internalHash = await generateTxHash(pid, payment.amount, payment.createdAt);

        DB.updatePayment(pid, {
          confirmedBy: user.id,
          hash: internalHash,
          signature: signature,
          digitallySigned: true,
          signatureVerified: verified,
          trustlockSecure: verified,
          status: verified ? 'confirmed' : 'unverified'
        });

        showToast('Payment confirmed and digitally signed! TrustLock: SECURE 🔒', 'success');
        render();
      };
    });

    // Decline Payment
    main.querySelectorAll('[data-decline-payment]').forEach(btn => {
      btn.onclick = () => {
        const pid = btn.dataset.declinePayment;
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
            showToast('Payment declined. Record preserved in ledger.', 'info');
            render();
          }
        });
      };
    });
  };

  render();
  return page;
};
