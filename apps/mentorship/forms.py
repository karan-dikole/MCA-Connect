from django import forms
from .models import MentorProfile, MentorshipBooking

class MentorProfileForm(forms.ModelForm):
    class Meta:
        model = MentorProfile
        fields = [
            'headline', 'expertise_areas', 'years_of_experience',
            'about', 'offers_resume_review', 'offers_mock_interview',
            'offers_career_guidance', 'offers_higher_studies', 'preferred_meeting_tool'
        ]
        widgets = {
            'headline': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Senior Backend Engineer @ Razorpay | MCA 2021'}),
            'expertise_areas': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Python, Django, System Design, DSA, AWS, Resume Critique'}),
            'years_of_experience': forms.NumberInput(attrs={'class': 'form-control'}),
            'about': forms.Textarea(attrs={'rows': 4, 'class': 'form-control', 'placeholder': 'How you guide students, your background, and tips you provide...'}),
            'preferred_meeting_tool': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Google Meet'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if 'class' not in field.widget.attrs and not isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs['class'] = 'form-control'


class MentorshipBookingForm(forms.ModelForm):
    class Meta:
        model = MentorshipBooking
        fields = ['session_type', 'requested_date', 'requested_time', 'student_notes']
        widgets = {
            'session_type': forms.Select(attrs={'class': 'form-control'}),
            'requested_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'requested_time': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Saturday 5:00 PM - 6:00 PM IST'}),
            'student_notes': forms.Textarea(attrs={'rows': 4, 'class': 'form-control', 'placeholder': 'Tell the mentor about your background, current prep status, and specific questions you need help with (or link to resume/project)...'}),
        }
