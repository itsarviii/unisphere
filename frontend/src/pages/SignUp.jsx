import api from "../api/apiClient";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const allInterests = [
  "Artificial Intelligence",
  "Startups",
  "Photography",
  "Design",
  "Music",
  "Sports",
  "Gaming",
  "Programming",
  "Robotics",
  "Business",
  "Marketing",
  "Finance",
  "Cybersecurity",
  "Data Science",
  "UI/UX",
  "Film",
  "Writing",
  "Debating",
  "Volunteering",
  "Entrepreneurship",
];

function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    university: "",
    interests: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const validateStep1 = () => {
    if (!formData.fullname || !formData.email || !formData.password) {
      setError("Please complete all fields.");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.university) {
      setError("Please enter your university.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.interests.length === 0) {
      setError("Select at least one interest.");
      return false;
    }
    return true;
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateStep3()) return;

    setLoading(true);

    try {
      await api.post("users/sign-up/", {
        ...formData,
        interests: formData.interests.join(", "),
      });

      const loginRes = await api.post("users/sign-in/", {
        email: formData.email,
        password: formData.password,
      });

      const meRes = await api.get("users/me/", {
        headers: { Authorization: `Bearer ${loginRes.data.access}` },
      });

      login(loginRes.data, meRes.data);
      navigate("/feed");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    1: "Create your account",
    2: "Your university",
    3: "Your interests",
  };

  const subtitles = {
    1: "Start your UniSphere journey",
    2: "Where are you studying?",
    3: "Let’s personalize your experience",
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 overflow-hidden">

      {/* Ambient Background */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative w-full max-w-lg">

        <div className="mb-6 text-center">
          <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
            Uni<span className="text-indigo-400">Sphere</span>
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 mx-1">
              <div
                className={`h-1 rounded-full transition-all ${
                  step >= s ? "bg-indigo-500" : "bg-slate-800"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">

          <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
            {titles[step]}
          </h1>

          <p className="mb-6 text-slate-400">{subtitles[step]}</p>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* STEP 1 */}
              {step === 1 && (
                <form
                  className="flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setError("");
                    if (!validateStep1()) return;
                    nextStep();
                  }}
                >
                  <input
                    name="fullname"
                    placeholder="Full name"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                  />

                  <button className="mt-2 rounded-lg bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 transition">
                    Continue →
                  </button>
                </form>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <form
                  className="flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setError("");
                    if (!validateStep2()) return;
                    nextStep();
                  }}
                >
                  <input
                    name="university"
                    placeholder="University"
                    value={formData.university}
                    onChange={handleChange}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                  />

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="w-1/2 rounded-lg border border-slate-700 py-3 hover:bg-slate-800 transition"
                    >
                      Back
                    </button>
                    <button className="w-1/2 rounded-lg bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 transition">
                      Continue →
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <form className="flex flex-col gap-6" onSubmit={handleFinish}>
                  <div className="flex flex-wrap gap-2">
                    {allInterests.map((interest) => {
                      const selected =
                        formData.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition ${
                            selected
                              ? "bg-indigo-600 border-indigo-600"
                              : "border-slate-700 hover:bg-slate-800"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="w-1/2 rounded-lg border border-slate-700 py-3 hover:bg-slate-800 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 rounded-lg bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 transition disabled:opacity-50"
                    >
                      {loading ? "Registering..." : "Finish →"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="mt-8 text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default SignUp;