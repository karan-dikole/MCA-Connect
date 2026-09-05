from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User

class CustomUserCreationForm(UserCreationForm):
    role = forms.ChoiceField(
        choices=User.ROLE_CHOICES,
        required=True,
        widget=forms.Select(attrs={'class': 'form-control select-custom'})
    )
    first_name = forms.CharField(
        max_length=50, required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Rahul'})
    )
    last_name = forms.CharField(
        max_length=50, required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Sharma'})
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'rahul@example.com'})
    )
    batch_year = forms.IntegerField(
        required=False,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 2025'})
    )

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'role', 'batch_year')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-control'


class UserProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'headline', 'bio', 'avatar',
            'college', 'batch_year', 'semester', 'company', 'designation',
            'github_url', 'linkedin_url', 'portfolio_url', 'skills',
            'areas_of_interest', 'is_mentor_available'
        ]
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4, 'class': 'form-control', 'placeholder': 'Tell the MCA Connect community about yourself...'}),
            'headline': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. MCA 2025 | Cloud & Backend Enthusiast'}),
            'skills': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Python, Django, React, Docker, AWS, PostgreSQL'}),
            'areas_of_interest': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Web Dev, System Design, AI/ML, Cloud Computing'}),
            'github_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://github.com/yourusername'}),
            'linkedin_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://linkedin.com/in/yourusername'}),
            'portfolio_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://yourportfolio.dev'}),
            'college': forms.TextInput(attrs={'class': 'form-control'}),
            'company': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Google, Microsoft, TCS, etc.'}),
            'designation': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Software Engineer, SDE Intern'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-control'
