from django.urls import path
from .views import health, ai_assist

urlpatterns = [
    path("health/", health),
    path("ai-assist/", ai_assist),
]
