from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse
import markdown

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    icon = models.CharField(max_length=50, default='📚', help_text="Emoji or Icon class")
    description = models.TextField(blank=True)
    semester = models.PositiveIntegerField(null=True, blank=True, help_text="Relevant MCA Semester (1-4)")

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.icon} {self.name}"

    def get_absolute_url(self):
        return reverse('knowledge:category_detail', kwargs={'slug': self.slug})


class Article(models.Model):
    DIFFICULTY_CHOICES = (
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='articles')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='articles')
    summary = models.TextField(max_length=500, help_text="Short teaser summarizing key takeaways")
    content = models.TextField(help_text="Write your article in Markdown syntax with code blocks, tables, etc.")
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags (e.g. recursion, b-trees, sql-tuning)")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='INTERMEDIATE')
    
    views_count = models.PositiveIntegerField(default=0)
    upvotes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='upvoted_articles', blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Article.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('knowledge:article_detail', kwargs={'slug': self.slug})

    def get_tags_list(self):
        if not self.tags:
            return []
        return [t.strip() for t in self.tags.split(',') if t.strip()]

    def estimate_read_time(self):
        words = len(self.content.split())
        minutes = max(1, round(words / 180))
        return f"{minutes} min read"

    def rendered_html(self):
        return markdown.markdown(
            self.content,
            extensions=['fenced_code', 'tables', 'codehilite', 'nl2br', 'toc']
        )


class ArticleComment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.article.title}"


class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')


class Roadmap(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    target_role = models.CharField(max_length=150, help_text="e.g. Full-Stack Developer, DevOps Engineer, Cloud Architect, Data Engineer")
    icon = models.CharField(max_length=50, default='🗺️')
    summary = models.TextField()
    content = models.TextField(help_text="Markdown formatted syllabus, milestones, and step-by-step guides")
    difficulty = models.CharField(max_length=50, default='Comprehensive')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.icon} {self.title}"

    def rendered_html(self):
        return markdown.markdown(
            self.content,
            extensions=['fenced_code', 'tables', 'codehilite', 'nl2br']
        )
