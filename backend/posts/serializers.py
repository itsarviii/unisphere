from rest_framework import serializers
from .models import Post, Comment


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "content", "created_at", "author_name"]

    def get_author_name(self, obj):
        return obj.author.fullname or obj.author.email.split("@")[0]


class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "content", "created_at", "author_name", "likes_count", "is_liked", "comments_count"]

    def get_author_name(self, obj):
        return obj.author.fullname or obj.author.email.split("@")[0]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()

    def get_comments_count(self, obj):
        return obj.comments.count()
