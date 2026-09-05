from django.contrib import admin
from .models import Project, ProjectApplication, ProjectComment

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'is_looking_for_teammates', 'views_count', 'created_at')
    list_filter = ('category', 'is_looking_for_teammates')
    search_fields = ('title', 'tech_stack', 'description')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(ProjectApplication)
class ProjectApplicationAdmin(admin.ModelAdmin):
    list_display = ('project', 'applicant', 'role_applied', 'status', 'created_at')
    list_filter = ('status',)

@admin.register(ProjectComment)
class ProjectCommentAdmin(admin.ModelAdmin):
    list_display = ('project', 'author', 'created_at')
