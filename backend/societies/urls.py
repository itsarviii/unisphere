from django.urls import path

from .views import SocietyListView, SocietyDetailView, follow_society, unfollow_society
from events.views import SocietyEventsView, AllEventsView, EventRSVPView
from posts.views import SocietyPostsView, PostLikeView, PostCommentsView, CommentDeleteView

urlpatterns = [
    path("", SocietyListView.as_view(), name="society-list"),

    # Events (before <slug>/ to avoid shadowing)
    path("events/", AllEventsView.as_view(), name="all-events"),
    path("events/<int:event_id>/rsvp/", EventRSVPView.as_view(), name="event-rsvp"),

    # Society actions
    path("<slug:slug>/follow/", follow_society, name="society-follow"),
    path("<slug:slug>/unfollow/", unfollow_society, name="society-unfollow"),

    # Posts
    path("<slug:slug>/posts/", SocietyPostsView.as_view(), name="society-posts"),
    path("<slug:slug>/posts/<int:post_id>/like/", PostLikeView.as_view(), name="post-like"),
    path("<slug:slug>/posts/<int:post_id>/comments/", PostCommentsView.as_view(), name="post-comments"),
    path("<slug:slug>/posts/<int:post_id>/comments/<int:comment_id>/", CommentDeleteView.as_view(), name="comment-delete"),

    # Society events
    path("<slug:slug>/events/", SocietyEventsView.as_view(), name="society-events"),

    # Society detail (last)
    path("<slug:slug>/", SocietyDetailView.as_view(), name="society-detail"),
]
