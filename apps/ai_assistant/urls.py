from django.urls import path
from . import views

app_name = 'ai_assistant'

urlpatterns = [
    path('', views.ai_hub_view, name='hub'),
    path('code-explainer/', views.ai_code_explainer_view, name='code_explainer'),
    path('resume-matcher/', views.ai_resume_matcher_view, name='resume_matcher'),
    path('flashcards/', views.ai_flashcards_view, name='flashcards'),
]
