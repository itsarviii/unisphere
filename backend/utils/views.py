from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .db import is_database_available
from .ai import generate_content_suggestion


@require_http_methods(["GET", "HEAD"])
def health(request):
    if is_database_available():
        return JsonResponse({"status": "ok"})
    return JsonResponse({"status": "error"}, status=503)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_assist(request):
    content_type = request.data.get("content_type", "post")
    society_name = request.data.get("society_name", "")
    university = request.data.get("university", "")
    draft = request.data.get("draft", "")

    if not society_name:
        return Response({"error": "society_name is required"}, status=400)

    suggestion = generate_content_suggestion(content_type, society_name, university, draft)
    if suggestion is None:
        return Response({"error": "AI assist unavailable"}, status=503)

    return Response({"suggestion": suggestion})
