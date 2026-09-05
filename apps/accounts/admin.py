from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Badge, UserBadge, ActivityLog

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'batch_year', 'reputation_points', 'is_mentor_available', 'is_verified_alumni')
    list_filter = ('role', 'is_mentor_available', 'is_verified_alumni', 'batch_year')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('MCA Connect Profile', {
            'fields': (
                'role', 'headline', 'bio', 'avatar', 'college', 'batch_year', 'semester',
                'company', 'designation', 'github_url', 'linkedin_url', 'portfolio_url',
                'skills', 'areas_of_interest', 'reputation_points', 'is_mentor_available',
                'is_verified_alumni'
            ),
        }),
    )

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('icon', 'name', 'points_required')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'awarded_at')

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'title', 'created_at')
    list_filter = ('activity_type', 'created_at')
