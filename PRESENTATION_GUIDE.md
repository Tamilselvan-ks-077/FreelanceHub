# 🌌 FreelanceHub: Presentation & Project Guide

This guide is designed to help you understand and present the **FreelanceHub** project step-by-step. It covers the project's purpose, design system, database architecture, file structure, key codebase files, and workflow demo steps.

---

## 📋 1. Project Overview & Features
**FreelanceHub** is a premium, glassmorphic dark-themed services marketplace and freelancer classifieds platform designed to connect clients and freelancers.

### Core Features:
1. **Marketplace & Dynamic Search**: Users can search for freelancers by name, professional title, or bio, and filter them by skill tags, availability, and ratings. Auto-submits on changes and includes debounced text input.
2. **Dual Profile Management (CRUD)**:
   - **Freelancers** can set their professional title, hourly rate, bio, certificates, education, languages, cover banner, upload screenshots to a portfolio gallery, and manage skill tags.
   - **Clients** have a custom dashboard to edit their personal info, location, age, and contact email.
3. **Booking Pipeline**: Clients request bookings with status tracking (Pending &rarr; Accepted &rarr; Paid &rarr; Completed &rarr; Reviewed).
4. **Automated Invoicing**: Calculates and creates an invoice upon freelancer acceptance:
   $$\text{Invoice Amount} = \text{Booking Duration (Days)} \times 8\text{ hrs/day} \times \text{Hourly Rate}$$
5. **Secure Payment Workflow**: Clients can pay generated invoices from their dashboard through a simulated checkout gate.
6. **Chat Messages & Notifications**: Active direct messaging screen supporting file uploads, with count badges in the main navigation.
7. **System Analytics**: Custom administrator dashboard tracking monthly revenue with Chart.js charts.
8. **Printable Invoices**: Styled printable view for physical print or PDF download.

---

## 🎨 2. UI/UX Design System (Vanilla CSS)
The frontend uses **Vanilla CSS** with state-of-the-art dark/light mode styles:
- **Glassmorphism**: Translucent panels using `backdrop-filter: blur(...)` and thin luminous borders.
- **Neon Radial Backgrounds**: Soft indigo, purple, and teal radial glow drops that move with the page.
- **Dark/Light Theme Switcher**: Persisted theme choice in localStorage with initial fallback to browser system preferences.
- **Micro-Animations**: Hover transitions on dashboard elements and cards.
- **Typography**: Google Fonts (**Outfit** for high-impact headers and **Inter** for readable body text).

---

## 🗄️ 3. Database Architecture (Models)
Located in `core/models.py`, the database defines 13 models:
1. **`User`**: Django's built-in authentication system.
2. **`Profile`**: Extends `User` via `OneToOneField`. Stores client or freelancer role and pro details.
3. **`Skill`**: A lookup table containing unique skill tags.
4. **`FreelancerSkill`**: Many-to-Many mapping of skills to freelancer profiles.
5. **`Booking`**: Stores client requests with status tracking.
6. **`Invoice`**: Tied to a `Booking` (OneToOne). Calculates and stores payment status.
7. **`Review`**: Client comments and 1-5 ratings.
8. **`Portfolio`**: Freelancer screenshots, live links, and YouTube demo links.
9. **`Notification`**: System alerts (booking, payment, message).
10. **`Message`**: Direct text messages and files.
11. **`Favourite`**: Bookmarked freelancers list.
12. **`Payment`**: Financial transaction logs.
13. **`ActivityLog`**: System actions audit trail.

---

## 📁 4. Project File Structure
- `core/static/core/css/style.css` - Custom styling classes, light mode overrides, and keyframe animations.
- `core/templates/core/base.html` - Master layout, sticky glass navigation, and theme initialization.
- `core/templates/core/home.html` - Directory listing with debounced inputs and suggestions pills.
- `core/templates/core/talent_detail.html` - Premium Fiverr-like display with hire form and reviews.
- `core/templates/core/dashboard.html` - Line charts (Chart.js) and progress pipeline timelines.
- `core/templates/core/chat.html` & `inbox.html` - Messaging view supporting attachment files.
- `core/templates/core/admin_dashboard.html` - Admin statistics and monthly revenue graphs.
- `core/templates/core/checkout.html` - Card authorization checkout form.
- `core/templates/core/printable_invoice.html` - Print-friendly invoice receipt.
- `core/tests.py` - Automated integration test suite.
- `core/views.py` - Core view controllers handling workflows.
- `core/urls.py` - URL routes configuration.

---

## 🔄 5. Demo Script (Step-by-Step)
1. **Showcase Home & Auto-filtering**: Point out search debounce. Search for a freelancer, select checkboxes, click suggested pills.
2. **Register a Freelancer**: Register `freelancer_test`, go to Edit Profile, add "Django" skill, and set rate to `$50`. Upload a cover banner and portfolio project.
3. **Register a Client**: Register `client_test`.
4. **Make a Booking**: Browse `freelancer_test` as client, request a booking from Today to 4 days from now (5 days total).
5. **Accept Booking**: Log in as `freelancer_test`, click **Accept**. Points out that an invoice has been generated for $2,000 (5 days * 8 hours/day * $50/hour).
6. **Pay Invoice**: Log in as `client_test`, go to dashboard, click **Pay Now**, enter simulated card details, click **Authorize & Pay**.
7. **Complete & Review**: Log in as `freelancer_test` and click **Complete**. Log in as `client_test`, visit the profile, and submit a 5-star review.
8. **Show theme switcher**: Click the theme toggle button in the navbar to switch between dark and light modes.
