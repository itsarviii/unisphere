from django.db import models
from django.conf import settings
from societies.models import Society


class Post(models.Model):
    society = models.ForeignKey(Society, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.society.name} - {self.content[:30]}"
