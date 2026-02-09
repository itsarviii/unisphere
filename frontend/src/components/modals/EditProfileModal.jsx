import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import Modal from "../Modal";
import { X } from "lucide-react";

const ALL_INTERESTS = [
  "Artificial Intelligence", "Startups", "Photography", "Design", "Music",
  "Gaming", "Robotics", "Programming", "Data Science", "Marketing",
  "Finance", "Economics", "Psychology", "Philosophy", "Politics",
  "Writing", "Film", "Art", "Fashion", "Fitness", "Biology", "Mathematics",
];

function EditProfileModal({ onClose, user, onSaved }) {
  const [fullname, setFullname] = useState("");
  const [university, setUniversity] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFullname(user.fullname || "");
      setUniversity(user.university || "");
      setInterests(user.interests || "");
    }
  }, [user]);

  const selected = interests
    ? interests.split(",").map((i) => i.trim()).filter(Boolean)
    : [];

  const toggleInterest = (interest) => {
    const list = [...selected];
    if (list.includes(interest)) {
      setInterests(list.filter((i) => i !== interest).join(", "));
    } else {
      setInterests([...list, interest].join(", "));
    }
  };

  const handleSave = async () => {
    setError("");
    if (!fullname.trim()) { setError("Full name is required."); return; }
    try {
      setLoading(true);
      const res = await api.patch("users/me/", { fullname, university, interests });
      if (onSaved) onSaved(res.data);
      onClose();
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none";

  return (
    <Modal onClose={onClose}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="University"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className={inputClass}
          />

          <div>
            <p className="mb-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_INTERESTS.map((interest) => {
                const active = selected.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      active
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>

      </div>
    </Modal>
  );
}

export default EditProfileModal;
