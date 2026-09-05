from django.urls import path
from django.contrib.auth import logout
from django.shortcuts import redirect
from . import views

app_name = 'accounts'

def custom_logout_view(request):
    logout(request)
    return redirect('core:home')

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', custom_logout_view, name='logout'),
    path('profile/edit/', views.edit_profile_view, name='edit_profile'),
    path('profile/<str:username>/', views.profile_detail_view, name='profile'),
    path('leaderboard/', views.leaderboard_view, name='leaderboard'),
    path('alumni/', views.alumni_directory_view, name='alumni_directory'),
]
