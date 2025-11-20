from rest_framework import serializers
from .models import Society, Membership


class SocietySerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()

    class Meta:
        model = Society
        fields = [
            "id",
            "name",
            "slug",
            "university",
            "description",
            "admin",
            "created_at",
            "is_admin",
            "is_member",
            "followers_count",
        ]
        read_only_fields = ["slug", "admin", "created_at", "followers_count"]

    def validate(self, data):
        name = data.get("name")
        university = data.get("university")

        if Society.objects.filter(name__iexact=name, university__iexact=university).exists():
            raise serializers.ValidationError({
                "name": ["A society with this name already exists in this university."]
            })

        return data

    def get_is_admin(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.admin == request.user

    def get_is_member(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Membership.objects.filter(user=request.user, society=obj).exists()

    def get_followers_count(self, obj):
        return Membership.objects.filter(society=obj).count()