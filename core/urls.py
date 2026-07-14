from django.urls import path
from . import views

urlpatterns = [
    # General & Search Directory
    path('', views.home, name='home'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Profile & Portfolio CRUD
    path('profile/edit/', views.profile_edit_view, name='profile_edit'),
    path('freelancer/<int:profile_id>/', views.talent_detail_view, name='talent_detail'),
    
    # Wishlist / Bookmarking
    path('favourite/toggle/<int:profile_id>/', views.toggle_favourite_view, name='toggle_favourite'),
    
    # Dashboard & Booking Pipeline
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('booking/create/<int:freelancer_id>/', views.create_booking_view, name='create_booking'),
    path('booking/action/<int:booking_id>/', views.booking_action_view, name='booking_action'),
    path('booking/edit/<int:booking_id>/', views.booking_edit_view, name='booking_edit'),
    path('booking/cancel/<int:booking_id>/', views.booking_cancel_view, name='booking_cancel'),
    
    # Payments & Invoicing
    path('invoice/pay/<int:invoice_id>/', views.pay_invoice_view, name='pay_invoice'),
    path('invoice/<int:invoice_id>/print/', views.invoice_print_view, name='invoice_print'),
    
    # Messaging Chat system
    path('messages/', views.messages_list_view, name='messages'),
    path('messages/<str:username>/', views.chat_view, name='chat'),
    
    # Notifications system
    path('notifications/', views.notifications_list_view, name='notifications'),
    path('notifications/read/', views.mark_notifications_read_view, name='mark_notifications_read'),
    
    # Custom Analytics Dashboard
    path('admin-dashboard/', views.admin_dashboard_view, name='admin_dashboard'),
    
    # Legacy compatibility API endpoint
    path("api/students/", views.student_list, name="student-list"),
]
