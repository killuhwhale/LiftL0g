# Fitform Project Context

## Project Overview
Fitform is a mobile fitness platform (React Native/Expo) with a Django/PostgreSQL backend. It allows users and gyms to create, track, and manage workouts, classes, and memberships. This project is actively being updated to modern React Native/Expo standards.

## System Architecture 
* **Frontend:** React Native using Expo (`npx expo`).
* **Backend:** Django Rest Framework running in Docker.
* **Database:** PostgreSQL running in Docker
* **Payments:** Stripe integration (Backend) / RevenueCat (Mobile).

## Frontend Tech Stack & Libraries
When writing frontend code, adhere to the following library ecosystem:
* **State Management:** Redux Toolkit (`@reduxjs/toolkit`). Do not use context API for global state.
* **Styling:** Uses Tailwind via `twrnc` and `styled-components`. Prefer matching the styling paradigm of the existing file being edited.
* **Navigation:** The app utilizes both `expo-router` and `@react-navigation` packages. Pay close attention to the existing routing imports in a directory before adding new screens.
* **Monetization:** `react-native-purchases` handles IAP, and `react-native-google-mobile-ads` handles advertisements. Note: Google Ads do not work within the standard Expo Go app; a prebuild/emulator is required.
* **Key Utilities:** * Storage: `killuhwhal3-rn-secure-storage`
  * Media: `react-native-image-crop-picker` and `react-native-video`
  * Icons: `@expo/vector-icons`

## Core Business Logic & Models
* **Workout Tracking Logic (CRITICAL):** * `CompletedWorkoutGroups` and `<Completed*>` models are explicitly used for tracking a user actually doing a workout. 
  * They are heavily used to "complete" another `WorkoutGroup` from another user/class.
  * This structure allows a class to post a template workout, and the user completes it by adding their own metrics, keeping the original intact for comparison.
* **Role Permissions (Feature currently turned off to focus on main WorkoutGroup Experience):**
  * Gym Owners: Can create coaches and members for a class.
  * Coaches: Can create members for a class.
  * Users: Cannot modify other users. Can only delete their own completed workouts. 
  * SuperUsers: Required to create/delete `WorkoutNames`.

## Database Triggers & Abuse Limits
The backend database enforces strict limits to prevent abuse. Do not write code that attempts to bypass these:
* **Gyms:** Max 15 total per user.
* **GymClasses:** Max 15 total per gym.
* **WorkoutGroups:** Max 15 created per day (for members/classes). Non-members are limited to 1 per day.
* **CompletedWorkoutGroups:** Max 15 per day.

## API Endpoint Structure
The backend utilizes Django Rest Framework. Most endpoints follow standard ViewSet routing formats (e.g., `/users/`, `/gyms/`, `/gymClasses/`, `/workoutGroups/`, `/workouts/`, `/completedWorkoutGroups/`, `/profile/`). 
* Note: Profile images, password resets, and media editing have dedicated custom routes under their respective model prefixes.

## Frontend API Layer (RTK Query)
The frontend exclusively uses Redux Toolkit Query (`apiSlice.ts`) for data fetching and state management. 
* **Authentication is Automatic:** The custom `asyncBaseQuery` automatically retrieves the stored token, injects the `Authorization: Bearer` header, and handles 401 token refreshes natively. **Do not** write manual fetch calls or manually append auth headers in UI components.
* **Content Types:** The `asyncBaseQuery` dynamically handles request formatting. Pass `params: { contentType: "multipart/form-data" }` or `"application/json"` in the endpoint definition.
* **Strict Cache Invalidation (CRITICAL):** The app relies heavily on RTK Query Tags to trigger UI re-renders. When writing a new mutation, you MUST properly invalidate the relevant tags. 
  * *Example:* Completing a workout must invalidate `WorkoutGroupWorkouts`, `UserWorkoutGroups`, `StatsQuery`, and `DailySnapshot` to ensure the profile, stats, and workout screens update immediately.
