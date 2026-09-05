from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse
import markdown

class Project(models.Model):
    CATEGORY_CHOICES = (
        ('WEB', 'Web Development / Full-Stack'),
        ('AI_ML', 'Artificial Intelligence & ML'),
        ('MOBILE', 'Mobile Applications (Android / iOS / Flutter)'),
        ('CLOUD', 'Cloud & DevOps'),
        ('CYBERSEC', 'Cybersecurity & Networks'),
        ('BLOCKCHAIN', 'Blockchain & Web3'),
        ('IOT', 'Internet of Things & Embedded'),
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=220, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')
    tagline = models.CharField(max_length=255, help_text="One line elevator pitch of the project")
    description = models.TextField(help_text="Full markdown description: problem statement, architecture, features, and setup guide")
    tech_stack = models.CharField(max_length=300, help_text="Comma-separated technologies (e.g. Django, React, PostgreSQL, Docker, Redis)")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='WEB')
    
    github_url = models.URLField(blank=True, help_text="Public GitHub repository link")
    live_demo_url = models.URLField(blank=True, help_text="Live hosted demo / deployment link")
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    
    # Teammate & Collaboration Finder
    is_looking_for_teammates = models.BooleanField(default=False)
    roles_needed = models.CharField(max_length=255, blank=True, help_text="e.g. Frontend Developer (React), UI/UX Designer, ML Engineer")
    
    views_count = models.PositiveIntegerField(default=0)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_projects', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Project.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('projects:project_detail', kwargs={'slug': self.slug})

    def get_tech_list(self):
        if not self.tech_stack:
            return []
        return [t.strip() for t in self.tech_stack.split(',') if t.strip()]

    def rendered_description(self):
        return markdown.markdown(
            self.description,
            extensions=['fenced_code', 'tables', 'codehilite', 'nl2br']
        )


class ProjectApplication(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('ACCEPTED', 'Accepted to Team 🎉'),
        ('DECLINED', 'Declined'),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_applications')
    role_applied = models.CharField(max_length=150, help_text="Role you want to contribute as")
    pitch_message = models.TextField(help_text="Why are you interested and what relevant skills/experience do you bring?")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('project', 'applicant')

    def __str__(self):
        return f"{self.applicant.username} -> {self.project.title} ({self.role_applied})"


class ProjectComment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
