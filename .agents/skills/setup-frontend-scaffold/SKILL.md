---
name: setup-frontend-scaffold
description: Setup the React Native / Expo application scaffold and navigation structure for Opinor.
---

# Setup Frontend Scaffold (Opinor App)

This skill provides instructions for bootstrapping the Opinor mobile application according to the Technical Context Report.

## 1. Project Initialization
1. Use Expo CLI to create a new TypeScript project: `npx create-expo-app@latest opinor-mobile -t expo-template-blank-typescript`
2. Define the main color tokens globally in a `constants/Colors.ts` file (Dark Background: `#1A1D21`, Primary Teal: `#2ECC71`, Text: `#FFFFFF`).

## 2. Dependencies
Install the required dependencies to match the expected architecture:
- **Navigation:** `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`
- **State Management:** `zustand` (For global Auth and Badge counts)
- **API/Data Fetching:** `axios`, `@tanstack/react-query` or `swr` (for caching dashboard/feedbacks)
- **Secure Storage:** `expo-secure-store` (for JWT tokens)
- **Charts:** `react-native-chart-kit` or `victory-native` (for dashboard reports)

## 3. Navigation Structure Setup
Create a `navigation` folder and implement:
- `AuthNavigator`: For `Onboarding`, `Login`, and `JoinRequest` screens.
- `MainTabNavigator`: Bottom tab bar with 5 tabs:
  1. `Home`
  2. `Reports`
  3. `Feedbacks` (Central highlighted button)
  4. `Notifications`
  5. `Profile`
- `RootNavigator`: Conditionally renders `AuthNavigator` if `accessToken` is missing, or `MainTabNavigator` if logged in.
