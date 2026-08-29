// ===== APP BOOTSTRAP =====
(function () {
  try {
    console.log('[HissabSaathi] Starting application bootstrap...');
    
    // Init DB
    DB.init();
    console.log('[HissabSaathi] Database/Demo Data initialized successfully.');

    // Apply saved theme
    const savedTheme = localStorage.getItem('hissab_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('[HissabSaathi] Theme applied:', savedTheme);

    // Init Pages namespace
    window.Pages = window.Pages || {};

    // Check Secure Context for Web Crypto API
    if (!window.isSecureContext) {
      console.warn('[HissabSaathi] WARNING: App is not running in a Secure Context. Web Crypto API (TrustLock signatures) may fail. Please use http://localhost instead of file://');
    }

    // Route to correct page
    const user = Auth.getCurrentUser();
    if (user) {
      console.log('[HissabSaathi] User session found. Routing to dashboard...');
      Router.navigate('dashboard');
    } else {
      console.log('[HissabSaathi] No user session. Routing to landing page...');
      Router.navigate('landing');
    }
    
    console.log('[HissabSaathi] App rendered successfully.');
  } catch (error) {
    console.error('[HissabSaathi] CRITICAL STARTUP ERROR:', error);
    document.getElementById('app-root').innerHTML = `
      <div style="padding:40px;text-align:center;color:red;font-family:sans-serif;">
        <h2>Application Failed to Load</h2>
        <p>Please check the browser console for details.</p>
        <p style="font-size:0.8rem;color:#666;">Error: ${error.message}</p>
      </div>
    `;
  }
})();
