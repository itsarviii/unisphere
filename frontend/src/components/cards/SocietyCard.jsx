import { Link } from "react-router-dom";
import { Users } from "lucide-react";

function SocietyCard({ data }) {
  const initials = data.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Link
      to={`/society/${data.slug}`}
      className="group flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-800/60"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-sm font-bold text-indigo-400">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
          {data.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{data.university}</p>

        {data.description && (
          <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {data.description}
          </p>
        )}

        {data.followers_count !== undefined && (
          <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
            <Users size={12} />
            {data.followers_count} member{data.followers_count !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
}

export default SocietyCard;
