import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Pizza,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import API from "../api/axios";
import FeedbackAlert from "../components/FeedbackAlert";
import { emitAuthChanged } from "../utils/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pageFeedback, setPageFeedback] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.feedback) {
      setPageFeedback(location.state.feedback);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const showAuthNotice = (message) => {
    setPageFeedback({
      type: "info",
      title: "Email sign-in only",
      message,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.user.token);
      localStorage.setItem("authUser", JSON.stringify(res.data.user));
      emitAuthChanged();

      navigate("/dashboard", {
        state: {
          feedback: {
            type: "success",
            title: "Signed in",
            message: `Welcome back, ${res.data.user.name || "you're signed in"}.`,
          },
        },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel-strong grid w-full max-w-5xl overflow-hidden lg:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="hidden bg-contrast px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em]">
              <Pizza size={16} />
              SliceHub Access
            </div>
            <h1 className="mt-8 max-w-sm text-5xl font-extrabold leading-[1.02] tracking-[-0.05em] text-white">
              Sign in to your food workspace
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Continue as a customer, seller, or admin and pick up your live
              restaurant, order, and dashboard flows from one place.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel p-5 text-left">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/70">
                Live roles
              </p>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Customer browsing, seller order processing, and admin
                management all use the same shared UI system.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-8 sm:p-10 lg:p-12">
        <div className="text-center lg:text-left">
          <button
            type="button"
            className="mx-auto mb-6 flex cursor-pointer items-center justify-center group lg:mx-0"
            onClick={() => navigate("/")}
          >
            <div className="bg-[#FF3B30] text-white p-3 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform">
              <Pizza size={32} />
            </div>
            <span className="ml-3 text-[#1A1A1A] text-3xl font-bold tracking-tight">
              Slice<span className="text-[#FF3B30]">Hub</span>
            </span>
          </button>

          <p className="section-kicker">Welcome back</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[#1A1A1A]">
            Sign in
          </h2>

          <p className="mt-2 text-sm text-gray-500 font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#FF3B30] font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {pageFeedback ? (
            <FeedbackAlert
              type={pageFeedback.type}
              title={pageFeedback.title}
              message={pageFeedback.message}
              onClose={() => setPageFeedback(null)}
            />
          ) : null}

          {error ? (
            <FeedbackAlert
              type="error"
              title="Login failed"
              message={error}
              onClose={() => setError("")}
            />
          ) : null}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

                <input
                  type="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-surface pl-12 py-4"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    showAuthNotice(
                      "Password reset is not available in this demo yet. Use your existing password or create a new account if you need a fresh login."
                    )
                  }
                  className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-widest hover:underline"
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

                <input
                  type="password"
                  required
                  disabled={submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-surface pl-12 py-4"
                  placeholder="........"
                />
              </div>
            </div>
          </div>

          <div className="soft-panel px-4 py-3 text-sm text-gray-600">
            Sessions stay signed in on this device until you log out.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary group relative w-full py-4 text-sm font-bold"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              </>
            )}
          </button>
        </form>

        <div className="soft-panel px-4 py-4 text-sm text-gray-600">
          Email and password sign-in is the supported login flow in this demo.
        </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Login;
