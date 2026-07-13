# 🌌 FreelanceHub

A premium, glassmorphic dark-themed services marketplace and freelancer classifieds platform inspired by OLX, designed to connect clients and freelancers.

---

## ✨ Features

### 🔍 Marketplace Directory & Search
- Browse registerd freelancers with dynamic search by name, professional title, or bio.
- Filter profiles by specialized skill tags.
- Detailed freelancer pages showing age, hourly rate, contact email, and bio.

### 👤 Dual Profile Management (Client & Freelancer CRUD)
- **Freelancers**: Update professional title, hourly rate, bio, and add/remove skills from their custom tag cloud.
- **Clients**: Custom-tailored dashboard to edit name, age, public contact email, and company/personal bio without professional role constraints.

### 📅 Booking & Contract Pipeline
- Clients can request booking sessions specifying the duration (start/end dates) and tasks.
- Clients can edit or cancel pending booking requests at any time.
- Freelancers can review pending incoming requests to accept, decline, or complete them.

### 💰 Automated Invoicing
- System automatically generates invoices upon booking approval.
- Calculations are dynamically computed:
  $$\text{Invoice Amount} = \text{Booking Duration (Days)} \times 8\text{ hrs/day} \times \text{Hourly Rate}$$
- Secure payment workflow with status badges (unpaid, paid).

---

## 🎨 Design Aesthetics & UI System

The interface features a state-of-the-art dark theme built using **Vanilla CSS**:
- **Glassmorphic Panels**: Modern translucent cards featuring deep background blurs (`backdrop-filter`) and thin luminous borders.
- **Neon Radial Backgrounds**: Rich indigo, purple, and teal radial glow drops that adjust dynamically based on screen geometry.
- **Sticky Glass Header**: Persistent navigation headers with backdrop blurring for premium scroll layouts.
- **Micro-Animations**: Hover animations on cards and active states for tactile, premium engagement.
- **Typography**: Paired Google Fonts (**Outfit** for high-impact headers and **Inter** for legible reading).

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10+
- Django 5.0+

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
*(If `requirements.txt` is not created, install Django and DRF manually: `pip install django djangorestframework`)*

### 4. Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

### 6. Run Server
```bash
python manage.py runserver
```
Visit http://127.0.0.1:8000/ to view the application.

---

## 🗄️ Database Architecture

- **User**: Built-in Django authentication model.
- **Profile**: Extends Django user via `OneToOneField` to specify roles (`client` or `freelancer`), title, hourly rate, age, contact email, and bio.
- **Skill**: Master table containing skill tags.
- **FreelancerSkill**: Many-to-Many association model mapping skills to freelancer profiles.
- **Booking**: Stores contracts with status tracking (`pending`, `accepted`, `rejected`, `completed`).
- **Invoice**: Stores billing receipts linked to bookings with status tracking (`unpaid`, `paid`).