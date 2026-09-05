from django.db import models
from django.contrib.auth.models import AbstractUser
from django.urls import reverse

class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'MCA Student'),
        ('ALUMNI', 'Alumni / Industry Pro'),
        ('FACULTY', 'Faculty / Mentor'),
        ('ADMIN', 'Platform Admin'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    headline = models.CharField(max_length=255, blank=True, help_text="e.g. MCA 2025 | Cloud & Backend Enthusiast | Ex-Intern @ TCS")
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    college = models.CharField(max_length=255, default='MCA Institute of Technology')
    batch_year = models.PositiveIntegerField(blank=True, null=True, help_text="Graduation batch year, e.g. 2025")
    semester = models.PositiveIntegerField(blank=True, null=True, help_text="Current Semester (1-4 or 1-6)")
    
    # Professional / Alumni fields
    company = models.CharField(max_length=150, blank=True, help_text="Current Company / Organization")
    designation = models.CharField(max_length=150, blank=True, help_text="Current Designation (e.g. SDE-2)")
    
    # Social & Portfolio links
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    
    # Skills & Interests
    skills = models.CharField(max_length=500, blank=True, help_text="Comma-separated skills (e.g. Python, Django, React, Docker)")
    areas_of_interest = models.CharField(max_length=500, blank=True, help_text="Comma-separated interests (e.g. AI/ML, Cloud, Web Dev)")
    
    # Reputation & Gamification
    reputation_points = models.IntegerField(default=50)
    is_mentor_available = models.BooleanField(default=False)
    is_verified_alumni = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    def get_skills_list(self):
        if not self.skills:
            return []
        return [s.strip() for s in self.skills.split(',') if s.strip()]

    def get_interests_list(self):
        if not self.areas_of_interest:
            return []
        return [i.strip() for i in self.areas_of_interest.split(',') if i.strip()]

    def add_reputation(self, points):
        self.reputation_points += points
        self.save(update_fields=['reputation_points'])
        self.check_and_award_badges()

    def check_and_award_badges(self):
        badges = Badge.objects.filter(points_required__lte=self.reputation_points)
        for b in badges:
            UserBadge.objects.get_or_create(user=self, badge=b)

    def get_avatar_url(self):
        if self.avatar and hasattr(self.avatar, 'url'):
            return self.avatar.url
        # Fallback nice ui-avatar placeholder
        initials = (self.first_name[:1] + self.last_name[:1]) if (self.first_name and self.last_name) else self.username[:2].upper()
        return f"https://ui-avatars.com/api/?name={initials}&background=4f46e5&color=fff&bold=true&size=128"


class Badge(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, help_text="Emoji or Icon class, e.g. 🏆, 🚀, 💡, 🛡️")
    description = models.TextField()
    points_required = models.IntegerField(default=100)

    def __str__(self):
        return f"{self.icon} {self.name} ({self.points_required} pts)"


class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')

    def __str__(self):
        return f"{self.user.username} earned {self.badge.name}"


class ActivityLog(models.Model):
    ACTIVITY_TYPES = (
        ('ARTICLE', 'Published Article'),
        ('EXPERIENCE', 'Shared Interview Experience'),
        ('PROJECT', 'Showcased Project'),
        ('ANSWER', 'Answered Question'),
        ('MENTORSHIP', 'Mentorship Session'),
        ('BADGE', 'Earned Badge'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    title = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"
