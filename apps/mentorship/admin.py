from django.contrib import admin
from .models import MentorProfile, MentorshipBooking

@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'headline', 'years_of_experience', 'is_active', 'created_at')
    list_filter = ('is_active',)

@admin.register(MentorshipBooking)
class MentorshipBookingAdmin(admin.ModelAdmin):
    list_display = ('session_type', 'mentor', 'student', 'requested_date', 'status', 'created_at')
    list_filter = ('status', 'session_type')
