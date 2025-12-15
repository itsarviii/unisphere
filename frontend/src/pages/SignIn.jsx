import api from "../api/apiClient";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("users/sign-in/", { email, password });
      const meRes = await api.get("users/me/", {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });

      login(res.data, meRes.data);
      navigate("/feed");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

      {/* Ambient background (same as Register) */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
            Uni<span className="text-indigo-400">Sphere</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">

          <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
            Welcome back
          </h1>

          <p className="mb-6 text-slate-400">
            Sign in to continue to UniSphere
          </p>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email address"
              className="
                w-full rounded-lg 
                border border-slate-800 
                bg-slate-950 
                p-3 
                text-white 
                placeholder-slate-500
                focus:border-indigo-500 
                focus:outline-none
              "
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="
                w-full rounded-lg 
                border border-slate-800 
                bg-slate-950 
                p-3 
                text-white 
                placeholder-slate-500
                focus:border-indigo-500 
                focus:outline-none
              "
            />

            <button
              type="submit"
              disabled={loading}
              className="
                mt-2 rounded-lg bg-indigo-600 py-3 font-semibold 
                hover:bg-indigo-500 transition 
                disabled:opacity-50
              "
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-400">
            Don’t have an account?{" "}
            <Link
              to="/sign-up"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Sign up
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
}

export default SignIn;