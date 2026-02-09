import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 right-4 z-[100] flex flex-col gap-2 items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl text-sm font-medium
              border backdrop-blur-xl animate-toast
              ${toast.type === "error"
                ? "bg-red-950/90 border-red-800 text-red-200"
                : "bg-slate-900/95 border-slate-700 text-white"
              }`}
          >
            {toast.type === "error"
              ? <XCircle size={16} className="text-red-400 shrink-0" />
              : <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            }
            {toast.message}
            <button onClick={() => dismiss(toast.id)} className="ml-1 text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
