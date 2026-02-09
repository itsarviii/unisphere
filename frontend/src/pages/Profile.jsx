import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import EditProfileModal from "../components/modals/EditProfileModal";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useToast } from "../context/ToastContext";
import { Users, LogOut, Edit2, Plus, BookOpen } from "lucide-react";

function SocietyRow({ society }) {
  const initials = society.name
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <Link
      to={`/society/${society.slug}`}
      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 hover:bg-slate-800/60 transition-all group"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-sm font-bold text-indigo-400 group-hover:bg-indigo-600/30 transition">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white text-sm truncate">{society.name}</p>
        <p className="text-xs text-slate-500 truncate">{society.university}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-600 shrink-0">
        <Users size={11} />
        {society.followers_count ?? 0}
      </div>
    </Link>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { openModal } = useModal();
  const { show } = useToast();

  const [managedSocieties, setManagedSocieties] = useState([]);
  const [followedSocieties, setFollowedSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    api.get("societies/")
      .then((res) => {
        const societies = Array.isArray(res.data) ? res.data : [];
        setManagedSocieties(societies.filter((s) => s.is_admin));
        setFollowedSocieties(societies.filter((s) => s.is_member && !s.is_admin));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    show("Logged out");
    navigate("/sign-in");
  };

  const interests = user.interests
    ? user.interests.split(",").map((i) => i.trim()).filter(Boolean)
    : [];

  const initials = (user.fullname || user.email || "?")
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 pt-24 pb-28 md:pb-16">
      <div className="mx-auto w-full max-w-xl space-y-5">

        {/* Profile card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/20 text-xl font-bold text-indigo-400">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white leading-tight">
                  {user.fullname || "Student"}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
                {user.university && (
                  <p className="text-xs text-slate-500 mt-1">{user.university}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition active:scale-95"
              >
                <Edit2 size={13} />
                Edit
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition active:scale-95"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 mb-4 text-sm">
            <div className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-slate-500" />
              <span className="font-semibold text-white">{managedSocieties.length}</span>
              <span className="text-slate-500">managing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-slate-500" />
              <span className="font-semibold text-white">{followedSocieties.length}</span>
              <span className="text-slate-500">following</span>
            </div>
          </div>

          {/* Interests */}
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-600/10 border border-indigo-600/20 px-2.5 py-1 text-xs text-indigo-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Managed societies */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Managing</h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl border border-slate-800 bg-slate-900 animate-pulse" />
              ))}
            </div>
          ) : managedSocieties.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center">
              <p className="text-sm text-slate-500">You don't manage any societies yet.</p>
              <button
                onClick={() => openModal("createSociety")}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition active:scale-95"
              >
                <Plus size={14} />
                Create one
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {managedSocieties.map((s) => <SocietyRow key={s.slug} society={s} />)}
            </div>
          )}
        </div>

        {/* Followed societies */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Following</h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl border border-slate-800 bg-slate-900 animate-pulse" />
              ))}
            </div>
          ) : followedSocieties.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center">
              <p className="text-sm text-slate-500">Not following any societies yet.</p>
              <Link
                to="/explore"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                Explore societies
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {followedSocieties.map((s) => <SocietyRow key={s.slug} society={s} />)}
            </div>
          )}
        </div>

      </div>

      {showEdit && (
        <EditProfileModal
          onClose={() => setShowEdit(false)}
          user={user}
          onSaved={(updated) => {
            setUser(updated);
            show("Profile updated");
          }}
        />
      )}
    </div>
  );
}
