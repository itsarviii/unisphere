import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";
import { ToastProvider } from "./context/ToastContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Society from "./pages/Society";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/sign-in" replace />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.18 },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...fade}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />

          <Route path="/feed"    element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/society/:societySlug" element={<PrivateRoute><Society /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <AnimatedRoutes />
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
