from django import forms
from .models import InterviewExperience, InterviewComment, Company

class InterviewExperienceForm(forms.ModelForm):
    company_name = forms.CharField(
        max_length=150,
        required=True,
        help_text="Company Name (e.g. Amazon, Google, Infosys, Zoho)",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Microsoft'})
    )

    class Meta:
        model = InterviewExperience
        fields = [
            'title', 'role_applied', 'batch_year', 'experience_type',
            'offer_status', 'difficulty', 'compensation_details',
            'rounds_count', 'summary', 'rounds_breakdown', 'questions_asked', 'tips_for_juniors'
        ]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Microsoft SDE-1 On-Campus Placement Experience'}),
            'role_applied': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. SDE 1 / Software Engineer'}),
            'batch_year': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '2025'}),
            'experience_type': forms.Select(attrs={'class': 'form-control'}),
            'offer_status': forms.Select(attrs={'class': 'form-control'}),
            'difficulty': forms.Select(attrs={'class': 'form-control'}),
            'compensation_details': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 14 - 18 LPA (Optional)'}),
            'rounds_count': forms.NumberInput(attrs={'class': 'form-control', 'value': 3}),
            'summary': forms.Textarea(attrs={'rows': 3, 'class': 'form-control', 'placeholder': 'Overview of the application process, timeline, and resume shortlist criteria...'}),
            'rounds_breakdown': forms.Textarea(attrs={'rows': 8, 'class': 'form-control code-editor', 'placeholder': '### Round 1: Online Assessment (90 mins)\n- 2 DSA Coding Questions (Dynamic Programming & Graph)\n- 20 MCQs on OS & DBMS\n\n### Round 2: Technical Interview 1\n- Discussion on MCA Capstone Project...\n- Live coding: Invert binary tree & LRU Cache implementation'}),
            'questions_asked': forms.Textarea(attrs={'rows': 6, 'class': 'form-control', 'placeholder': 'List key technical/behavioral questions asked...'}),
            'tips_for_juniors': forms.Textarea(attrs={'rows': 4, 'class': 'form-control', 'placeholder': 'What would you recommend to 1st/2nd year MCA students preparing for this role?'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk and self.instance.company:
            self.fields['company_name'].initial = self.instance.company.name
        for field in self.fields.values():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-control'


class InterviewCommentForm(forms.ModelForm):
    class Meta:
        model = InterviewComment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'class': 'form-control', 'placeholder': 'Ask a question or congratulate the author...'}),
        }
