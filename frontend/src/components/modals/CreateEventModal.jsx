import { useState } from "react";
import api from "../../api/apiClient";
import Modal from "../Modal";
import { X, Sparkles } from "lucide-react";

function CreateEventModal({ onClose, societySlug, societyName, university, onEventCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!title.trim()) return setError("Please enter an event title.");
    if (title.trim().length < 3) return setError("Title must be at least 3 characters.");
    if (!eventDate) return setError("Please select a date and time.");
    if (!location.trim()) return setError("Please enter a location.");

    try {
      setLoading(true);
      await api.post(`societies/${societySlug}/events/`, {
        title: title.trim(),
        description: description.trim(),
        event_date: new Date(eventDate).toISOString(),
        location: location.trim(),
      });
      if (onEventCreated) await onEventCreated();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "string") setError(data);
      else if (data?.title) setError(data.title.join(" "));
      else if (data?.event_date) setError(data.event_date.join(" "));
      else setError("Failed to create event. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiAssist = async () => {
    setAiLoading(true);
    setError("");
    try {
      const res = await api.post("ai-assist/", {
        content_type: "event",
        society_name: societyName,
        university: university,
        draft: [title, location].filter(Boolean).join(" — "),
      });
      setDescription(res.data.suggestion);
    } catch {
      setError("AI assist unavailable. Try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none";

  return (
    <Modal onClose={onClose}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Host event</h2>
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
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />

          <div className="relative">
            <textarea
              placeholder="Description (optional — or use AI assist)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-24 resize-none`}
            />
            <button
              onClick={handleAiAssist}
              disabled={aiLoading}
              className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-xs text-indigo-400 hover:bg-indigo-500/20 transition disabled:opacity-50"
            >
              <Sparkles size={11} />
              {aiLoading ? "Writing…" : "AI"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-slate-500">Date & time</label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-500">Location</label>
              <input
                placeholder="Room 204"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
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
            {loading ? "Creating…" : "Create event"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CreateEventModal;
