from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .db import is_database_available


@require_http_methods(["GET", "HEAD"])
def health(request):
    if is_database_available():
        return JsonResponse({"status": "ok"})
    return JsonResponse({"status": "error"}, status=503)
