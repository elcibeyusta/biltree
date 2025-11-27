"""
URLs for accounts app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    verify_email,
    forgot_password,
    reset_password,
    LoginView,
    logout,
    me
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout, name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-email/', verify_email, name='verify_email'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('reset-password/', reset_password, name='reset_password'),
    path('me/', me, name='me'),
]

