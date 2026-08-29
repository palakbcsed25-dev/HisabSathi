Pages = window.Pages || {};

Pages.landing = function () {
  const page = document.createElement('div');
  page.className = 'page';
  page.innerHTML = `
    <!-- HERO -->
    <section class="hero">
      <div class="container" style="position:relative;z-index:1">
        <div class="hero-badge">✦ Tamper-Evident Shared Ledger</div>
        <h1>Har Hissab, <span>Saaf.</span><br>Har Saathi, <span>Secure.</span></h1>
        <p class="hero-tagline">Track peer-to-peer loans with mutual verification.<br>No disputes. No confusion. Just clarity.</p>
        <div class="hero-cta">
          <button class="btn btn-primary btn-lg" id="hero-get-started">Get Started Free</button>
          <button class="btn btn-outline btn-lg" id="hero-demo" style="color:#F3EBDD;border-color:rgba(243,235,221,0.4)">▶ View Live Demo</button>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how-it-works">
      <div class="container">
        <h2>How HissabSaathi Works</h2>
        <p class="how-subtitle">Simple, transparent, and secure in 4 steps.</p>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-title">Create a Loan</div>
            <div class="step-desc">Log a loan between friends — name, amount, due date, and a note for context.</div>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-title">Both Confirm</div>
            <div class="step-desc">Lender and borrower each tap "Confirm" to activate the TrustLock agreement.</div>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-title">Log Payments</div>
            <div class="step-desc">Either party logs a repayment. The other confirms, generating an integrity hash.</div>
          </div>
          <div class="step-card">
            <div class="step-number">4</div>
            <div class="step-title">Close the Loop</div>
            <div class="step-desc">When balance hits zero, the loan is automatically marked Completed.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- TRUSTLOCK -->
    <section class="trustlock-section">
      <div class="container">
        <div style="max-width:600px;margin-bottom:8px">
          <div class="hero-badge" style="margin-bottom:16px">★ Signature Feature</div>
          <h2 style="color:#F3EBDD">TrustLock™</h2>
          <p style="color:rgba(243,235,221,0.7);font-size:0.95rem;line-height:1.7;margin-top:10px">
            Every transaction in HissabSaathi is mutually verified and integrity-stamped.
            Both parties must confirm a payment before it's recorded — making every entry
            tamper-evident and dispute-proof.
          </p>
        </div>
        <div class="trustlock-features">
          <div class="tl-feature">
            <div class="tl-icon">🤝</div>
            <div class="tl-title">Dual Confirmation</div>
            <div class="tl-desc">Loans and payments require confirmation from both parties before taking effect.</div>
          </div>
          <div class="tl-feature">
            <div class="tl-icon">🔒</div>
            <div class="tl-title">Integrity Hash</div>
            <div class="tl-desc">Each transaction gets a SHA-256 hash — a unique fingerprint that proves the data was never altered.</div>
          </div>
          <div class="tl-feature">
            <div class="tl-icon">📒</div>
            <div class="tl-title">Shared Ledger</div>
            <div class="tl-desc">Both lender and borrower see the exact same ledger — one source of truth, no side-by-side confusion.</div>
          </div>
          <div class="tl-feature">
            <div class="tl-icon">✅</div>
            <div class="tl-title">SECURE Badge</div>
            <div class="tl-desc">Fully confirmed transactions show "TrustLock: SECURE" — instant visual trust signal for both parties.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- DEMO USERS -->
    <section style="padding:64px 0;background:var(--bg);">
      <div class="container" style="text-align:center">
        <h2 style="font-family:var(--font-display);font-size:1.8rem;font-weight:800;margin-bottom:8px">Try the Live Demo</h2>
        <p style="color:var(--text-muted);margin-bottom:32px">Log in as a demo user — all data is pre-loaded and ready to explore.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap" id="demo-users-grid"></div>
        <p style="margin-top:20px;font-size:0.82rem;color:var(--text-muted)">All demo accounts use password: <b>demo123</b></p>
      </div>
    </section>

    <footer class="landing-footer">
      <p>© 2026 HissabSaathi · Built for the Hackathon · <em>Har Hissab, Saaf. Har Saathi, Secure.</em></p>
    </footer>`;

  const users = DB.getUsers().slice(0, 4);
  const grid = page.querySelector('#demo-users-grid');
  users.forEach(u => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.innerHTML = `<div class="nav-avatar" style="width:28px;height:28px;font-size:0.75rem">${u.initials}</div> Login as ${u.name.split(' ')[0]}`;
    btn.onclick = () => {
      Auth.demoLogin(u.id);
      showToast(`Welcome, ${u.name.split(' ')[0]}! 👋`, 'success');
      Router.navigate('dashboard');
    };
    grid.appendChild(btn);
  });

  page.querySelector('#hero-get-started').onclick = () => Router.navigate('auth');
  page.querySelector('#hero-demo').onclick = () => {
    Auth.demoLogin('u1');
    showToast('Demo loaded — Welcome, Rahul! 👋', 'success');
    Router.navigate('dashboard');
  };

  return page;
};
