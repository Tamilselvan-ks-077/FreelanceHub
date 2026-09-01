"""
core/api_urls.py
-----------------
URL patterns for the FreelanceHub REST API (v1).
All paths are prefixed with /api/v1/ from myapp/urls.py.
"""

from django.urls import path
from . import api_views

urlpatterns = [
    # Auth
    path('auth/login/',    api_views.api_login,   name='api_login'),
    path('auth/logout/',   api_views.api_logout,  name='api_logout'),
    path('auth/signup/',   api_views.api_signup,  name='api_signup'),
    path('auth/me/',       api_views.api_me,      name='api_me'),

    # Profile
    path('profile/',       api_views.api_profile, name='api_profile'),

    # Freelancer directory
    path('freelancers/',                          api_views.api_freelancers,        name='api_freelancers'),
    path('freelancers/<int:profile_id>/',         api_views.api_freelancer_detail,  name='api_freelancer_detail'),
    path('freelancers/<int:profile_id>/favourite/', api_views.api_toggle_favourite, name='api_toggle_favourite'),

    # Dashboard
    path('dashboard/',     api_views.api_dashboard, name='api_dashboard'),

    # Bookings
    path('bookings/create/<int:freelancer_id>/', api_views.api_create_booking,  name='api_create_booking'),
    path('bookings/<int:booking_id>/',           api_views.api_booking_detail,  name='api_booking_detail'),
    path('bookings/<int:booking_id>/action/',    api_views.api_booking_action,  name='api_booking_action'),
    path('bookings/<int:booking_id>/cancel/',    api_views.api_cancel_booking,  name='api_cancel_booking'),

    # Invoices
    path('invoices/<int:invoice_id>/pay/',       api_views.api_pay_invoice,     name='api_pay_invoice'),

    # Messages
    path('messages/',                            api_views.api_inbox,           name='api_inbox'),
    path('messages/<str:username>/',             api_views.api_chat,            name='api_chat'),

    # Notifications
    path('notifications/',                       api_views.api_notifications,          name='api_notifications'),
    path('notifications/read/',                  api_views.api_mark_notifications_read, name='api_mark_notifications_read'),

    # Admin
    path('admin/stats/',                         api_views.api_admin_stats,     name='api_admin_stats'),
]
