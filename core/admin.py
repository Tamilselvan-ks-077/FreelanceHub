from django.contrib import admin
from .models import (
    Student, Profile, Skill, FreelancerSkill, Booking, Invoice,
    Review, Portfolio, Notification, Message, Favourite, Payment, ActivityLog
)

admin.site.register(Student)
admin.site.register(Profile)
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