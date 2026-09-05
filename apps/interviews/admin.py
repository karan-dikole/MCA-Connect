from django.contrib import admin
from .models import Company, InterviewExperience, InterviewComment

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'tier', 'industry')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(InterviewExperience)
class InterviewExperienceAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'company', 'role_applied', 'batch_year', 'offer_status', 'difficulty', 'created_at')
    list_filter = ('company', 'offer_status', 'difficulty', 'experience_type', 'batch_year')
    search_fields = ('title', 'role_applied', 'summary', 'questions_asked')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(InterviewComment)
class InterviewCommentAdmin(admin.ModelAdmin):
    list_display = ('experience', 'author', 'created_at')
