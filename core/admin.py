from django.contrib import admin
from .models import (
    Student, Profile, Skill, FreelancerSkill, Booking, Invoice,
    Review, Portfolio, Notification, Message, Favourite, Payment, ActivityLog
)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'is_verified', 'hourly_rate', 'location', 'availability')
    list_filter = ('role', 'is_verified', 'availability')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'title')
    list_editable = ('is_verified',)
admin.site.register(Skill)
admin.site.register(FreelancerSkill)
admin.site.register(Booking)
admin.site.register(Invoice)
admin.site.register(Review)
admin.site.register(Portfolio)
admin.site.register(Notification)
admin.site.register(Message)
admin.site.register(Favourite)
admin.site.register(Payment)
admin.site.register(ActivityLog)