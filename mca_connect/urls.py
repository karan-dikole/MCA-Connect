from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.core.urls')),
    path('accounts/', include('apps.accounts.urls')),
    path('knowledge/', include('apps.knowledge.urls')),
    path('interviews/', include('apps.interviews.urls')),
    path('projects/', include('apps.projects.urls')),
    path('qa/', include('apps.qa.urls')),
    path('mentorship/', include('apps.mentorship.urls')),
    path('ai-assistant/', include('apps.ai_assistant.urls')),
    path('api/', include('mca_connect.api_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
