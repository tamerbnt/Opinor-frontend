---
name: implement-dashboard-ui
description: Guidelines for implementing the complex data visualizations in Opinor Mobile.
---

# Implement Dashboard UI & Charts

This skill outlines how to build the Data visualizations found in the Home and Reports screens.

## 1. Home Dashboard
- Target API: `GET /dashboard/summary`
- UI Components:
  - **Gauge Chart:** Use `react-native-svg` to draw a half-circle representing the Average Satisfaction Score (e.g., 4.3 / 5). The arc fill amount = `(score / 5) * 100`.
  - **Daily Bar Chart:** Map the "Received feedbacks" data. Implement a tab toggle for Day | Week | Month that refetches the query.
  - **Achievement Cards:** Simple views populated by `GET /dashboard/achievements`.

## 2. Reports Features
- Target API: `GET /reports/statistics` and `GET /reports/ratings-distribution`
- UI Components:
  - **Rating Distribution:** Horizontal bar chart 1 -> 5. 
  - **Metrics Grid:** +X% vs Yesterday logic using standard bold fonts and up/down arrows based on the boolean polarity of the statistic.

## 3. Feedbacks List
- Target API: `GET /feedbacks`
- UI Components:
  - Implement an `Optimistic Update` when writing a response (`POST /feedbacks/:id/response`), appending the response text instantly on the UI while sending the HTTP request in the background.
