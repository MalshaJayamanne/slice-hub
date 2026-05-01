import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import useToast from "../hooks/useToast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.", "Registration failed");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await API.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      navigate("/login", {
        state: {
          feedback: {
            type: "success",
            title: "Registration complete",
            message: "Your account was created successfully. Sign in to continue.",
          },
        },
      });
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Registration failed";
      setError(message);
      toast.error(message, "Registration failed");
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
        <div className="hidden bg-gradient-to-br from-contrast via-slate-900 to-slate-800 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em]">
              <Pizza size={16} />
              Create Account
            </div>
            <h1 className="mt-8 max-w-sm text-5xl font-extrabold leading-[1.02] tracking-[-0.05em] text-white">
              Join the platform with a cleaner start
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Register as a customer or seller, then continue into the same
              polished dashboards, browsing flows, and order tools.
            </p>
          </div>

          <div className="glass-panel p-5 text-left">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/70">
              Seller note
            </p>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Sellers can create a restaurant after sign-in, then move into menu
              and order management from the dashboard.
            </p>
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

          <p className="section-kicker">Create account</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[#1A1A1A]">
            Register
          </h2>

          <p className="mt-2 text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-[#FF3B30] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error ? (
            <FeedbackAlert
              type="error"
              title="Registration failed"
              message={error}
              onClose={() => setError("")}
            />
          ) : null}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-surface py-4"
                placeholder="John Doe"
              />
            </div>

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
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Account Type
              </label>
              <select
                disabled={submitting}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="select-surface py-4"
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            <div className="soft-panel border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-gray-600">
              Sellers can create and manage restaurants after signing in. Admin accounts are created separately by the backend.
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Password
              </label>
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

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  disabled={submitting}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input-surface pl-12 py-4"
                  placeholder="........"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary group relative w-full py-4 text-sm font-bold"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Creating Account...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              </>
            )}
          </button>
        </form>

        <div className="soft-panel px-4 py-4 text-sm text-gray-600">
          Email registration is the supported sign-up flow in this demo.
        </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Register;
