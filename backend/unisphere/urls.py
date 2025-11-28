from django.contrib import admin
from django.urls import path, include
from utils.views import health

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),
    path("api/users/", include("users.urls")),
    path("api/societies/", include("societies.urls")),
    path("api/feed/", include("feed.urls")),
]
