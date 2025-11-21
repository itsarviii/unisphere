from rest_framework.permissions import BasePermission, SAFE_METHODS
from societies.models import Society


class IsSocietyAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        slug = view.kwargs.get("slug")
        if not slug:
            return False

        try:
            society = Society.objects.get(slug=slug)
        except Society.DoesNotExist:
            return False

        return society.admin == request.user