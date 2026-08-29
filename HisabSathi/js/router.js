// ===== ROUTER =====
const Router = {
  current: null,
  params: {},

  routes: {
    landing: () => Pages.landing(),
    auth: () => Pages.auth(),
    dashboard: () => Pages.dashboard(),
    'create-loan': () => Pages.createLoan(),
    'loan-detail': () => Pages.loanDetail(),
    'log-payment': () => Pages.logPayment(),
    'pending-verifications': () => Pages.pendingVerifications(),
  },

  navigate(route, params = {}) {
    this.current = route;
    this.params = params;
    this.render();
    window.scrollTo(0, 0);
  },

  render() {
    const fn = this.routes[this.current];
    if (fn) {
      const root = document.getElementById('app-root');
      root.innerHTML = '';
      root.appendChild(fn());
      root.classList.add('fade-in');
      setTimeout(() => root.classList.remove('fade-in'), 400);
    }
  },
};

// ===== TOAST =====
function showToast(msg, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ===== MODAL =====
function showModal({ title, body, confirmText = 'Confirm', onConfirm, cancelText = 'Cancel', danger = false }) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-title">${title}</div>
      <div class="modal-body">${body}</div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">${cancelText}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm">${confirmText}</button>
      </div>
    </div>`;
  overlay.classList.remove('hidden');
  document.getElementById('modal-cancel').onclick = () => overlay.classList.add('hidden');
  document.getElementById('modal-confirm').onclick = () => {
    overlay.classList.add('hidden');
    if (onConfirm) onConfirm();
  };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.add('hidden'); };
}
