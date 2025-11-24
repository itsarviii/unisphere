from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from posts.models import Post
from events.models import Event
from societies.models import Membership


class FeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        cutoff = now - timedelta(days=30)

        posts = (
            Post.objects
            .select_related("society", "author")
            .filter(created_at__gte=cutoff)
            .order_by("-created_at")[:50]
        )

        events = (
            Event.objects
            .select_related("society")
            .filter(event_date__gte=now)
            .order_by("event_date")[:20]
        )

        feed_items = []

        for post in posts:
            feed_items.append({
                "type": "post",
                "id": post.id,
                "society_name": post.society.name,
                "society_slug": post.society.slug,
                "university": post.society.university,
                "content": post.content,
                "created_at": post.created_at,
                "likes_count": 0,
                "is_liked": False,
                "comments_count": 0,
            })

        for event in events:
            feed_items.append({
                "type": "event",
                "id": event.id,
                "society_name": event.society.name,
                "society_slug": event.society.slug,
                "university": event.society.university,
                "title": event.title,
                "description": event.description,
                "event_date": event.event_date,
                "location": event.location,
                "created_at": event.created_at,
                "attendee_count": 0,
                "is_attending": False,
            })

        feed_items.sort(key=lambda x: x["created_at"], reverse=True)
        return Response(feed_items[:50])
