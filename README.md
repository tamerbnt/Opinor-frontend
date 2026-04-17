# Opinor Project Master Guide & Deployment Checklist

Welcome to the **Opinor** project. This repository contains the complete ecosystem for a high-fidelity feedback and review management system, consisting of a NestJS backend and an Expo-based mobile application.

---

## 🏗️ Project Structure
- **/opinor-api-main**: The backend engine (NestJS, PostgreSQL).
- **/opinor-mobile**: The business owner's mobile dashboard (React Native, Expo).
- **/opinorfigma_extracted**: Extracted UI assets and design references.

---

## 🛠️ Local Development Setup

### 1. Backend (`opinor-api-main`)
**Prerequisites**: Node.js v18+, PostgreSQL v14+.

1.  **Install Dependencies**:
    ```bash
    cd opinor-api-main
    npm install
    ```
2.  **Environment Setup**:
    - Copy `.env.example` to `.env`.
    - Update `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` to match your local PostgreSQL instance.
3.  **Database Initialization**:
    ```bash
    npm run migration:run
    npm run seed
    ```
    *Note: The default admin is `admin@opinor.com` with password `Admin@123`.*
4.  **Launch**:
    ```bash
    npm run start:dev
    ```
    API Documentation is available at: `http://localhost:3000/api/docs`

### 2. Mobile App (`opinor-mobile`)
**Prerequisites**: Node.js v18+, Expo CLI (`npm install -g expo-cli`).

1.  **Install Dependencies**:
    ```bash
    cd opinor-mobile
    npm install
    ```
2.  **Environment Setup**:
    - Create a `.env` file in the root of `opinor-mobile`.
    - Add the following variable, replacing the IP with your local machine's local network IP (e.g., `192.168.1.XX`):
      ```env
      EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api/v1
      ```
3.  **Launch**:
    ```bash
    npx expo start
    ```
    Scan the QR code with the Expo Go app on your mobile device.

---

## 🚀 Final Deployment Checklist

### ✅ Phase 1: Infrastructure & Backend
- [ ] **SSL/HTTPS**: Ensure a valid SSL certificate is installed (Certbot/Let's Encrypt).
- [ ] **Database**: Provision a production PostgreSQL instance. Perform a test migration.
- [ ] **Security Secrets**: Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in the production `.env`.
- [ ] **Mail Server**: Configure SMTP settings (`MAIL_HOST`, `MAIL_USER`, `MAIL_PASSWORD`) for invitation and notification emails.
- [ ] **Process Management**: Use **PM2** or **Docker** to ensure the NestJS service restarts automatically.
- [ ] **Rate Limiting**: Verify `THROTTLE_TTL` and `THROTTLE_LIMIT` settings to prevent API abuse.

### ✅ Phase 2: Mobile App Production Build
- [ ] **EAS Build**: Configure `app.json` for production and run `eas build --platform ios/android`.
- [ ] **Environment Variables**: Ensure `EXPO_PUBLIC_API_URL` points to the **production** domain (e.g., `https://api.opinor.com/api/v1`).
- [ ] **App Store Assets**: Prepare icons, splash screens, and store descriptions in the `assets/` folder.
- [ ] **Deep Linking**: Configure your scheme and domain for mobile deep links if required.

### ✅ Phase 3: Final Verification
- [ ] **Auth Persistence**: Verify that sessions remain active after app restarts.
- [ ] **Theme Preference**: Confirm Dark/Light mode selection is saved across sessions.
- [ ] **Export Feature**: Test the "Export Report" functionality in `ReportsScreen`.
- [ ] **Lints & Types**: Run `npm run lint` and `npx tsc` to ensure no production-blocking errors.

---

## 📞 Support & Maintenance
For further technical assistance, please refer to the [CLIENT_HANDOVER.md](CLIENT_HANDOVER.md) for a detailed feature breakdown of the work completed.
