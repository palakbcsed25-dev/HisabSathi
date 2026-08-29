# HisabSathi
HissabSaathi — a peer-to-peer loan tracker with mutual TrustLock verification and tamper-evident payment logging, built with vanilla JS (no frameworks/backend).
# HissabSaathi 🤝💰

**Har Hissab, Saaf. Har Saathi, Secure.**
*(Every account, clear. Every partner, secure.)*

HissabSaathi is a peer-to-peer (P2P) loan management web app that helps friends and acquaintances track informal loans transparently. It uses a **TrustLock** mutual-verification system and a tamper-evident ledger concept so both the lender and the borrower must confirm loans and payments — reducing disputes over "who paid what, when."

This is a **front-end only demo application** — no backend server or database is required. All data is stored locally in the browser (`localStorage` / `sessionStorage`).

---

## ✨ Features

- **User authentication** — register, login, and quick demo-account login
- **Dashboard** — overview of loans you've lent and borrowed
- **Create Loan** — start a new loan request between two users
- **Loan Detail** — view full loan history, balance, and status
- **Log Payment** — record a payment against a loan
- **Pending Verifications** — approve/decline loans and payments logged by the other party
- **TrustLock security** — payments are digitally signed using the browser's **Web Crypto API** (ECDSA P-256) and hashed (SHA-256) for tamper-evidence
- **Light/Dark theme** support (persisted across sessions)

---

## 🛠️ Tech Stack

- **HTML5 / CSS3** — `index.html`, `css/styles.css`
- **Vanilla JavaScript** (no frameworks/build tools) — a small custom SPA router + component system
- **Web Crypto API** — for digital signatures & hashing (TrustLock)
- **Browser Storage** — `localStorage` for data persistence, `sessionStorage` for auth sessions

## 📁 Project Structure

```
HisabSathi/
├── index.html                # App entry point
├── css/
│   └── styles.css            # All app styling
└── js/
    ├── data.js                # Local "DB" layer, demo data, Auth logic
    ├── crypto-utils.js        # TrustLock signing/verification (Web Crypto API)
    ├── router.js               # Simple hash-free SPA router + Toast notifications
    ├── components.js           # Reusable UI components
    ├── app.js                  # App bootstrap
    └── pages/
        ├── landing.js
        ├── auth.js
        ├── dashboard.js
        ├── create-loan.js
        ├── loan-detail.js
        ├── log-payment.js
        └── pending-verifications.js
```

---

## 🚀 Getting Started

Since this app uses the **Web Crypto API**, it must be run from a **secure context** — either `https://` or `http://localhost`. Opening `index.html` directly via `file://` may cause TrustLock signature features to fail (the app will still run, but with a warning in the console).

### Option 1: Quick local server (recommended)

```bash
# Using Python 3
python3 -m http.server 8000

# Then open:
# http://localhost:8000
```

Or with Node.js:

```bash
npx serve .
```

### Option 2: VS Code Live Server

Open the project folder in VS Code and launch it with the **Live Server** extension.

---

## 🔑 Demo Accounts

The app ships with pre-seeded demo data. You can log in instantly using the demo-login option, or manually with:

| Name         | Email             | Password  |
|--------------|-------------------|-----------|
| Rahul Sharma | rahul@demo.com    | demo123   |
| Amit Verma   | amit@demo.com     | demo123   |
| Priya Singh  | priya@demo.com    | demo123   |
| Neha Gupta   | neha@demo.com     | demo123   |

> Data resets to the seeded demo data on first load, and persists thereafter in your browser's `localStorage`. Clear site data / storage to reset the app.

---

## 📌 Notes

- This project has no `package.json` or external dependencies — it's plain HTML/CSS/JS.
- All "database" operations happen client-side; this is intended as a prototype/demo, not a production-ready financial application.
- Do not use real passwords or sensitive financial data with this demo — it is not intended for production use.

---

## 📄 License

No license specified yet — add one (e.g., MIT) if you plan to open-source this repository.
