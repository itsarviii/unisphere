import { Link } from "react-router-dom";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function PostCard({ data, onLike }) {
  const initials = data.name
    ? data.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  const timeAgo = data.created_at
    ? formatDistanceToNow(new Date(data.created_at), { addSuffix: true })
    : data.date;

  return (
    <Link
      to={`/society/${data.slug}`}
      className="block rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/50"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-xs font-bold text-indigo-400">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{data.name}</p>
          <p className="text-xs text-slate-500">{data.university} · {timeAgo}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-300 leading-relaxed text-sm mb-4 whitespace-pre-wrap">
        {data.content}
      </p>

      {/* Explanation */}
      {data.explanation && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-indigo-400/80">
          <Sparkles size={11} />
          {data.explanation}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-800">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike && onLike(); }}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            data.is_liked ? "text-rose-400" : "text-slate-500 hover:text-rose-400"
          }`}
        >
          <Heart size={14} fill={data.is_liked ? "currentColor" : "none"} />
          {data.likes_count ?? 0}
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MessageCircle size={14} />
          {data.comments_count ?? 0}
        </div>
      </div>
    </Link>
  );
}

export default PostCard;
