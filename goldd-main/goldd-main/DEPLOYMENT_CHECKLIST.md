# Home and Car Wash – Deployment & GitHub Checklist

This checklist covers everything you should verify or adjust before pushing the project to GitHub and deploying it (on Emergent or any other host). Work through it top‑to‑bottom whenever you prepare a fresh environment.

---

## 1. Repository Cleanup (Before Commit)

- [ ] **Do NOT commit real secrets**
  - Ensure the following files are **never** committed with real values:
    - `backend/.env`
    - `frontend/.env`
  - Confirm `.gitignore` contains entries for both of these files.

- [ ] **Create example env templates** (safe to commit)
  - Create `backend/.env.example` with placeholder values (no real passwords):
    - `MONGO_URL="mongodb://localhost:27017"`
    - `DB_NAME="golden_touch_cleaning"`
    - `CORS_ORIGINS="*"`
    - `SMTP_HOST=smtp.gmail.com`
    - `SMTP_PORT=587`
    - `SMTP_USER=your_gmail_address_here`
    - `SMTP_PASS=your_app_password_here`
    - `BUSINESS_EMAIL=your_business_email_here`
    - `FRONTEND_URL=https://your-frontend-url-here`
    - `ADMIN_PASSWORD=your_secure_admin_password_here`
  - Create `frontend/.env.example` with placeholders:
    - `REACT_APP_BACKEND_URL=https://your-backend-url-here`
    - `WDS_SOCKET_PORT=443`
    - `REACT_APP_ENABLE_VISUAL_EDITS=false`
    - `ENABLE_HEALTH_CHECK=false`
    - `REACT_APP_ADMIN_PASSWORD=your_secure_admin_password_here`

- [ ] **Remove personal / environment‑specific values from code**
  - Search the codebase for any hard‑coded:
    - Email addresses
    - Phone numbers
    - Passwords or tokens
    - Direct URLs
  - Keep only the intended public business details (e.g., business phone and public email) in UI text; move anything sensitive to `.env`.

---

## 2. Environment Variables & Secrets (Production Setup)

Set these **in your hosting platform’s environment settings**, not in the code:

### Backend Required Variables

- [ ] `MONGO_URL`
  - Points to your production MongoDB instance.
- [ ] `DB_NAME`
  - Production database name (e.g., `golden_touch_cleaning_prod`).
- [ ] `CORS_ORIGINS`
  - Comma‑separated list of allowed frontend origins (e.g., `https://your-frontend-domain.com`).
- [ ] `SMTP_HOST`, `SMTP_PORT`
  - Usually `smtp.gmail.com` and `587`.
- [ ] `SMTP_USER`, `SMTP_PASS`
  - Gmail address and **app password** for sending emails.
- [ ] `BUSINESS_EMAIL`
  - Where admin booking notifications are sent.
- [ ] `FRONTEND_URL`
  - Public URL of the frontend, used inside email templates.
- [ ] `ADMIN_PASSWORD`
  - Strong password for admin login (used by backend `/api/admin/login`).

### Frontend Required Variables

- [ ] `REACT_APP_BACKEND_URL`
  - Base URL of the backend (must route `/api/...` to FastAPI on port 8001 as configured by Emergent).
- [ ] `REACT_APP_ADMIN_PASSWORD` (only if still used)
  - If you continue to allow simple password‑only admin login on the frontend, ensure it matches `ADMIN_PASSWORD` or remove this and rely purely on the backend auth flow.
- [ ] `WDS_SOCKET_PORT`, `REACT_APP_ENABLE_VISUAL_EDITS`, `ENABLE_HEALTH_CHECK`
  - Keep as configured by Emergent unless instructed otherwise.

---

## 3. Backend Readiness

- [ ] **FastAPI app prefix**
  - Confirm **all** backend routes used by the frontend start with `/api` (already true in `server.py`).

- [ ] **Database configuration**
  - Ensure `MONGO_URL` and `DB_NAME` are not hardcoded anywhere except via `os.environ`.
  - Verify that collections used exist or will be auto‑created:
    - `bookings`
    - `status_checks`

- [ ] **Email sending**
  - Verify `backend/.env` (or platform env) has working Gmail SMTP credentials.
  - Test a booking end‑to‑end and confirm:
    - Customer receives **Booking Confirmation** email.
    - Business receives **New Booking Notification** email.

- [ ] **Email campaigns & scheduler**
  - `apscheduler` is configured in `server.py` with:
    - Monday campaign at 09:00
    - Friday campaign at 09:00
  - Confirm your hosting environment supports long‑running background jobs or provides an alternative (cron/worker). If not, you may need to:
    - Disable scheduler lines in `server.py`, and
    - Run campaigns via a separate worker or external cron invoking `/api/campaigns/trigger`.

- [ ] **Security middleware**
  - Rate limiting (`rate_limit_middleware`) is enabled on all routes.
  - Security headers (`add_security_headers`) are applied.
  - Booking validation (`validate_booking_input`) is used before saving bookings.

- [ ] **Admin authentication**
  - `/api/admin/login` uses `ADMIN_PASSWORD` from environment.
  - Sessions are created with `create_session` and validated via `/api/admin/validate-session`.
  - Ensure that the frontend actually uses this flow (or, if not, document that admin auth is “simple password only” and update later).

---

## 4. Frontend Readiness

- [ ] **API base URL**
  - All API calls use `process.env.REACT_APP_BACKEND_URL` (already done in `BookingForm.jsx` etc.).
  - Confirm no hard‑coded `http://localhost:8001` or similar remains.

- [ ] **Admin auth (React context)**
  - Check `AuthContext.jsx`:
    - If using `process.env.REACT_APP_ADMIN_PASSWORD`, confirm it is set in production.
    - Prefer transitioning to using the backend `/api/admin/login` endpoint and JWT/session tokens instead of checking the password in the client.

- [ ] **Branding & content**
  - Confirm that final wording, business name, phone number, and email are correct:
    - Business name: **Home and Car Wash / Golden Touch Cleaning Services** (pick consistent branding).
    - Business phone (for display): update all occurrences if the number changes.
    - Business email: `goldentouchcleaningservice25@gmail.com` or your chosen address.

- [ ] **Build**
  - Run a production build locally (or via CI):
    - `yarn install`
    - `yarn build`
  - Fix any build errors before deploying.

---

## 5. Database & Data Considerations

- [ ] **Collections**
  - Confirm the following collections will be used by MongoDB:
    - `bookings` (main application data)
    - `status_checks` (health/status pings)

- [ ] **Indexes (optional but recommended)**
  - For better query performance in production, consider adding indexes (via Mongo shell or migration script):
    - `bookings`: index on `bookingId`, `customerId`, `date`, `email`.

- [ ] **Initial Data (optional)**
  - No static seed data is strictly required; services are defined on the frontend in `mock.js`.
  - If you want predefined bookings for testing, create them manually in a dev database, not in production.

---

## 6. Testing Before Deployment

Perform at least these tests in a staging or local environment:

- [ ] **Booking flow**
  - Open the main booking page.
  - Fill:
    - Full Name, Phone, Address, Service, Date, Time.
  - Optionally apply a valid promo code (e.g., `GOLDY`) and confirm:
    - Promo is accepted and message appears.
    - Booking is successfully created.

- [ ] **Email verification**
  - Confirm emails are received for a test booking (customer + business).

- [ ] **Admin dashboard**
  - Login as admin.
  - View list of bookings.
  - Change a booking status (`pending` → `in-progress` → `done`) and verify it is saved.
  - Check analytics tab (if present) shows data without errors.

- [ ] **Customer portal**
  - Use the customer lookup feature (if implemented) to search for bookings by email or customer ID.

- [ ] **Error scenarios**
  - Try submitting the booking form with missing required fields to ensure validation messages appear.
  - Try invalid promo codes and confirm proper error display.

---

## 7. Post‑Deployment Checks

After deploying to your hosting platform:

- [ ] **Health check**
  - Visit the live site and ensure the homepage and booking page load without errors.
  - Test at least one live booking end‑to‑end.

- [ ] **API logs**
  - Check backend logs for errors after test bookings and admin actions.
  - Watch for:
    - Database connection issues
    - Email sending failures
    - 500/429 errors from rate limiting or unhandled exceptions

- [ ] **Email campaigns**
  - If the scheduler is enabled in production:
    - Confirm that Monday/Friday jobs are registered (via `/api/campaigns/status`).
    - After a scheduled time passes, confirm at least one customer received a campaign email.

- [ ] **Security sanity check**
  - Verify `ADMIN_PASSWORD` is strong and not reused elsewhere.
  - Ensure no admin routes are accidentally exposed in the UI without auth checks.

---

## 8. Optional Enhancements (Future Improvements)

These are not required to deploy but are good next steps:

- [ ] Replace frontend password check (`REACT_APP_ADMIN_PASSWORD`) with a proper backend login + token storage.
- [ ] Add an "Unsubscribe" or email preferences link to marketing emails to comply with anti‑spam regulations.
- [ ] Add error monitoring (e.g., Sentry) to track runtime exceptions.
- [ ] Add SEO basics: page titles, meta descriptions, and Open Graph tags.
- [ ] Add backup/restore procedures for MongoDB (e.g., daily dumps for production).

---

Use this document as your single source of truth when preparing the app for GitHub and production deployment. Update it over time as your infrastructure and requirements evolve.
