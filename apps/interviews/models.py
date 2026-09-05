from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse
import markdown

class Company(models.Model):
    TIER_CHOICES = (
        ('TIER1', 'Tier 1 / FAANG & Big Tech'),
        ('TIER2', 'Product & Mid-Sized Tech'),
        ('SERVICE', 'IT Consulting & Services (TCS, Infosys, Wipro, etc.)'),
        ('STARTUP', 'High-Growth Startups'),
    )

    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    logo_url = models.URLField(blank=True, help_text="Direct URL to company logo icon")
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='TIER2')
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, default='Information Technology & Software')
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_logo(self):
        if self.logo_url:
            return self.logo_url
        return f"https://ui-avatars.com/api/?name={self.name}&background=6366f1&color=fff&bold=true&size=100"


class InterviewExperience(models.Model):
    OFFER_CHOICES = (
        ('OFFERED', 'Accepted Offer 🎉'),
        ('REJECTED', 'Not Selected / Experience Shared'),
        ('WAITLISTED', 'Waitlisted / In Process'),
    )

    DIFFICULTY_CHOICES = (
        ('EASY', 'Easy (1/5)'),
        ('MEDIUM', 'Medium (3/5)'),
        ('HARD', 'Challenging (4/5)'),
        ('VERY_HARD', 'Very Tough (5/5)'),
    )

    TYPE_CHOICES = (
        ('ON_CAMPUS', 'On-Campus Placement'),
        ('OFF_CAMPUS', 'Off-Campus Drive'),
        ('REFERRAL', 'Employee Referral'),
        ('INTERNSHIP', 'Internship to PPO'),
    )

    title = models.CharField(max_length=255, help_text="e.g. SDE-1 Interview Experience at Amazon - 4 Rounds Breakdown")
    slug = models.SlugField(unique=True, max_length=255, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interview_experiences')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='experiences')
    role_applied = models.CharField(max_length=150, help_text="e.g. Associate Software Engineer, SDE Intern, Cloud Consultant")
    batch_year = models.PositiveIntegerField(help_text="Placement year e.g. 2025")
    experience_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='ON_CAMPUS')
    offer_status = models.CharField(max_length=20, choices=OFFER_CHOICES, default='OFFERED')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='MEDIUM')
    compensation_details = models.CharField(max_length=100, blank=True, help_text="Optional CTC range e.g. 10 - 14 LPA")
    rounds_count = models.PositiveIntegerField(default=3, help_text="Total number of interview rounds")
    
    # Detailed content
    summary = models.TextField(help_text="Overview of the hiring process and your preparation strategy")
    rounds_breakdown = models.TextField(help_text="Detailed Markdown breakdown of each round (Round 1: OA, Round 2: Technical DSA, Round 3: System/HR)")
    questions_asked = models.TextField(help_text="Specific DSA, OS, DBMS, or behavioral questions asked")
    tips_for_juniors = models.TextField(help_text="Key takeaways, mistakes to avoid, and prep materials recommended")

    views_count = models.PositiveIntegerField(default=0)
    upvotes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='upvoted_interviews', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.company.name}-{self.role_applied}-{self.batch_year}")
            slug = base_slug
            counter = 1
            while InterviewExperience.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.company.name} - {self.role_applied} ({self.author.username})"

    def get_absolute_url(self):
        return reverse('interviews:experience_detail', kwargs={'slug': self.slug})

    def rendered_rounds(self):
        return markdown.markdown(self.rounds_breakdown, extensions=['fenced_code', 'tables', 'nl2br'])

    def rendered_questions(self):
        return markdown.markdown(self.questions_asked, extensions=['fenced_code', 'tables', 'nl2br'])

    def rendered_tips(self):
        return markdown.markdown(self.tips_for_juniors, extensions=['fenced_code', 'tables', 'nl2br'])


class InterviewComment(models.Model):
    experience = models.ForeignKey(InterviewExperience, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
