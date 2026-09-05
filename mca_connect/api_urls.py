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
    path('knowledge/articles/<int:pk>/', api_views.api_article_detail_actions, name='api_article_detail_actions'),
    path('knowledge/roadmaps/', api_views.api_roadmaps_list, name='api_roadmaps'),

    # Interviews (List, Share, Upvote, Delete)
    path('interviews/', api_views.api_interviews_list, name='api_interviews'),
    path('interviews/<int:pk>/', api_views.api_interview_detail_actions, name='api_interview_detail_actions'),
    path('interviews/<int:pk>/upvote/', api_views.api_interview_detail_actions, name='api_interview_upvote'),

    # Projects (List, Showcase, Like, Delete)
    path('projects/', api_views.api_projects_list, name='api_projects'),
    path('projects/<int:pk>/', api_views.api_project_detail_actions, name='api_project_detail_actions'),

    # Mentorship (Directory, Booking, My Sessions, Session Actions, Remove Profile)
    path('mentorship/mentors/', api_views.api_mentors_list, name='api_mentors'),
    path('mentorship/profile/remove/', api_views.api_mentorship_remove_mentor_profile, name='api_mentorship_remove_mentor_profile'),
    path('mentorship/book/', api_views.api_mentorship_book_session, name='api_mentorship_book'),
    path('mentorship/my-sessions/', api_views.api_mentorship_my_sessions, name='api_mentorship_my_sessions'),
    path('mentorship/sessions/<int:pk>/', api_views.api_mentorship_session_actions, name='api_mentorship_session_actions'),
    path('mentorship/sessions/<int:pk>/update-status/', api_views.api_mentorship_session_actions, name='api_mentorship_session_update_status'),

    # Q&A (List, Ask, Answer, Upvote, Delete Question, Delete Answer)
    path('qa/questions/', api_views.api_qa_list, name='api_qa'),
    path('qa/questions/<int:pk>/', api_views.api_question_detail_actions, name='api_question_detail_actions'),
    path('qa/answers/<int:pk>/', api_views.api_answer_delete, name='api_answer_delete'),
]
