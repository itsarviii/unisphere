from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, OuterRef, Subquery
from datetime import timedelta

from posts.models import Post, PostLike, Comment
from events.models import Event, EventAttendee
from societies.models import Membership
from utils.embeddings import generate_embedding


def _cosine_similarity(a, b):
    if not a or not b:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = sum(x * x for x in a) ** 0.5
    mag_b = sum(x * x for x in b) ** 0.5
    if not mag_a or not mag_b:
        return 0.0
    return dot / (mag_a * mag_b)


class FeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        cutoff = now - timedelta(days=30)

        interests = [i.strip().lower() for i in (user.interests or "").split(",") if i.strip()]
        followed_ids = set(Membership.objects.filter(user=user).values_list("society_id", flat=True))
        liked_post_ids = set(user.postlike_set.values_list("post_id", flat=True))
        attending_event_ids = set(user.eventattendee_set.values_list("event_id", flat=True))

        interest_text = ", ".join(interests) if interests else ""
        user_embedding = generate_embedding(interest_text) if interest_text else None

        likes_sq = PostLike.objects.filter(post=OuterRef("pk")).values("post").annotate(c=Count("pk")).values("c")
        comments_sq = Comment.objects.filter(post=OuterRef("pk")).values("post").annotate(c=Count("pk")).values("c")
        attendees_sq = EventAttendee.objects.filter(event=OuterRef("pk")).values("event").annotate(c=Count("pk")).values("c")

        posts = (
            Post.objects
            .select_related("society", "author")
            .annotate(likes_count=Subquery(likes_sq), comments_count=Subquery(comments_sq))
            .filter(created_at__gte=cutoff)
            .order_by("-created_at")[:200]
        )

        events = (
            Event.objects
            .select_related("society")
            .annotate(attendee_count=Subquery(attendees_sq))
            .filter(event_date__gte=now)
            .order_by("event_date")[:100]
        )

        feed_items = []

        for post in posts:
            score = 0
            explanation = None

            if post.society_id in followed_ids:
                score += 5
                explanation = "From a society you follow"

            if user_embedding and post.embedding:
                sim = _cosine_similarity(list(user_embedding), list(post.embedding))
                score += sim * 8
                if sim > 0.6 and not explanation:
                    explanation = "Matches your interests"
            elif interests:
                content_lower = post.content.lower()
                for interest in interests:
                    if interest in content_lower:
                        score += 3
                        if not explanation:
                            explanation = f"Matches your interest in {interest.title()}"
                        break

            age_hours = (now - post.created_at).total_seconds() / 3600
            score += max(0, 10 - age_hours)

            feed_items.append({
                "type": "post",
                "id": post.id,
                "society_name": post.society.name,
                "society_slug": post.society.slug,
                "university": post.society.university,
                "content": post.content,
                "created_at": post.created_at,
                "explanation": explanation,
                "likes_count": post.likes_count,
                "is_liked": post.id in liked_post_ids,
                "comments_count": post.comments_count,
                "score": score,
            })

        for event in events:
            score = 0
            explanation = None

            if event.society_id in followed_ids:
                score += 5
                explanation = "From a society you follow"

            if user_embedding and event.embedding:
                sim = _cosine_similarity(list(user_embedding), list(event.embedding))
                score += sim * 8
                if sim > 0.6 and not explanation:
                    explanation = "Matches your interests"
            elif interests:
                text = f"{event.title} {event.description}".lower()
                for interest in interests:
                    if interest in text:
                        score += 3
                        if not explanation:
                            explanation = f"Matches your interest in {interest.title()}"
                        break

            days_until = (event.event_date - now).days
            score += max(0, 10 - abs(days_until))

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
                "explanation": explanation,
                "attendee_count": event.attendee_count,
                "is_attending": event.id in attending_event_ids,
                "score": score,
            })

        feed_items.sort(key=lambda x: x["score"], reverse=True)
        for item in feed_items:
            item.pop("score", None)

        return Response(feed_items[:50])
