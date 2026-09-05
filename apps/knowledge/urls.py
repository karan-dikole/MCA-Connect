from django.urls import path
from . import views

app_name = 'knowledge'

urlpatterns = [
    path('', views.article_list_view, name='article_list'),
    path('new/', views.article_create_view, name='article_create'),
    path('roadmaps/', views.roadmaps_list_view, name='roadmaps_list'),
    path('roadmaps/<slug:slug>/', views.roadmap_detail_view, name='roadmap_detail'),
    path('category/<slug:slug>/', views.category_detail_view, name='category_detail'),
    path('<slug:slug>/', views.article_detail_view, name='article_detail'),
    path('<slug:slug>/edit/', views.article_edit_view, name='article_edit'),
    path('<slug:slug>/upvote/', views.article_toggle_upvote, name='article_upvote'),
    path('<slug:slug>/bookmark/', views.article_toggle_bookmark, name='article_bookmark'),
    path('<slug:slug>/comment/', views.add_comment_view, name='add_comment'),
]
