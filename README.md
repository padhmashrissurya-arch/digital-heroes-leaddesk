# LeadDesk Mini - Full Stack Lead Capture & Management Engine

LeadDesk Mini is a full-stack web application designed for high-converting client lead capture, server-side data validation, database persistence, secure admin authentication, and real-time lead status management.

Built for the **Digital Heroes Training Task**.

---

## 🌟 Key Features

### Task A - Public Landing Page & Lead Management
- **Public Conversion Landing Page (`/`)**: Sleek dark/light modern UI with fluid animations, feature highlights, and responsive layouts.
- **Dynamic Lead Capture Form**: Includes input fields for `Name`, `Work Email`, `Budget Range` (`< $5k`, `$5k - $10k`, `$10k - $25k`, `$25k - $50k`, `$50k+`), and `Project Overview Message`.
- **Dual-Layer Validation**: Real-time client-side feedback combined with strict server-side Zod schema validation.
- **Admin Dashboard (`/admin`)**: Consolidated dashboard featuring lead statistics counters (Total, New, Contacted, Closed), live search across lead names, emails, and messages, and status filter tabs.
- **Instant Lead Status Toggle**: Interactive status update dropdown for each lead (`NEW` / `CONTACTED` / `CLOSED`) with optimistic UI updates.

### Task B - Security, Auth & Shipping
- **Secure Admin Authentication (`/admin/login`)**: Bcrypt-hashed password verification against the user database.
- **HTTP-Only Cookie Session**: JWT token signed with `jose`, stored in `leaddesk_session` HTTP-only, SameSite cookies.
- **Edge Middleware Route Protection**: Automatically redirects unauthenticated requests attempting to access `/admin` or `/api/admin/*` to `/admin/login`.
- **Mandatory Footer Requirement**: Footer link reading *"Built for Digital Heroes Training Task"* linked to [digitalheroesco.com](https://digitalheroesco.com).

---

## 📊 Data Model Explanation

The application data model is designed around two core entities: `Lead` and `User`.

```
+------------------------------------+          +------------------------------------+
|               LEAD                 |          |                USER                |
+------------------------------------+          +------------------------------------+
| id        : String (UUID)          |          | id           : String (UUID)       |
| name      : String                 |          | email        : String (Unique)     |
| email     : String                 |          | passwordHash : String (Bcrypt)     |
| budget    : String                 |          | name         : String              |
| message   : String                 |          | createdAt    : DateTime (ISO)      |
| status    : NEW | CONTACTED | CLOSED|          +------------------------------------+
| createdAt : DateTime (ISO)         |
| updatedAt : DateTime (ISO)         |
+------------------------------------+
```

### Entity Specifications

1. **`Lead` Entity**:
   - `id` (String): Unique identifier generated via `crypto.randomUUID()`.
   - `name` (String): Lead's full name (min 2 characters).
   - `email` (String): Lead's email address, validated for RFC 5322 compliance.
   - `budget` (String): Selected budget range.
   - `message` (String): Project overview & requirements (min 10 characters).
   - `status` (Enum): Current pipeline state (`NEW`, `CONTACTED`, `CLOSED`). Defaults to `NEW`.
   - `createdAt` & `updatedAt` (ISO Timestamp): Audit tracking timestamps.

2. **`User` Entity**:
   - `id` (String): Unique administrator account ID.
   - `email` (String): Unique login email address.
   - `passwordHash` (String): Secure salted password hash generated via `bcryptjs` (cost factor 10).
   - `name` (String): Administrator display name.

---

## 🔒 Authentication Strategy & Security Architecture

LeadDesk Mini uses a production-grade authentication flow:

```
[ Unauthenticated User ] ---> Tries /admin ---> Edge Middleware checks 'leaddesk_session' cookie
                                                     |
                                            (No valid token)
                                                     |
                                                     v
                                      Redirected to /admin/login
                                                     |
                                           Submits credentials
                                                     |
                                                     v
                                      POST /api/admin/auth/login
                                                     |
                                  +------------------+------------------+
                                  | Validated against bcrypt hash      |
                                  +------------------+------------------+
                                                     |
                                              (Match Success)
                                                     |
                                                     v
                                      Generates HS256 JWT Token
                                      Sets HTTP-Only Cookie
                                      Redirects to /admin
```

1. **Password Protection**: Plaintext passwords are never stored. Passwords are hashed using `bcryptjs` prior to database insertion.
2. **Token Security**: Tokens are signed using `jose` with `HS256` encryption and expire in 24 hours.
3. **Cookie Hardening**: Tokens are stored in HTTP-Only, SameSite=`lax`, Secure (in production) cookies, mitigating XSS token theft.
4. **API Route Guards**: Middleware blocks unauthenticated requests to `/api/admin/*` routes with standard `401 Unauthorized` JSON responses.

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Steps

1. **Clone repository and install dependencies**:
   ```bash
   git clone <your-repository-url>
   cd digital_heros
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Application**:
   - **Public Landing Page**: [http://localhost:3000](http://localhost:3000)
   - **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - **Admin Console**: [http://localhost:3000/admin](http://localhost:3000/admin)

### 🔑 Test Admin Credentials

The database auto-seeds with the following default administrator account:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@leaddesk.com` | `AdminSecret123!` |

---

## 🌍 Free-Tier Deployment Guide (Vercel / Render)

### Deploying to Vercel (Recommended)

1. Push your code to a public GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `digital_heros` GitHub repository.
4. Set the following **Environment Variables**:
   - `JWT_SECRET`: `your-random-production-secret-key-32-chars`
5. Click **Deploy**. Vercel will automatically build and publish your project.
6. Verify access from an Incognito/Fresh browser session without local state.

---

## 🎥 Loom Walkthrough

* **Walkthrough Flow**:
  1. Navigating the public landing page.
  2. Demonstrating form validation (empty/invalid input error states).
  3. Submitting a new lead (`Jane Smith` / `$25k - $50k`).
  4. Attempting to access `/admin` while unauthenticated (redirected to `/admin/login`).
  5. Logging in with test admin credentials (`admin@leaddesk.com` / `AdminSecret123!`).
  6. Searching for `Jane Smith` in the admin console.
  7. Toggling lead status from `NEW` -> `CONTACTED` -> `CLOSED` and verifying real-time stats counter updates.

---

## 🏷️ Credit Requirement

As specified in the live build requirement, the application footer contains a visible credit line:

> **Built for [Digital Heroes Training Task](https://digitalheroesco.com)**
