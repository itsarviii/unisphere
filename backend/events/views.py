from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Event, EventAttendee
from .serializers import EventSerializer
from societies.models import Society
from utils.embeddings import generate_embedding


class SocietyEventsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        events = Event.objects.filter(
            society__slug=slug, event_date__gte=timezone.now()
        ).order_by("event_date")
        return Response(EventSerializer(events, many=True, context={"request": request}).data)

    def post(self, request, slug):
        society = get_object_or_404(Society, slug=slug)
        if society.admin != request.user:
            return Response({"detail": "Only the society admin can create events."}, status=status.HTTP_403_FORBIDDEN)

        serializer = EventSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        event = serializer.save(society=society, created_by=request.user)
        text = f"{event.title} {event.description} {event.location}"
        event.embedding = generate_embedding(text)
        event.save(update_fields=["embedding"])
        return Response(EventSerializer(event, context={"request": request}).data, status=status.HTTP_201_CREATED)


class AllEventsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        events = Event.objects.select_related("society").filter(
            event_date__gte=timezone.now()
        ).order_by("event_date")
        return Response(EventSerializer(events, many=True, context={"request": request}).data)


class EventRSVPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)
        EventAttendee.objects.get_or_create(event=event, user=request.user)
        return Response({"attendee_count": event.attendees.count(), "is_attending": True})

    def delete(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)
        EventAttendee.objects.filter(event=event, user=request.user).delete()
        return Response({"attendee_count": event.attendees.count(), "is_attending": False})
