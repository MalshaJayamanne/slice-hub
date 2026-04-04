import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Pizza, Chrome, Facebook, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin('customer'); // simulate login
    onNavigate('home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4 py-12 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100"
      >
        {/* Logo */}
        <div className="text-center">
          <div
            className="flex items-center justify-center cursor-pointer group mb-6"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-[#FF3B30] text-white p-3 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform">
              <Pizza size={32} />
            </div>
            <span className="ml-3 text-[#1A1A1A] text-3xl font-bold tracking-tight">
              Slice<span className="text-[#FF3B30]">Hub</span>
            </span>
          </div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Welcome Back!</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#FF3B30] font-bold hover:underline"
            >
              Create one
            </button>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/20 focus:border-[#FF3B30] font-medium transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-widest hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/20 focus:border-[#FF3B30] font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#FF3B30] focus:ring-[#FF3B30] border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500 font-medium">
              Remember me
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-[#FF3B30] hover:bg-[#FF9F1C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3B30] transition-all shadow-lg"
          >
            Sign In
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-bold uppercase text-[10px] tracking-widest">Or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm text-[#1A1A1A]">
            <Chrome size={18} /> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm text-[#1A1A1A]">
            <Facebook size={18} /> Facebook
          </button>
          <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm text-[#1A1A1A]">
            <Instagram size={18} /> Instagram
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;