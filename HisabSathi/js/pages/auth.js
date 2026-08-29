Pages = window.Pages || {};

Pages.auth = function () {
  const page = document.createElement('div');
  page.className = 'auth-page';

  let isLogin = true;

  const render = () => {
    page.innerHTML = `
      <div class="auth-card fade-in">
        <div class="auth-logo">
          <h1>HissabSaathi</h1>
          <p>Har Hissab, Saaf. Har Saathi, Secure.</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab ${isLogin ? 'active' : ''}" id="tab-login">Login</button>
          <button class="auth-tab ${!isLogin ? 'active' : ''}" id="tab-register">Register</button>
        </div>

        ${isLogin ? `
          <form id="auth-form">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" id="auth-email" type="email" placeholder="you@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" id="auth-password" type="password" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit">Login →</button>
          </form>
        ` : `
          <form id="auth-form">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" id="auth-name" type="text" placeholder="Your full name" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" id="auth-email" type="email" placeholder="you@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" id="auth-password" type="password" placeholder="Min 6 characters" required minlength="6"/>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg">Create Account →</button>
          </form>
        `}

        <div class="demo-divider">or try a demo account</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${DB.getUsers().slice(0, 4).map(u => `
            <button class="btn btn-secondary" data-demo="${u.id}">
              <div style="width:24px;height:24px;border-radius:50%;background:var(--aubergine);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700">${u.initials}</div>
              Demo as ${u.name}
            </button>
          `).join('')}
        </div>

        <p style="text-align:center;margin-top:16px;font-size:0.8rem;color:var(--text-muted)">
          <button class="back-btn" id="back-landing" style="display:inline-flex">← Back to Home</button>
        </p>
      </div>`;

    page.querySelector('#tab-login').onclick = () => { isLogin = true; render(); };
    page.querySelector('#tab-register').onclick = () => { isLogin = false; render(); };
    page.querySelector('#back-landing').onclick = () => Router.navigate('landing');

    page.querySelectorAll('[data-demo]').forEach(btn => {
      btn.onclick = () => {
        const user = Auth.demoLogin(btn.dataset.demo);
        showToast(`Welcome, ${user.name.split(' ')[0]}! 👋`, 'success');
        Router.navigate('dashboard');
      };
    });

    page.querySelector('#auth-form').onsubmit = (e) => {
      e.preventDefault();
      const email = page.querySelector('#auth-email').value.trim();
      const password = page.querySelector('#auth-password').value;

      if (isLogin) {
        const user = Auth.login(email, password);
        if (!user) { showToast('Invalid email or password.', 'error'); return; }
        showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
        Router.navigate('dashboard');
      } else {
        const name = page.querySelector('#auth-name').value.trim();
        const result = Auth.register(name, email, password);
        if (result.error) { showToast(result.error, 'error'); return; }
        showToast(`Account created! Welcome, ${name.split(' ')[0]}! 🎉`, 'success');
        Router.navigate('dashboard');
      }
    };
  };

  render();
  return page;
};
