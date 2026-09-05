from django import forms
from .models import Project, ProjectApplication, ProjectComment

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = [
            'title', 'tagline', 'category', 'tech_stack',
            'description', 'github_url', 'live_demo_url', 'image',
            'is_looking_for_teammates', 'roles_needed'
        ]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. AlgoVisualizer: Interactive DSA Visual Platform'}),
            'tagline': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Real-time visual representation of sorting, trees, and graph algorithms'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'tech_stack': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Django, React, Canvas API, TailwindCSS, WebSocket'}),
            'description': forms.Textarea(attrs={'rows': 10, 'class': 'form-control code-editor', 'placeholder': 'Describe your project, architecture, features, and setup instructions in Markdown...'}),
            'github_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://github.com/username/project'}),
            'live_demo_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://myproject.vercel.app'}),
            'roles_needed': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Frontend Specialist, UI/UX Designer, Backend Tester'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if 'class' not in field.widget.attrs and not isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs['class'] = 'form-control'


class ProjectApplicationForm(forms.ModelForm):
    class Meta:
        model = ProjectApplication
        fields = ['role_applied', 'pitch_message']
        widgets = {
            'role_applied': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Frontend Developer'}),
            'pitch_message': forms.Textarea(attrs={'rows': 4, 'class': 'form-control', 'placeholder': 'Tell the creator why you want to join this project and how you can contribute...'}),
        }


class ProjectCommentForm(forms.ModelForm):
    class Meta:
        model = ProjectComment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'class': 'form-control', 'placeholder': 'Leave feedback, suggestions, or ask about the tech stack...'}),
        }
