from django.urls import path, include
from .views import RegisterView, MeView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("sign-up/", RegisterView.as_view(), name="sign-up"),
    path("sign-in/", TokenObtainPairView.as_view(), name="sign-in"),
    path("me/", MeView.as_view(), name="me"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
