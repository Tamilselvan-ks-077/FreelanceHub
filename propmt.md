You are a senior full-stack engineer, UI/UX designer, security engineer, and code reviewer.

I have an existing production-style full-stack project called **FreelanceHub**.

### PROJECT STACK

Frontend:

* React
* Vite
* React Router
* JavaScript/JSX
* CSS
* Responsive design
* Reusable UI components
* Design tokens

Backend:

* Python
* Django
* Django REST Framework
* JWT authentication
* SQLite currently
* REST APIs

Project structure:

FreelanceHub/
├── backend/
│   └── myapp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── components/ui/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── assets/
├── manage.py
├── requirements.txt
└── README.md

Important existing features include:

* Authentication
* Login / Signup
* Protected routes
* Freelancer listings
* Search and filters
* Freelancer detail pages
* Favourite system
* Dashboard
* Profile editing
* Messaging / Inbox
* Chat
* Notifications
* Booking
* Admin dashboard
* REST API
* Responsive navbar
* Reusable UI components
* Loading states / skeletons
* Design system

---

# YOUR TASK

Do NOT immediately start rewriting the project.

First, perform a **complete audit of the existing codebase**.

Understand the actual implementation rather than assuming the architecture from this description.

Inspect:

* Frontend
* Backend
* API endpoints
* Authentication
* Database/models
* Routing
* State management
* API service layer
* Components
* Pages
* CSS
* Design tokens
* Assets
* Environment configuration
* Error handling
* Security
* Performance
* Responsive behavior
* Production/deployment configuration

---

# PHASE 1 — CODEBASE AUDIT

Analyze the entire project and identify:

### Frontend

* Broken components
* Runtime errors
* Console errors
* Incorrect imports
* Unused imports
* Dead code
* Duplicate code
* Bad component structure
* Poor state management
* API handling problems
* Race conditions
* Missing loading states
* Missing error states
* Poor empty states
* Broken navigation
* Broken responsive layouts
* Accessibility problems
* Bad UX
* Inconsistent styling
* Hardcoded values
* Poor typography
* Layout issues
* Unnecessary re-renders
* Performance problems

### Backend

* Broken APIs
* Incorrect serializers
* Incorrect views/viewsets
* Incorrect URL routing
* Authentication problems
* Authorization problems
* Missing validation
* Poor exception handling
* N+1 database queries
* Inefficient queries
* Incorrect model relationships
* Missing indexes where appropriate
* Security vulnerabilities
* Poor API structure
* Incorrect status codes
* Duplicate logic
* Bad Django practices

### Database

Check:

* Models
* Relationships
* Foreign keys
* Constraints
* Indexes
* Migrations
* Query efficiency
* Data validation
* Potential data integrity issues

### Authentication & Security

Perform a security review including:

* JWT handling
* Token storage
* Authentication flow
* Authorization
* IDOR vulnerabilities
* Broken access control
* CORS
* CSRF
* XSS
* SQL injection
* Input validation
* File upload security
* Rate limiting
* Sensitive information exposure
* Debug mode
* Secret management
* Security headers
* Password handling
* API endpoint protection
* Admin protection

Use the **OWASP Top 10** as a security-review framework.

Do not introduce unnecessary security complexity.

---

# PHASE 2 — UI/UX AUDIT

Treat FreelanceHub as a real professional product, not a student demo.

Review every important page:

* Home
* Login
* Signup
* Freelancer listing
* Freelancer detail
* Dashboard
* Profile
* Inbox
* Chat
* Notifications
* Booking
* Admin dashboard
* Any other existing page

Improve:

* Visual hierarchy
* Typography
* Spacing
* Alignment
* Cards
* Buttons
* Forms
* Inputs
* Navigation
* Search/filter experience
* Empty states
* Loading states
* Error states
* Responsive design
* Mobile experience
* Accessibility
* Micro-interactions
* Hover/focus states
* Consistency

The UI should feel like a **real SaaS/freelance marketplace product**.

Aim for:

* Clean
* Premium
* Modern
* Professional
* Minimal
* Consistent
* Fast
* Responsive

Do NOT overuse gradients, glassmorphism, huge animations, excessive shadows, or unnecessary decorative elements.

Do not make it look obviously AI-generated.

---

# PHASE 3 — FUNCTIONAL TESTING

Trace the complete user flows.

Test logically:

1. New user opens website
2. Signup
3. Login
4. Logout
5. Browse freelancers
6. Search freelancers
7. Apply filters
8. Open freelancer profile
9. Favourite/unfavourite freelancer
10. Open dashboard
11. Edit profile
12. Send message
13. Receive/view messages
14. Open chat
15. Create booking
16. Edit booking
17. Notifications
18. Admin functionality
19. Protected routes
20. Invalid routes
21. API failures
22. Expired/invalid authentication
23. Refresh browser while authenticated
24. Mobile navigation

For every flow, identify what can fail.

---

# PHASE 4 — API + FRONTEND INTEGRATION

Verify that every frontend API call correctly matches the Django backend.

Check:

* HTTP method
* URL
* Request body
* Headers
* Authentication
* Response structure
* Error handling
* Status codes
* Loading states

Find mismatches such as:

Frontend expects:
{
"user": {...}
}

while backend actually returns:
{
"data": {...}
}

Fix integration issues instead of adding hacks to hide them.

Create a clean API service architecture if the existing one needs improvement.

---

# PHASE 5 — PERFORMANCE

Optimize only where there is a real benefit.

Check:

Frontend:

* Unnecessary renders
* Large components
* Expensive calculations
* Image loading
* Bundle size
* Lazy loading
* API requests
* Duplicate requests

Backend:

* N+1 queries
* select_related
* prefetch_related
* pagination
* unnecessary database queries
* inefficient filtering

Do not prematurely optimize.

---

# PHASE 6 — CODE QUALITY

Improve the codebase while preserving existing behavior.

Follow:

* DRY
* SOLID where appropriate
* Clear naming
* Small reusable components
* Separation of concerns
* Clean API service layer
* Maintainable Django architecture
* Maintainable React architecture

Remove:

* Dead code
* Duplicate logic
* Unused files
* Unused imports
* Temporary debugging code
* Hardcoded development-only hacks

Do not rewrite everything just for the sake of rewriting.

---

# PHASE 7 — PRODUCTION READINESS

Check the project as if it is going to be shown to:

* Recruiters
* Interviewers
* Developers
* Real users

Review:

* Environment variables
* Secrets
* DEBUG
* CORS
* Allowed hosts
* Static files
* Media files
* API configuration
* Production database readiness
* Error handling
* Logging
* Security settings
* Build configuration
* Deployment configuration

Clearly separate development configuration from production configuration.

---

# VERY IMPORTANT RULES

### 1. DO NOT BREAK WORKING FEATURES

Before modifying anything, understand how it currently works.

Prefer small, targeted changes.

### 2. DO NOT REWRITE THE ENTIRE PROJECT

Keep the existing architecture when it is good.

Only refactor when there is a clear reason.

### 3. VERIFY BEFORE CLAIMING

Do not say something is fixed unless you actually inspect/test the relevant code.

### 4. PRESERVE EXISTING FUNCTIONALITY

Every existing feature should continue working after improvements.

### 5. DO NOT CREATE FAKE FEATURES

Do not add fake API responses, fake authentication, fake data, or placeholder functionality just to make the UI appear complete.

### 6. NO RANDOM DEPENDENCIES

Do not install libraries unless they provide a clear benefit.

Prefer the existing stack.

### 7. NO HARDCODED SECRETS

Never put API keys, passwords, tokens, or secrets directly into source code.

### 8. KEEP THE DESIGN SYSTEM

Use the existing design tokens where possible.

Do not create random colors, spacing, radii, or typography values throughout the project.

### 9. RESPONSIVE FIRST

Every UI improvement must work on:

* Desktop
* Tablet
* Mobile

### 10. ACCESSIBILITY

Use:

* Semantic HTML
* Keyboard navigation
* Proper labels
* Focus states
* Accessible buttons
* Alt text
* Appropriate ARIA only when necessary

---

# EXECUTION STRATEGY

Work in this exact order:

### STEP 1

Inspect the complete repository.

### STEP 2

Create an internal understanding of:

* Architecture
* Data flow
* Authentication flow
* API flow
* Main user flows
* Component relationships

### STEP 3

Identify problems and classify them:

🔴 Critical

* Security vulnerabilities
* Broken core functionality
* Data loss/integrity problems
* Authentication/authorization problems

🟠 High

* Major bugs
* Broken user flows
* API integration problems
* Serious responsive/UI issues

🟡 Medium

* UX problems
* Performance issues
* Code quality problems

🟢 Low

* Minor visual improvements
* Refactoring
* Small polish improvements

### STEP 4

Fix critical and high-priority issues first.

### STEP 5

Improve UX/UI.

### STEP 6

Improve performance and code quality.

### STEP 7

Run/build/test the project.

### STEP 8

Check for regressions.

### STEP 9

Give me a final report.

---

# FINAL REPORT

After completing the work, provide:

## 1. Audit Summary

What was wrong?

## 2. Changes Made

List the files changed and what was changed.

## 3. Bugs Fixed

Explain each important bug.

## 4. Security Improvements

List security issues found and fixed.

## 5. UI/UX Improvements

Explain the major visual/UX changes.

## 6. Performance Improvements

Explain meaningful optimizations.

## 7. Testing

Tell me exactly what you tested.

Example:

* npm run build → PASS
* Django checks → PASS
* API authentication → PASS
* Login flow → PASS
* Freelancer search → PASS
* Favourite → PASS
* Messaging → PASS
* Booking → PASS
* Mobile layout → PASS

Do not claim PASS unless actually verified.

## 8. Remaining Issues

Clearly list anything you could not verify or fix.

## 9. Recommended Next Steps

Give me the top 5 improvements that would provide the most value.

---

# MOST IMPORTANT

Think like a **senior engineer taking ownership of an existing production application**.

Do not blindly modify files.

**Inspect → Understand → Identify → Prioritize → Fix → Test → Verify → Report.**

Make FreelanceHub feel like a polished, professional, production-ready freelance marketplace while preserving the existing architecture and functionality.
