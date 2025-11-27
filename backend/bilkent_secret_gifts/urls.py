"""
URL configuration for bilkent_secret_gifts project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/profile/', include('profiles.urls')),
    path('api/event/', include('content.urls')),
    path('api/matching/', include('matching.urls')),
    path('api/meeting/', include('meetings.urls')),
    path('api/admin/', include('adminpanel.urls')),
    path('api/public/', include('content.urls_public')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

