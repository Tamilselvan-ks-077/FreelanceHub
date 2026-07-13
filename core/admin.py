from django.contrib import admin
from .models import Student, Profile, Skill, FreelancerSkill, Booking, Invoice

admin.site.register(Student)
admin.site.register(Profile)
admin.site.register(Skill)
admin.site.register(FreelancerSkill)
admin.site.register(Booking)
admin.site.register(Invoice)