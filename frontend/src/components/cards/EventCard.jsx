import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Sparkles } from "lucide-react";
import { format } from "date-fns";

function EventCard({ data, onRSVP }) {
  const initials = (data.societyName || data.name || "?")
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const societySlug = data.societySlug || data.slug;
  const eventDate = data.event_date ? new Date(data.event_date) : null;

  const isUpcoming = eventDate && eventDate > new Date();
  const daysUntil = eventDate
    ? Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Link
      to={`/society/${societySlug}`}
      className="block rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/50"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-xs font-bold text-violet-400">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{data.societyName || data.name}</p>
            <p className="text-xs text-slate-500">{data.university}</p>
          </div>
        </div>

        {isUpcoming && daysUntil !== null && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            daysUntil <= 3
              ? "bg-amber-500/15 text-amber-400"
              : "bg-violet-600/10 text-violet-400"
          }`}>
            {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil}d`}
          </span>
        )}
      </div>

      {/* Event info */}
      <p className="font-semibold text-white mb-2">{data.title}</p>

      {data.description && (
        <p className="text-sm text-slate-400 leading-relaxed mb-3 line-clamp-2">
          {data.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-4 text-xs text-slate-500">
        {eventDate && (
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-400" />
            {format(eventDate, "MMM d, yyyy · h:mm a")}
          </span>
        )}
        {data.location && (
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-400" />
            {data.location}
          </span>
        )}
      </div>

      {/* Explanation */}
      {data.explanation && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-indigo-400/80">
          <Sparkles size={11} />
          {data.explanation}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users size={12} />
          {data.attendee_count ?? 0} attending
        </div>

        {onRSVP && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRSVP(); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              data.is_attending
                ? "bg-violet-600/20 text-violet-400 hover:bg-red-500/10 hover:text-red-400"
                : "bg-violet-600 text-white hover:bg-violet-500"
            }`}
          >
            {data.is_attending ? "Going ✓" : "RSVP"}
          </button>
        )}
      </div>
    </Link>
  );
}

export default EventCard;
