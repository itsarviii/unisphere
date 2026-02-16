from django.contrib import admin
from django.urls import path, include
from utils.views import ai_assist

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("utils.urls")),       # health/ stays at root for UptimeRobot

    path("api/users/", include("users.urls")),
    path("api/societies/", include("societies.urls")),
    path("api/feed/", include("feed.urls")),
    path("api/ai-assist/", ai_assist),
]
