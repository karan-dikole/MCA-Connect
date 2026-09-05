from django.contrib import admin
from .models import Question, Answer

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'language', 'is_solved', 'bounty_points', 'views_count', 'created_at')
    list_filter = ('is_solved', 'language')
    search_fields = ('title', 'content', 'tags')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'author', 'is_accepted', 'created_at')
    list_filter = ('is_accepted',)
