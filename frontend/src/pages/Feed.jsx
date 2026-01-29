import { useEffect, useState, useCallback } from "react";
import api from "../api/apiClient";
import PostCard from "../components/cards/PostCard";
import EventCard from "../components/cards/EventCard";
import { useToast } from "../context/ToastContext";

function Skeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-slate-800" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-28 rounded-full bg-slate-800" />
          <div className="h-2.5 w-20 rounded-full bg-slate-800/60" />
        </div>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-800" />
      <div className="h-3 w-3/4 rounded-full bg-slate-800/60" />
    </div>
  );
}

export default function Feed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    api.get("feed/")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => show("Failed to load feed", "error"))
      .finally(() => setLoading(false));
  }, []);

  // Remove expired events every minute
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setItems((prev) => prev.filter((i) => i.type !== "event" || new Date(i.event_date) > now));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const handleLike = useCallback(async (item) => {
    const isLiked = item.is_liked;
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id && i.type === "post"
          ? { ...i, is_liked: !isLiked, likes_count: i.likes_count + (isLiked ? -1 : 1) }
          : i
      )
    );
    try {
      if (isLiked) {
        await api.delete(`societies/${item.society_slug}/posts/${item.id}/like/`);
      } else {
        await api.post(`societies/${item.society_slug}/posts/${item.id}/like/`);
      }
    } catch {
      // revert
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id && i.type === "post"
            ? { ...i, is_liked: isLiked, likes_count: i.likes_count + (isLiked ? 1 : -1) }
            : i
        )
      );
      show("Failed to update like", "error");
    }
  }, [show]);

  const handleRSVP = useCallback(async (item) => {
    const attending = item.is_attending;
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id && i.type === "event"
          ? { ...i, is_attending: !attending, attendee_count: i.attendee_count + (attending ? -1 : 1) }
          : i
      )
    );
    try {
      if (attending) {
        await api.delete(`societies/events/${item.id}/rsvp/`);
        show("RSVP cancelled");
      } else {
        await api.post(`societies/events/${item.id}/rsvp/`);
        show("You're going! 🎉");
      }
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id && i.type === "event"
            ? { ...i, is_attending: attending, attendee_count: i.attendee_count + (attending ? 1 : -1) }
            : i
        )
      );
      show("Failed to update RSVP", "error");
    }
  }, [show]);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 pt-24 pb-28 md:pb-16">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Your Feed</h1>
          <p className="text-sm text-slate-400 mt-1">Personalised for your interests and societies</p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} />)}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
            <p className="text-slate-400 font-medium mb-2">Your feed is empty</p>
            <p className="text-sm text-slate-500">
              Follow societies and add interests to get personalised content.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {items.map((item) =>
            item.type === "event" ? (
              <EventCard
                key={`event-${item.id}`}
                data={{
                  ...item,
                  societyName: item.society_name,
                  societySlug: item.society_slug,
                }}
                onRSVP={() => handleRSVP(item)}
              />
            ) : (
              <PostCard
                key={`post-${item.id}`}
                data={{
                  ...item,
                  name: item.society_name,
                  slug: item.society_slug,
                }}
                onLike={() => handleLike(item)}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
