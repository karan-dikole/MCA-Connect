from django.contrib import admin
from .models import Category, Article, ArticleComment, Bookmark, Roadmap

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('icon', 'name', 'slug', 'semester')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'difficulty', 'views_count', 'is_featured', 'is_published', 'created_at')
    list_filter = ('category', 'difficulty', 'is_featured', 'is_published')
    search_fields = ('title', 'content', 'tags')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(ArticleComment)
class ArticleCommentAdmin(admin.ModelAdmin):
    list_display = ('article', 'author', 'created_at')

@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('user', 'article', 'created_at')

@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ('icon', 'title', 'target_role', 'difficulty')
    prepopulated_fields = {'slug': ('title',)}
