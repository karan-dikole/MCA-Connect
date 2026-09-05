from django import forms
from .models import Article, ArticleComment

class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ['title', 'category', 'difficulty', 'summary', 'content', 'tags']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Deep Dive into Distributed Transactions & 2PC'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'difficulty': forms.Select(attrs={'class': 'form-control'}),
            'summary': forms.Textarea(attrs={'rows': 2, 'class': 'form-control', 'placeholder': 'A concise 2-line overview of the topic...'}),
            'content': forms.Textarea(attrs={'rows': 15, 'class': 'form-control code-editor', 'placeholder': 'Write your content in Markdown... Use ```python ... ``` for code snippets.'}),
            'tags': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. database, acid, distributed-systems, transactions'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-control'


class ArticleCommentForm(forms.ModelForm):
    class Meta:
        model = ArticleComment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'class': 'form-control', 'placeholder': 'Share your insights or ask a clarifying question...'}),
        }
