# 🌌 FreelanceHub

A premium, glassmorphic dark-themed services marketplace and freelancer classifieds platform designed to connect clients and freelancers. Featuring real-time filters, instant messaging, invoice printouts, billing gateways, staff analytics, and responsive dark/light themes.

---

## ✨ Core Features

### 🔍 Marketplace Directory & Advanced Search
- Browse registered freelancers with dynamic keyword search by username, professional title, or bio.
- **User-Friendly Filters**: Auto-submitting checkbox filters (Available Now, Verified status) and dropdown ratings.
- **Search Debounce & Quick Pills**: Debounced auto-submit search input (600ms) and one-click quick suggestion pills for popular skills.

### 👤 Dual Profile Management & Configurations
- **Freelancers**: Professional title, hourly rate, bio, certificates, languages, education, cover banner image, portfolio manager, and skill tag cloud.
- **Clients**: Client-specific dashboard managing public contact email, location, age, and bio.

### 📅 Booking & Contract Pipeline
- Clients request booking contracts specifying start/end dates and task details.
- Progress monitoring pipeline timeline showing: Request &rarr; Acceptance &rarr; Payment &rarr; Work completion &rarr; Client feedback review.

### 💬 Asynchronous Messaging Inbox
- Real-time chat messaging panel.
- Support for uploading file attachments (spec sheets, invoices, code zip files).
- Floating count badges in the main navigation bar tracking unread messages.

### 💰 Secure Invoicing & Transaction Processing
- Calculates invoice amounts upon booking:
  $$\text{Invoice Amount} = \text{Booking Duration (Days)} \times 8\text{ hrs/day} \times \text{Hourly Rate}$$
- Simulated payment checkout interface supports card authorization.
- Print-friendly PDF stylesheets for generating physical receipts or downloadable invoice documents.

### 📊 Staff Analytics Dashboard
- Custom analytics page accessible only to system administrators.
- Tracks platform totals (Users, Bookings, Invoices, Revenue) and maps gross monthly revenue using Chart.js charts.

---

## 📁 File Structure & Codebase Overview

```text
FreelanceHub/
├── core/                           # Main application app
│   ├── static/core/css/
│   │   └── style.css               # Design system, glassmorphic components, dark/light themes
│   ├── templates/core/             # Redesigned premium template files
│   │   ├── admin_dashboard.html    # Staff stats dashboard mapping revenue charts
│   │   ├── base.html               # Main layout, sticky glass navigation, alert notification banners
│   │   ├── booking_edit.html       # Client interface to update pending booking dates
│   │   ├── chat.html               # Messaging screen with sidebar lists and file attachments
│   │   ├── checkout.html           # Simulated card checkout gate
│   │   ├── dashboard.html          # Performance charts (freelancer) and timeline pipelines (client)
│   │   ├── home.html               # Advanced directory listing with suggestions and search debounce
│   │   ├── inbox.html              # List of active conversations
│   │   ├── login.html              # Glassmorphism login screen
│   │   ├── notifications.html      # System alerts log list
│   │   ├── printable_invoice.html  # Print-friendly billing invoice view
│   │   ├── profile_edit.html       # Tabbed settings view (General, Pro, Skills, Portfolios)
│   │   ├── signup.html             # Glassmorphism signup screen with client/freelancer selectors
│   │   └── talent_detail.html      # Fiverr-like detail card with reviews list and booking hire forms
│   ├── admin.py                    # Registers all database tables in Django Admin
│   ├── context_processors.py       # Global context injections (unread counts)
│   ├── models.py                   # Data tables and profile signal triggers
│   ├── tests.py                    # Complete automated integration test suite
│   ├── urls.py                     # URL routes mapping views to endpoints
│   └── views.py                    # View controllers handling business logics
├── myapp/                          # Project configuration directory
│   ├── settings.py                 # Media file storage, Pillow parameters, context processors
│   └── urls.py                     # Configures Django Admin and media storage routing
├── media/                          # Upload directory for cover banners, portfolios, and attachments
├── venv/                           # Python virtualenv directory
├── db.sqlite3                      # Database storage
├── manage.py                       # Django CLI executable
└── requirements.txt                # Project dependencies
```

---

## 🗄️ Database Architecture

- **User**: Built-in Django authentication model.
- **Profile**: Extends Django User via `OneToOneField`. Stores role (`client` or `freelancer`), title, hourly rate, age, contact email, location, biography, education, certificates, languages, verified badge, and cover banner image.
- **Skill**: Master lookup table containing unique skill tags.
- **FreelancerSkill**: Many-to-Many association model mapping skills to freelancer profiles.
- **Booking**: Tracks booking dates, descriptions, and statuses (`pending`, `accepted`, `rejected`, `completed`, `cancelled`).
- **Invoice**: Stores billing details linked to bookings with status tracking (`due`, `paid`).
- **Review**: Stores client ratings (1-5 stars) and comments left on freelancer profiles.
- **Portfolio**: Stores freelancer project titles, live links, video links, screenshots, and descriptions.
- **Notification**: Stores system-wide notifications linked to users with unread flags.
- **Message**: Stores text messages and file attachment uploads.
- **Favourite**: Stores bookmarked freelancer profiles (client's wishlist).
- **Payment**: Stores transaction details (Transaction ID, payment method, amount, timestamp).
- **ActivityLog**: Logs recent user actions for audit trails.

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10+
- Virtual Environment (`venv`)

### 1. Clone the repository
```bash
git clone https://github.com/Tamilselvan-ks-077/FreelanceHub.git
cd FreelanceHub
```

### 2. Setup Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Run Automated Tests
```bash
python manage.py test
```

### 6. Run Server
```bash
python manage.py runserver
```
Visit http://127.0.0.1:8000/ to view the application.