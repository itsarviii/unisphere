import { useState } from "react";
import api from "../../api/apiClient";
import Modal from "../Modal";
import { X, Sparkles } from "lucide-react";

function CreatePostModal({ onClose, societySlug, societyName, university, onPostCreated }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!content.trim()) return setError("Post content cannot be empty.");
    if (content.trim().length < 5) return setError("Post must be at least 5 characters.");

    try {
      setLoading(true);
      await api.post(`societies/${societySlug}/posts/`, { content: content.trim() });
      if (onPostCreated) await onPostCreated();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "string") setError(data);
      else if (data?.content) setError(data.content.join(" "));
      else setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiAssist = async () => {
    setAiLoading(true);
    setError("");
    try {
      const res = await api.post("ai-assist/", {
        content_type: "post",
        society_name: societyName,
        university: university,
        draft: content.trim(),
      });
      setContent(res.data.suggestion);
    } catch {
      setError("AI assist unavailable. Try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Post update</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <textarea
          placeholder="What's new?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none min-h-28 resize-none"
        />

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={handleAiAssist}
            disabled={aiLoading}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 transition disabled:opacity-50"
          >
            <Sparkles size={12} />
            {aiLoading ? "Writing…" : "AI assist"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {loading ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CreatePostModal;
