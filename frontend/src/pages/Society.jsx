import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/apiClient";
import { useModal } from "../context/ModalContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { Heart, MessageCircle, Send, Trash2, Users, Calendar, MapPin } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

function CommentThread({ post, slug, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { show } = useToast();

  useEffect(() => {
    api.get(`societies/${slug}/posts/${post.id}/comments/`)
      .then((r) => setComments(r.data))
      .finally(() => setLoading(false));
  }, [slug, post.id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`societies/${slug}/posts/${post.id}/comments/`, { content: text.trim() });
      setComments((prev) => [...prev, r.data]);
      onCountChange(1);
      setText("");
    } catch {
      show("Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`societies/${slug}/posts/${post.id}/comments/${id}/`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      onCountChange(-1);
    } catch {
      show("Failed to delete comment", "error");
    }
  };

  return (
    <div className="mt-4 border-t border-slate-800 pt-4 space-y-3">
      {loading ? (
        <p className="text-xs text-slate-500">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-500">No comments yet. Be the first!</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2.5 group">
            <div className="h-7 w-7 shrink-0 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300">
              {(c.author_name || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-300">{c.author_name}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{c.content}</p>
            </div>
            {c.author_name === (user?.fullname || user?.email?.split("@")[0]) && (
              <button
                onClick={() => deleteComment(c.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))
      )}

      <form onSubmit={submit} className="flex gap-2 mt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm hover:bg-indigo-500 disabled:opacity-40 transition"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

function PostItem({ post: initialPost, slug }) {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const { show } = useToast();

  const toggleLike = async () => {
    const liked = post.is_liked;
    setPost((p) => ({ ...p, is_liked: !liked, likes_count: p.likes_count + (liked ? -1 : 1) }));
    try {
      if (liked) {
        await api.delete(`societies/${slug}/posts/${post.id}/like/`);
      } else {
        await api.post(`societies/${slug}/posts/${post.id}/like/`);
      }
    } catch {
      setPost((p) => ({ ...p, is_liked: liked, likes_count: p.likes_count + (liked ? 1 : -1) }));
      show("Failed to update like", "error");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">
          {post.author_name} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </p>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
        {post.content}
      </p>

      <div className="flex items-center gap-5 pt-3 border-t border-slate-800">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            post.is_liked ? "text-rose-400" : "text-slate-500 hover:text-rose-400"
          }`}
        >
          <Heart size={14} fill={post.is_liked ? "currentColor" : "none"} />
          {post.likes_count}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            showComments ? "text-indigo-400" : "text-slate-500 hover:text-indigo-400"
          }`}
        >
          <MessageCircle size={14} />
          {post.comments_count}
        </button>
      </div>

      {showComments && (
        <CommentThread
          post={post}
          slug={slug}
          onCountChange={(delta) =>
            setPost((p) => ({ ...p, comments_count: p.comments_count + delta }))
          }
        />
      )}
    </div>
  );
}

function EventItem({ event: initialEvent }) {
  const [event, setEvent] = useState(initialEvent);
  const { show } = useToast();

  const toggleRSVP = async () => {
    const attending = event.is_attending;
    setEvent((e) => ({ ...e, is_attending: !attending, attendee_count: e.attendee_count + (attending ? -1 : 1) }));
    try {
      if (attending) {
        await api.delete(`societies/events/${event.id}/rsvp/`);
        show("RSVP cancelled");
      } else {
        await api.post(`societies/events/${event.id}/rsvp/`);
        show("You're going! 🎉");
      }
    } catch {
      setEvent((e) => ({ ...e, is_attending: attending, attendee_count: e.attendee_count + (attending ? 1 : -1) }));
      show("Failed to update RSVP", "error");
    }
  };

  const date = new Date(event.event_date);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-white mb-1">{event.title}</p>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400" />
              {format(date, "MMM d, yyyy · h:mm a")}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-slate-400" />
                {event.location}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{event.description}</p>
          )}

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Users size={12} />
              {event.attendee_count} attending
            </span>
          </div>
        </div>

        <button
          onClick={toggleRSVP}
          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
            event.is_attending
              ? "bg-violet-600/20 text-violet-400 hover:bg-red-500/10 hover:text-red-400"
              : "bg-violet-600 text-white hover:bg-violet-500"
          }`}
        >
          {event.is_attending ? "Going ✓" : "RSVP"}
        </button>
      </div>
    </div>
  );
}

export default function Society() {
  const { societySlug } = useParams();
  const { openModal } = useModal();
  const { show } = useToast();

  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState("updates");
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  const isAdmin = society?.is_admin ?? false;
  const isMember = society?.is_member ?? false;

  const fetchSociety = useCallback(async () => {
    try {
      const r = await api.get(`societies/${societySlug}/`);
      setSociety(r.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [societySlug]);

  const fetchContent = useCallback(async () => {
    setLoadingContent(true);
    try {
      const [pRes, eRes] = await Promise.all([
        api.get(`societies/${societySlug}/posts/`),
        api.get(`societies/${societySlug}/events/`),
      ]);
      setPosts(Array.isArray(pRes.data) ? pRes.data : []);
      setEvents(Array.isArray(eRes.data) ? eRes.data : []);
    } finally {
      setLoadingContent(false);
    }
  }, [societySlug]);

  useEffect(() => {
    fetchSociety();
    fetchContent();
  }, [fetchSociety, fetchContent]);

  const handleFollow = async () => {
    try {
      await api.post(`societies/${societySlug}/follow/`);
      setSociety((s) => ({ ...s, is_member: true, followers_count: s.followers_count + 1 }));
      show("Following " + society.name);
    } catch {
      show("Failed to follow", "error");
    }
  };

  const handleUnfollow = async () => {
    try {
      await api.post(`societies/${societySlug}/unfollow/`);
      setSociety((s) => ({ ...s, is_member: false, followers_count: Math.max(s.followers_count - 1, 0) }));
      show("Unfollowed " + society.name);
    } catch {
      show("Failed to unfollow", "error");
    }
  };

  const initials = society?.name
    ? society.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !society) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Society not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 pt-24 pb-28 md:pb-16">
      <div className="mx-auto w-full max-w-xl space-y-6">

        {/* Society header */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/20 text-lg font-bold text-indigo-400">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-white">{society.name}</h1>
              <p className="text-sm text-slate-400">{society.university}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Users size={11} />
                {society.followers_count} member{society.followers_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {society.description && (
            <p className="text-sm text-slate-400 leading-relaxed mb-5">{society.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => openModal("createPost", { societySlug, societyName: society.name, university: society.university, onPostCreated: fetchContent })}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition active:scale-95"
                >
                  Post update
                </button>
                <button
                  onClick={() => openModal("createEvent", { societySlug, societyName: society.name, university: society.university, onEventCreated: fetchContent })}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition active:scale-95"
                >
                  Host event
                </button>
              </>
            ) : isMember ? (
              <button
                onClick={handleUnfollow}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition active:scale-95"
              >
                Following ✓
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition active:scale-95"
              >
                Follow
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
          {["updates", "events"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                tab === t ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {loadingContent ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : tab === "updates" ? (
          posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <p className="text-slate-400 text-sm">No updates yet.</p>
              {isAdmin && <p className="text-xs text-slate-500 mt-1">Use "Post update" to share something.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((p) => <PostItem key={p.id} post={p} slug={societySlug} />)}
            </div>
          )
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-slate-400 text-sm">No upcoming events.</p>
            {isAdmin && <p className="text-xs text-slate-500 mt-1">Use "Host event" to create one.</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((e) => <EventItem key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}
