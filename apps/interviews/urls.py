from django.urls import path
from . import views

app_name = 'interviews'

urlpatterns = [
    path('', views.experience_list_view, name='experience_list'),
    path('share/', views.experience_create_view, name='experience_create'),
    path('companies/', views.company_directory_view, name='company_directory'),
    path('<slug:slug>/', views.experience_detail_view, name='experience_detail'),
    path('<slug:slug>/upvote/', views.experience_toggle_upvote, name='experience_upvote'),
    path('<slug:slug>/comment/', views.experience_add_comment, name='add_comment'),
]
