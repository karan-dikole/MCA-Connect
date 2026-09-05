from django import forms
from .models import Question, Answer

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['title', 'content', 'code_snippet', 'language', 'tags', 'bounty_points']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. How to implement JWT authentication with custom user model in Django?'}),
            'content': forms.Textarea(attrs={'rows': 6, 'class': 'form-control code-editor', 'placeholder': 'Describe your issue in detail. What did you try? What error messages did you see?'}),
            'code_snippet': forms.Textarea(attrs={'rows': 6, 'class': 'form-control font-monospace', 'placeholder': '# Paste relevant code / traceback snippet here...'}),
            'language': forms.Select(attrs={'class': 'form-control'}),
            'tags': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. django, python, jwt, authentication'}),
            'bounty_points': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0', 'min': 0, 'max': 100}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-control'


class AnswerForm(forms.ModelForm):
    class Meta:
        model = Answer
        fields = ['content', 'code_snippet']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 6, 'class': 'form-control code-editor', 'placeholder': 'Write your answer in Markdown with explanations and code...'}),
            'code_snippet': forms.Textarea(attrs={'rows': 5, 'class': 'form-control font-monospace', 'placeholder': '# Optional formatted code solution...'}),
        }
