import { useEffect } from "react";

function Modal({ children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="
        fixed inset-0 z-50 
        flex items-center justify-center 
        bg-black/60 backdrop-blur-sm
        px-6
        animate-fadeIn
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-[520px]
          animate-scaleIn
        "
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;