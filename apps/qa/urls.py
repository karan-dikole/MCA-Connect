from django.urls import path
from . import views

app_name = 'qa'

urlpatterns = [
    path('', views.question_list_view, name='question_list'),
    path('ask/', views.question_create_view, name='question_create'),
    path('<slug:slug>/', views.question_detail_view, name='question_detail'),
    path('<slug:slug>/upvote/', views.question_toggle_upvote, name='question_upvote'),
    path('<slug:slug>/answer/', views.answer_create_view, name='answer_create'),
    path('answer/<int:answer_id>/upvote/', views.answer_toggle_upvote, name='answer_upvote'),
    path('answer/<int:answer_id>/accept/', views.answer_accept_view, name='answer_accept'),
]
