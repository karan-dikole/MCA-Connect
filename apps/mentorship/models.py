from django.db import models
from django.conf import settings
from django.urls import reverse

class MentorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentor_profile')
    headline = models.CharField(max_length=200, help_text="e.g. Senior SDE @ Microsoft | Ex-Amazon | Mentored 50+ MCA grads")
    expertise_areas = models.CharField(max_length=300, help_text="e.g. System Design, DSA, Full-Stack, Cloud Architecture, Resume Building")
    years_of_experience = models.PositiveIntegerField(default=3)
    about = models.TextField(help_text="How you can help students and what they can expect in a 1-on-1 session")
    
    offers_resume_review = models.BooleanField(default=True)
    offers_mock_interview = models.BooleanField(default=True)
    offers_career_guidance = models.BooleanField(default=True)
    offers_higher_studies = models.BooleanField(default=False)
    
    preferred_meeting_tool = models.CharField(max_length=100, default='Google Meet')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Mentor: {self.user.get_full_name() or self.user.username} ({self.headline})"

    def get_expertise_list(self):
        if not self.expertise_areas:
            return []
        return [e.strip() for e in self.expertise_areas.split(',') if e.strip()]


class MentorshipBooking(models.Model):
    SESSION_TYPES = (
        ('RESUME', 'Resume Review & Profile Optimization 📄'),
        ('MOCK_INTERVIEW', 'Mock Technical / HR Interview 🎯'),
        ('CAREER', 'Career Roadmap & Transition Advice 🚀'),
        ('HIGHER_STUDIES', 'Higher Studies (GATE / Ph.D / MS) 🎓'),
        ('PROJECT', 'Project Architecture & Code Review 💻'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending Mentor Approval ⏳'),
        ('CONFIRMED', 'Confirmed & Scheduled ✅'),
        ('COMPLETED', 'Completed 🌟'),
        ('CANCELLED', 'Cancelled ❌'),
    )

    mentor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentor_sessions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_sessions')
    session_type = models.CharField(max_length=30, choices=SESSION_TYPES, default='MOCK_INTERVIEW')
    
    requested_date = models.DateField(help_text="Desired date for the session")
    requested_time = models.CharField(max_length=50, help_text="e.g. 6:00 PM - 7:00 PM IST")
    student_notes = models.TextField(help_text="Provide context, your target company/role, or resume link")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    meeting_link = models.URLField(blank=True, help_text="Meeting URL (Google Meet / Zoom) set by mentor upon confirmation")
    mentor_notes = models.TextField(blank=True, help_text="Private or shared notes / feedback after session")
    
    rating = models.PositiveIntegerField(null=True, blank=True, help_text="Rating 1-5")
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_session_type_display()} - {self.student.username} with {self.mentor.username}"
