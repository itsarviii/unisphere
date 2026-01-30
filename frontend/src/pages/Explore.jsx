import { useEffect, useState, useCallback } from "react";
import api from "../api/apiClient";
import SocietyCard from "../components/cards/SocietyCard";
import EventCard from "../components/cards/EventCard";
import { useToast } from "../context/ToastContext";
import { Search } from "lucide-react";

function Skeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 animate-pulse flex gap-4">
      <div className="h-12 w-12 rounded-xl bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-32 rounded-full bg-slate-800" />
        <div className="h-2.5 w-24 rounded-full bg-slate-800/60" />
        <div className="h-2.5 w-full rounded-full bg-slate-800/40 mt-3" />
      </div>
    </div>
  );
}

export default function Explore() {
  const [societies, setSocieties] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("societies");
  const [query, setQuery] = useState("");
  const { show } = useToast();

  const fetchAll = useCallback(() => {
    Promise.all([api.get("societies/"), api.get("societies/events/")])
      .then(([sRes, eRes]) => {
        setSocieties(Array.isArray(sRes.data) ? sRes.data : []);
        setEvents(Array.isArray(eRes.data) ? eRes.data : []);
      })
      .catch(() => show("Failed to load", "error"))
      .finally(() => setLoading(false));
  }, [show]);

  useEffect(() => {
    fetchAll();
    const handler = () => fetchAll();
    window.addEventListener("society:created", handler);
    return () => window.removeEventListener("society:created", handler);
  }, [fetchAll]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setEvents((prev) => prev.filter((e) => new Date(e.event_date) > now));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const handleRSVP = useCallback(async (event) => {
    const attending = event.is_attending;
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? { ...e, is_attending: !attending, attendee_count: e.attendee_count + (attending ? -1 : 1) }
          : e
      )
    );
    try {
      if (attending) {
        await api.delete(`societies/events/${event.id}/rsvp/`);
        show("RSVP cancelled");
      } else {
        await api.post(`societies/events/${event.id}/rsvp/`);
        show("You're going! 🎉");
      }
    } catch {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, is_attending: attending, attendee_count: e.attendee_count + (attending ? 1 : -1) }
            : e
        )
      );
      show("Failed to update RSVP", "error");
    }
  }, [show]);

  const q = query.toLowerCase();
  const filteredSocieties = societies.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.university?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
  );
  const filteredEvents = events.filter(
    (e) => !q || e.title.toLowerCase().includes(q) || e.society_name?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 pt-24 pb-28 md:pb-16">
      <div className="mx-auto w-full max-w-xl">

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Explore</h1>
          <p className="text-sm text-slate-400 mt-1">Discover societies and events</p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search societies, events…"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
          {[
            { key: "societies", label: "Societies", count: filteredSocieties.length },
            { key: "events",    label: "Events",    count: filteredEvents.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                tab === key ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
              {!loading && (
                <span className={`ml-1.5 text-xs ${tab === key ? "text-indigo-200" : "text-slate-600"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} />)}</div>
        ) : tab === "societies" ? (
          filteredSocieties.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              {query ? "No societies match your search." : "No societies yet."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredSocieties.map((s) => <SocietyCard key={s.id} data={s} />)}
            </div>
          )
        ) : filteredEvents.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            {query ? "No events match your search." : "No upcoming events."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((e) => (
              <EventCard
                key={e.id}
                data={{ ...e, societyName: e.society_name, societySlug: e.society_slug }}
                onRSVP={() => handleRSVP(e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
