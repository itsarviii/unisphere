from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404

from .models import Post, PostLike, Comment
from .serializers import PostSerializer, CommentSerializer
from societies.models import Society
from utils.embeddings import generate_embedding


class SocietyPostsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        posts = Post.objects.filter(society__slug=slug).order_by("-created_at")
        return Response(PostSerializer(posts, many=True, context={"request": request}).data)

    def post(self, request, slug):
        society = get_object_or_404(Society, slug=slug)
        if society.admin != request.user:
            return Response({"detail": "Only the society admin can post."}, status=status.HTTP_403_FORBIDDEN)

        serializer = PostSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        content = serializer.validated_data["content"]
        post = Post.objects.create(
            society=society,
            author=request.user,
            content=content,
            embedding=generate_embedding(content),
        )
        return Response(PostSerializer(post, context={"request": request}).data, status=status.HTTP_201_CREATED)


class PostLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug, post_id):
        post = get_object_or_404(Post, id=post_id, society__slug=slug)
        PostLike.objects.get_or_create(post=post, user=request.user)
        return Response({"likes_count": post.likes.count(), "is_liked": True})

    def delete(self, request, slug, post_id):
        post = get_object_or_404(Post, id=post_id, society__slug=slug)
        PostLike.objects.filter(post=post, user=request.user).delete()
        return Response({"likes_count": post.likes.count(), "is_liked": False})


class PostCommentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug, post_id):
        post = get_object_or_404(Post, id=post_id, society__slug=slug)
        comments = post.comments.select_related("author").order_by("created_at")
        return Response(CommentSerializer(comments, many=True).data)

    def post(self, request, slug, post_id):
        post = get_object_or_404(Post, id=post_id, society__slug=slug)
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"detail": "Comment cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        comment = Comment.objects.create(post=post, author=request.user, content=content)
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class CommentDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, slug, post_id, comment_id):
        comment = get_object_or_404(Comment, id=comment_id, post__id=post_id, author=request.user)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
