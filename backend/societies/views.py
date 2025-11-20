from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404

from .models import Society, Membership
from .serializers import SocietySerializer
from .permissions import IsSocietyAdminOrReadOnly


class SocietyListView(generics.ListCreateAPIView):
    queryset = Society.objects.all().order_by("-created_at")
    serializer_class = SocietySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        society = serializer.save(admin=self.request.user)
        Membership.objects.get_or_create(user=self.request.user, society=society)


class SocietyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Society.objects.all()
    serializer_class = SocietySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsSocietyAdminOrReadOnly]
    lookup_field = "slug"

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def follow_society(request, slug):
    society = get_object_or_404(Society, slug=slug)
    Membership.objects.get_or_create(user=request.user, society=society)
    return Response({"detail": "Followed"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def unfollow_society(request, slug):
    society = get_object_or_404(Society, slug=slug)
    Membership.objects.filter(user=request.user, society=society).delete()
    return Response({"detail": "Unfollowed"}, status=status.HTTP_200_OK)


class SocietyMembersView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, slug):
        society = get_object_or_404(Society, slug=slug)
        memberships = Membership.objects.filter(society=society).select_related("user")

        data = []
        for m in memberships:
            user = m.user
            data.append({
                "id": user.id,
                "name": getattr(user, "name", None) or getattr(user, "full_name", None) or user.email,
                "role": "admin" if society.admin_id == user.id else "member",
            })

        return Response(data)