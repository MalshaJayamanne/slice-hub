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

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match.");
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
      setError(requestError.response?.data?.message || "Registration failed");
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

          <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Create Account</h2>

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
                className="w-full pl-4 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/20 focus:border-[#FF3B30] font-medium transition-all"
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/20 focus:border-[#FF3B30] font-medium transition-all"
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
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/20 focus:border-[#FF3B30] font-medium transition-all"
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-gray-600">
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/20 focus:border-[#FF3B30] font-medium transition-all"
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/20 focus:border-[#FF3B30] font-medium transition-all"
                  placeholder="........"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-[#FF3B30] hover:bg-[#FF9F1C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3B30] transition-all shadow-lg"
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

        <div className="rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
          Email registration is the supported sign-up flow in this demo.
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
