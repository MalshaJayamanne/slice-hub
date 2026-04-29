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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4 py-12 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <button
            type="button"
            className="mx-auto flex items-center justify-center cursor-pointer group mb-6"
            onClick={() => navigate("/")}
          >
            <div className="bg-[#FF3B30] text-white p-3 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform">
              <Pizza size={32} />
            </div>
            <span className="ml-3 text-[#1A1A1A] text-3xl font-bold tracking-tight">
              Slice<span className="text-[#FF3B30]">Hub</span>
            </span>
          </button>

          <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Welcome Back!</h2>

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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/20 focus:border-[#FF3B30] font-medium transition-all"
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/20 focus:border-[#FF3B30] font-medium transition-all"
                  placeholder="........"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Sessions stay signed in on this device until you log out.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-[#FF3B30] hover:bg-[#FF9F1C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3B30] transition-all shadow-lg"
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

        <div className="rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
          Email and password sign-in is the supported login flow in this demo.
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
