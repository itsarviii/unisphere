import { createContext, useContext, useState } from "react";
import CreateSocietyModal from "../components/modals/CreateSocietyModal";
import CreatePostModal from "../components/modals/CreatePostModal";
import CreateEventModal from "../components/modals/CreateEventModal";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null); 

  const openModal = (name, props = {}) => {
    setModal({ name, props });
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {/* Render modals */}
      {modal?.name === "createSociety" && (
        <CreateSocietyModal
          onClose={closeModal}
          {...modal.props}
        />
      )}

      {modal?.name === "createPost" && (
        <CreatePostModal
          onClose={closeModal}
          {...modal.props}
        />
      )}

      {modal?.name === "createEvent" && (
        <CreateEventModal
          onClose={closeModal}
          {...modal.props}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}