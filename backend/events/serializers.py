from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    society_name = serializers.CharField(source="society.name", read_only=True)
    society_slug = serializers.CharField(source="society.slug", read_only=True)
    attendee_count = serializers.SerializerMethodField()
    is_attending = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "event_date", "location",
            "created_at", "society", "society_name", "society_slug",
            "created_by", "attendee_count", "is_attending",
        ]
        read_only_fields = ["society", "society_name", "society_slug", "created_at", "created_by"]

    def get_attendee_count(self, obj):
        return obj.attendees.count()

    def get_is_attending(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.attendees.filter(user=request.user).exists()
