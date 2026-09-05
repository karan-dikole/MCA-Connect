from django.urls import path
from . import api_views

urlpatterns = [
    path('stats/', api_views.api_global_stats, name='api_stats'),
    
    # Authentication
    path('auth/me/', api_views.api_auth_me, name='api_auth_me'),
    path('auth/login/', api_views.api_auth_login, name='api_auth_login'),
    path('auth/register/', api_views.api_auth_register, name='api_auth_register'),
    path('auth/logout/', api_views.api_auth_logout, name='api_auth_logout'),

    # AI Assistant
    path('ai/resume-matcher/', api_views.api_resume_matcher, name='api_resume_matcher'),
    path('ai/code-explainer/', api_views.api_code_explainer, name='api_code_explainer'),
    path('ai/flashcards/', api_views.api_flashcards, name='api_flashcards'),

    # Knowledge
    path('knowledge/articles/', api_views.api_articles_list, name='api_articles'),
    path('knowledge/roadmaps/', api_views.api_roadmaps_list, name='api_roadmaps'),

    # Interviews
    path('interviews/', api_views.api_interviews_list, name='api_interviews'),

    # Projects
    path('projects/', api_views.api_projects_list, name='api_projects'),

    # Mentorship
    path('mentorship/mentors/', api_views.api_mentors_list, name='api_mentors'),

    # Q&A
    path('qa/questions/', api_views.api_qa_list, name='api_qa'),
]
