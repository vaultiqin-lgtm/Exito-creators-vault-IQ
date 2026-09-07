# Vault IQ - Development Backlog

This backlog tracks user stories, technical tasks, and feature requests for the **Vault IQ** financial intelligence platform.

---

## 📋 Active Backlog Summary

| Story ID | Title | Priority | Status | Target Component(s) |
| :--- | :--- | :---: | :---: | :--- |
| **US-01** | Account Verification via OTP | High | ✅ Done | Auth, Profile, Backend (server.ts) |
| **US-02** | Daily Expense Summary (AI Pipeline) | Medium | ✅ Done | Settings, Reports, Backend (server.ts) |
| **US-03** | Monthly Financial Summary (AI Pipeline) | High | ✅ Done | Settings, Reports, Backend (server.ts) |

---

## 🛠️ User Story Details

### 🔑 US-01: Account Verification via OTP

#### Description
> **As a user,**  
> I want to verify my account using a One-Time Password (OTP) sent to my registered mobile number,  
> **so that** my account security is enhanced and my profile is validated.

#### 📋 Acceptance Criteria
- **Scenario: Initiating sign-up/verification**
  - **Given** I am on the Auth/Registration page or editing my profile,
  - **When** I enter a valid 10-digit Indian mobile number and click "Send OTP",
  - **Then** the system should generate a secure 6-digit OTP and send it via SMS (simulated/mocked or Twilio),
  - **And** a 60-second countdown timer should start for resending the OTP.
- **Scenario: Successful OTP Verification**
  - **Given** an OTP has been sent to my mobile number,
  - **When** I input the correct 6-digit code and submit,
  - **Then** my account should be marked as "Verified" with a visual check badge,
  - **And** my verified state should persist in the local session storage database.
- **Scenario: Invalid/Expired OTP**
  - **Given** an OTP has been sent to my mobile number,
  - **When** I input an incorrect code or an expired OTP,
  - **Then** the system should show an error message: "Invalid OTP. Please check the code or try again."

#### 🔧 Technical Implementation Notes
- **Frontend changes**:
  - Update [Auth.tsx](file:///c:/Users/HARISH%20KUMAR%20M/Desktop/FINAL%20PROJECT/Vault%20IQ/src/components/Auth.tsx) and [Profile.tsx](file:///c:/Users/HARISH%20KUMAR%20M/Desktop/FINAL%20PROJECT/Vault%20IQ/src/components/Profile.tsx) to render mobile number fields and an OTP verification code input field with a countdown timer.
  - Read/Write the verified status (`mobileVerified: boolean`) from `vault_iq_profile_{username}` in browser's local storage.
- **Backend changes**:
  - Create endpoints in [server.ts](file:///c:/Users/HARISH%20KUMAR%20M/Desktop/FINAL%20PROJECT/Vault%20IQ/server.ts):
    - `POST /api/auth/otp/send`: Generates a random 6-digit PIN, caches it in memory (expiring in 5 minutes), and sends it to the user's mobile number using a simulated SMS logger or integrated gateway.
    - `POST /api/auth/otp/verify`: Matches the received OTP against the cached token for that session.
- **Dependencies**: None for mockup/simulator. Twilio SDK `twilio` if integrating live gateway.

---

### 📅 US-02: Daily Expense Reports

#### Description
> **As a user,**  
> I want to receive a daily summary of my expenses emailed to my registered Gmail address at 6:00 PM every evening, formatted as a Word document,  
> **so that** I can easily track my daily spending habits and maintain budget awareness.

#### 📋 Acceptance Criteria
- **Scenario: Subscription & Configuration**
  - **Given** I am in the Settings workspace,
  - **When** I provide a valid Gmail address and enable the "Daily PDF/Doc Reports" toggle,
  - **Then** the configurations should save to my local profile.
- **Scenario: Report Dispatch**
  - **Given** the time is exactly 6:00 PM on any given day,
  - **When** there are recorded expense logs for the current date,
  - **Then** the backend scheduler must aggregate the day's expenses,
  - **And** compile them into a formatted Word (.docx) document,
  - **And** email the document as an attachment to my Gmail address.
- **Scenario: No Expenses Logged**
  - **Given** it is 6:00 PM and I have logged 0 expenses today,
  - **Then** the backend should send a lightweight notification email informing me that no expenses were recorded today, encouraging me to log them.

#### 🔧 Technical Implementation Notes
- **Frontend changes**:
  - Update [Settings.tsx](file:///c:/Users/HARISH%20KUMAR%20M/Desktop/FINAL%20PROJECT/Vault%20IQ/src/components/Settings.tsx) to include configuration forms (Gmail address, timezone scheduler settings, daily toggles).
- **Backend changes**:
  - Implement a cron-like scheduler inside [server.ts](file:///c:/Users/HARISH%20KUMAR%20M/Desktop/FINAL%20PROJECT/Vault%20IQ/server.ts) (e.g., using `node-cron` or a persistent `setInterval` daemon check) running daily at 18:00 (Asia/Kolkata timezone).
  - Add API route `POST /api/reports/sync-state` so the client-side local storage expense state can be synced/pushed to the server periodically for backend reporting.
  - Implement Word document creation using the `docx` node package, styled with consistent brand colors (`#5A5A40` and charcoal) and proper headings/tables.
  - Configure mail dispatcher using `nodemailer` through a secure Gmail app password or OAuth2.
  - Append logs to the SMTP Log history array visible in [Settings.tsx](file:///c:/Users/HARISH%20KUMAR%20M/Desktop/FINAL%20PROJECT/Vault%20IQ/src/components/Settings.tsx).
- **Dependencies**: `docx` (Word doc generation), `nodemailer` (SMTP transport), `node-cron` (scheduling).

---

### 📊 US-03: Monthly Financial Reports

#### Description
> **As a user,**  
> I want to receive a comprehensive monthly summary of my expenses and savings emailed to my registered Gmail address at 6:00 PM on the last day of the month, formatted as a Word document,  
> **so that** I have a clear and archive-ready record of my overall financial health.

#### 📋 Acceptance Criteria
- **Scenario: Report compilation**
  - **Given** it is 6:00 PM on the last day of the calendar month (e.g., Jan 31st, Feb 28th/29th),
  - **When** the scheduled task runs,
  - **Then** the backend must aggregate all expenses logged during that month,
  - **And** compile savings milestone contributions, salary allocations, split-bills ledger, and AI appreciation remarks.
- **Scenario: Report Delivery**
  - **Given** the report has been successfully compiled into a Word (.docx) document,
  - **When** the SMTP client dispatches,
  - **Then** I should receive an email with the subject "Vault IQ - Monthly Financial Summary: [Month] [Year]" with the document attached,
  - **And** a record should be logged in the dispatch history logs database.

#### 🔧 Technical Implementation Notes
- **Frontend changes**:
  - Add options in [Settings.tsx](file:///c:/Users/HARISH%20KUMAR%20M/Desktop/FINAL%20PROJECT/Vault%20IQ/src/components/Settings.tsx) for Monthly Report dispatch.
- **Backend changes**:
  - Expand scheduler logic in [server.ts](file:///c:/Users/HARISH%20KUMAR%20M/Desktop/FINAL%20PROJECT/Vault%20IQ/server.ts) to detect month-end dates and execute the monthly aggregation pipeline.
  - Build the comprehensive template using the `docx` library with tables, breakdown lists, savings percentage allocations, and AI goal advice.
  - Integrate SMTP dispatch via `nodemailer` and save statuses to the application's dispatch log.
- **Dependencies**: Same as US-02 (`docx`, `nodemailer`, `node-cron`).
