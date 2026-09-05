from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse
import markdown

class Question(models.Model):
    LANG_CHOICES = (
        ('python', 'Python'),
        ('java', 'Java'),
        ('cpp', 'C / C++'),
        ('javascript', 'JavaScript / TypeScript'),
        ('sql', 'SQL / Database'),
        ('html_css', 'HTML / CSS'),
        ('other', 'General / Other'),
    )

    title = models.CharField(max_length=255, help_text="What is your programming or MCA academic question? Be specific.")
    slug = models.SlugField(unique=True, max_length=255, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='questions')
    content = models.TextField(help_text="Provide context, details of what you tried, and expected vs actual behavior (Markdown enabled)")
    code_snippet = models.TextField(blank=True, help_text="Optional code snippet reproducing the problem")
    language = models.CharField(max_length=30, choices=LANG_CHOICES, default='python')
    tags = models.CharField(max_length=255, help_text="Comma-separated tags (e.g. django, orm, foreignkey, sqlite)")
    
    bounty_points = models.PositiveIntegerField(default=0, help_text="Optional bounty points offered for the accepted answer")
    is_solved = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    upvotes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='upvoted_questions', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Question.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('qa:question_detail', kwargs={'slug': self.slug})

    def get_tags_list(self):
        if not self.tags:
            return []
        return [t.strip() for t in self.tags.split(',') if t.strip()]

    def rendered_content(self):
        return markdown.markdown(self.content, extensions=['fenced_code', 'tables', 'nl2br'])


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField(help_text="Your step-by-step solution, explanation, and code (Markdown enabled)")
    code_snippet = models.TextField(blank=True)
    is_accepted = models.BooleanField(default=False)
    upvotes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='upvoted_answers', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_accepted', '-created_at']

    def __str__(self):
        return f"Answer by {self.author.username} on {self.question.title}"

    def rendered_content(self):
        return markdown.markdown(self.content, extensions=['fenced_code', 'tables', 'nl2br'])
