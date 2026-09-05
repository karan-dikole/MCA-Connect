from django.urls import path
from . import views

app_name = 'mentorship'

urlpatterns = [
    path('', views.mentor_list_view, name='mentor_list'),
    path('setup/', views.mentor_profile_setup_view, name='mentor_setup'),
    path('book/<int:mentor_id>/', views.book_mentor_session_view, name='book_session'),
    path('sessions/', views.my_sessions_view, name='my_sessions'),
    path('sessions/<int:booking_id>/<str:status>/', views.update_session_status, name='update_status'),
]
