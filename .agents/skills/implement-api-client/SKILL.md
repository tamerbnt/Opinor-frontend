---
name: implement-api-client
description: Build the Axios HTTP Client with JWT interceptors for the Opinor API.
---

# Implement API Client (Opinor App)

This skill guides the implementation of the core communication layer between the mobile app and the NestJS backend.

## 1. Axios Instance Setup
Create `api/client.ts`. Define an Axios instance pointing to the backend API (`/api/v1`). 
- If testing locally on an emulator, use `10.0.2.2:3000` (Android) or `localhost:3000` (iOS).

## 2. Secure Token Storage
Use `expo-secure-store` to build helper functions:
- `setTokens(access, refresh)`
- `getAccessToken()`
- `getRefreshToken()`
- `clearTokens()`

## 3. Request Interceptor
Attach the JWT bearer token to every outgoing request.
```typescript
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 4. Response Interceptor (JWT Refresh Flow)
Implement logic to catch `401 Unauthorized` errors.
1. When a 401 is thrown, check if original request has been retried.
2. Read `refreshToken` from secure storage.
3. Make an unauthenticated `POST /auth/refresh` request providing the refresh token.
4. On success: Update stored tokens, append new access token to the failed request, and retry it.
5. On failure: Clear tokens and forcefully log the user out (navigate to Login).

## 5. Endpoints Implementation Map
Map out typical service files (e.g. `api/auth.ts`, `api/feedbacks.ts`) mirroring the endpoints listed in the Technical Context Report.
