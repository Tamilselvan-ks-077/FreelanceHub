from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/edit/', views.profile_edit_view, name='profile_edit'),
    path('freelancer/<int:profile_id>/', views.talent_detail_view, name='talent_detail'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('booking/create/<int:freelancer_id>/', views.create_booking_view, name='create_booking'),
    path('booking/action/<int:booking_id>/', views.booking_action_view, name='booking_action'),
    path('booking/edit/<int:booking_id>/', views.booking_edit_view, name='booking_edit'),
    path('booking/cancel/<int:booking_id>/', views.booking_cancel_view, name='booking_cancel'),
    path('invoice/pay/<int:invoice_id>/', views.pay_invoice_view, name='pay_invoice'),
    path("api/students/", views.student_list, name="student-list"),
]
