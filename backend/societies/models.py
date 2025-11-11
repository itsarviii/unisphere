from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Society(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    university = models.CharField(max_length=255)
    description = models.TextField()

    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="admin_societies"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # 🚨 This enforces: same name + same university = NOT allowed
        unique_together = ("name", "university")

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            # Ensure slug uniqueness even if same name exists in another uni
            while Society.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.university})"

class Membership(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="memberships"
    )

    society = models.ForeignKey(
        Society,
        on_delete=models.CASCADE,
        related_name="members"
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "society")

    def __str__(self):
        return f"{self.user.username} -> {self.society.name}"
