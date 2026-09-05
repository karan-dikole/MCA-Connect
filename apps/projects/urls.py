from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    path('', views.project_list_view, name='project_list'),
    path('new/', views.project_create_view, name='project_create'),
    path('<slug:slug>/', views.project_detail_view, name='project_detail'),
    path('<slug:slug>/edit/', views.project_edit_view, name='project_edit'),
    path('<slug:slug>/like/', views.project_toggle_like, name='project_like'),
    path('<slug:slug>/apply/', views.project_apply_teammate, name='project_apply'),
    path('application/<int:app_id>/<str:status>/', views.project_application_status_update, name='application_status'),
    path('<slug:slug>/comment/', views.project_add_comment, name='add_comment'),
]
