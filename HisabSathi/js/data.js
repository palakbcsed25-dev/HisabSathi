// ===== DATA LAYER — localStorage persistence =====
const DB_KEY = 'hissabsaathi_db';

const DEMO_DATA = {
  users: [
    { id: 'u1', name: 'Rahul Sharma', email: 'rahul@demo.com', password: 'demo123', initials: 'RS' },
    { id: 'u2', name: 'Amit Verma',   email: 'amit@demo.com',  password: 'demo123', initials: 'AV' },
    { id: 'u3', name: 'Priya Singh',  email: 'priya@demo.com', password: 'demo123', initials: 'PS' },
    { id: 'u4', name: 'Neha Gupta',   email: 'neha@demo.com',  password: 'demo123', initials: 'NG' },
  ],
  loans: [
    {
      id: 'l1',
      lenderId: 'u1', lenderName: 'Rahul Sharma',
      borrowerId: 'u2', borrowerName: 'Amit Verma',
      amount: 10000, paidAmount: 4000, remainingAmount: 6000,
      dueDate: '2026-09-30', note: 'For laptop repair',
      status: 'active',
      lenderConfirmed: true, borrowerConfirmed: true,
      createdAt: '2026-07-15T10:00:00Z',
    },
    {
      id: 'l2',
      lenderId: 'u3', lenderName: 'Priya Singh',
      borrowerId: 'u4', borrowerName: 'Neha Gupta',
      amount: 5000, paidAmount: 5000, remainingAmount: 0,
      dueDate: '2026-08-01', note: 'College trip expenses',
      status: 'completed',
      lenderConfirmed: true, borrowerConfirmed: true,
      createdAt: '2026-07-01T09:00:00Z',
    },
    {
      id: 'l3',
      lenderId: 'u1', lenderName: 'Rahul Sharma',
      borrowerId: 'u4', borrowerName: 'Neha Gupta',
      amount: 8000, paidAmount: 2000, remainingAmount: 6000,
      dueDate: '2026-08-01', note: 'Medical emergency',
      status: 'overdue',
      lenderConfirmed: true, borrowerConfirmed: true,
      createdAt: '2026-06-20T11:00:00Z',
    },
  ],
  payments: [
    {
      id: 'p1', loanId: 'l1', amount: 2000,
      date: '2026-08-01', note: 'First instalment',
      loggedBy: 'u2', confirmedBy: 'u1',
      hash: 'a3f8e2c1d4b9...', trustlockSecure: true,
      digitallySigned: true, signatureVerified: true, status: 'confirmed',
      createdAt: '2026-08-01T14:00:00Z',
    },
    {
      id: 'p2', loanId: 'l1', amount: 2000,
      date: '2026-08-15', note: 'Second instalment',
      loggedBy: 'u1', confirmedBy: 'u2',
      hash: 'c9d2e5f1a0b4...', trustlockSecure: true,
      digitallySigned: true, signatureVerified: true, status: 'confirmed',
      createdAt: '2026-08-15T10:30:00Z',
    },
    {
      id: 'p3', loanId: 'l2', amount: 5000,
      date: '2026-07-28', note: 'Full repayment',
      loggedBy: 'u4', confirmedBy: 'u3',
      hash: 'f7b1c3d8e2a5...', trustlockSecure: true,
      digitallySigned: true, signatureVerified: true, status: 'confirmed',
      createdAt: '2026-07-28T16:00:00Z',
    },
    {
      id: 'p4', loanId: 'l3', amount: 2000,
      date: '2026-07-20', note: 'Partial payment',
      loggedBy: 'u4', confirmedBy: 'u1',
      hash: 'b5e9f2c6d1a8...', trustlockSecure: true,
      digitallySigned: true, signatureVerified: true, status: 'confirmed',
      createdAt: '2026-07-20T12:00:00Z',
    },
  ],
};

const DB = {
  _data: null,

  init() {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      this._data = JSON.parse(saved);
    } else {
      this._data = JSON.parse(JSON.stringify(DEMO_DATA));
      this.save();
    }
  },

  save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this._data));
  },

  reset() {
    this._data = JSON.parse(JSON.stringify(DEMO_DATA));
    this.save();
  },

  // Users
  getUsers() { return this._data.users; },
  getUserById(id) { return this._data.users.find(u => u.id === id); },
  getUserByEmail(email) { return this._data.users.find(u => u.email === email.toLowerCase()); },
  addUser(user) {
    this._data.users.push(user);
    this.save();
  },

  // Loans
  getLoans() { return this._data.loans; },
  getLoanById(id) { return this._data.loans.find(l => l.id === id); },
  getLoansByUser(userId) {
    return this._data.loans.filter(l => l.lenderId === userId || l.borrowerId === userId);
  },
  addLoan(loan) {
    this._data.loans.push(loan);
    this.save();
  },
  updateLoan(id, updates) {
    const idx = this._data.loans.findIndex(l => l.id === id);
    if (idx !== -1) {
      this._data.loans[idx] = { ...this._data.loans[idx], ...updates };
      this.save();
    }
  },
  declineLoan(loanId, reason, declinerUserId) {
    const loan = this.getLoanById(loanId);
    if (!loan) return;
    this.updateLoan(loanId, {
      status: 'declined',
      declineReason: reason || 'No reason provided',
      declinedBy: declinerUserId
    });
  },

  // Payments
  getPayments() { return this._data.payments; },
  getPaymentsByLoan(loanId) { return this._data.payments.filter(p => p.loanId === loanId); },
  addPayment(payment) {
    this._data.payments.push(payment);
    this.save();
  },
  updatePayment(id, updates) {
    const idx = this._data.payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      this._data.payments[idx] = { ...this._data.payments[idx], ...updates };
      this.save();
    }
  },
  declinePayment(paymentId, reason, declinerUserId) {
    const payment = this._data.payments.find(p => p.id === paymentId);
    if (!payment || payment.status === 'declined' || payment.trustlockSecure) return;
    
    // Mark payment as declined
    payment.status = 'declined';
    payment.declineReason = reason || 'No reason provided';
    payment.declinedBy = declinerUserId;

    // Revert loan balance since payment was cancelled/declined
    const loan = this.getLoanById(payment.loanId);
    if (loan) {
      const newPaid = Math.max(0, loan.paidAmount - payment.amount);
      const newRemaining = loan.amount - newPaid;
      const newStatus = newRemaining <= 0 ? 'completed' : (isOverdue(loan) ? 'overdue' : 'active');
      this.updateLoan(loan.id, {
        paidAmount: newPaid,
        remainingAmount: newRemaining,
        status: loan.status === 'pending' ? 'pending' : newStatus
      });
    }
    this.save();
  },

  // Pending Verifications Helper
  getPendingVerifications(userId) {
    const userLoans = this.getLoansByUser(userId);
    const pendingLoans = userLoans.filter(l => {
      if (l.status !== 'pending') return false;
      if (l.lenderId === userId && !l.lenderConfirmed) return true;
      if (l.borrowerId === userId && !l.borrowerConfirmed) return true;
      return false;
    });

    const pendingPayments = [];
    userLoans.forEach(l => {
      const loanPayments = this.getPaymentsByLoan(l.id);
      loanPayments.forEach(p => {
        if (p.status !== 'declined' && !p.confirmedBy && p.loggedBy !== userId) {
          pendingPayments.push({ ...p, loan: l });
        }
      });
    });

    return { pendingLoans, pendingPayments };
  },

  getPendingCount(userId) {
    const { pendingLoans, pendingPayments } = this.getPendingVerifications(userId);
    return pendingLoans.length + pendingPayments.length;
  },
};

// ===== AUTH =====
const Auth = {
  SESSION_KEY: 'hissabsaathi_session',

  getCurrentUser() {
    const id = sessionStorage.getItem(this.SESSION_KEY);
    return id ? DB.getUserById(id) : null;
  },

  login(email, password) {
    const user = DB.getUserByEmail(email);
    if (!user || user.password !== password) return null;
    sessionStorage.setItem(this.SESSION_KEY, user.id);
    return user;
  },

  demoLogin(userId) {
    sessionStorage.setItem(this.SESSION_KEY, userId);
    return DB.getUserById(userId);
  },

  register(name, email, password) {
    if (DB.getUserByEmail(email)) return { error: 'Email already registered.' };
    const id = 'u' + Date.now();
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const user = { id, name, email: email.toLowerCase(), password, initials };
    DB.addUser(user);
    sessionStorage.setItem(this.SESSION_KEY, id);
    return { user };
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  requireAuth() {
    if (!this.getCurrentUser()) {
      Router.navigate('auth');
      return false;
    }
    return true;
  },
};

// ===== HELPERS =====
function formatINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function isOverdue(loan) {
  if (loan.status === 'completed') return false;
  return new Date(loan.dueDate) < new Date();
}
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
