import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import Modal from "../Modal";
import { useAuth } from "../../context/AuthContext";
import { X } from "lucide-react";

function CreateSocietyModal({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!user?.university)
      return setError("Please add your university in your profile before creating a society."), false;
    if (!formData.name.trim())
      return setError("Please enter a society name."), false;
    if (formData.name.trim().length < 3)
      return setError("Society name must be at least 3 characters."), false;
    if (!formData.description.trim())
      return setError("Please enter a short description."), false;
    if (formData.description.trim().length < 10)
      return setError("Description must be at least 10 characters."), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("societies/", {
        name: formData.name.trim(),
        university: user?.university || "",
        description: formData.description.trim(),
      });
      window.dispatchEvent(new CustomEvent("society:created", { detail: res.data }));
      onClose();
      navigate(`/society/${res.data.slug}`);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "string") setError(data);
      else if (data?.name) setError(data.name.join(" "));
      else setError("Failed to create society. Please try again.");
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
          <div>
            <h2 className="text-lg font-semibold">Create society</h2>
            {user?.university && (
              <p className="text-xs text-slate-500 mt-0.5">{user.university}</p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Society name"
            value={formData.name}
            onChange={handleChange}
            className={inputClass}
          />
          <textarea
            name="description"
            placeholder="What is this society about?"
            value={formData.description}
            onChange={handleChange}
            className={`${inputClass} min-h-25 resize-none`}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default CreateSocietyModal;
