import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [page, setPage] = useState('login'); // default page
  const [user, setUser] = useState(null);

  const handleNavigate = (targetPage) => setPage(targetPage);
  const handleLogin = (role) => setUser({ role });

  return (
    <>
      {page === 'login' && <Login onNavigate={handleNavigate} onLogin={handleLogin} />}
      {page === 'register' && <Register onNavigate={handleNavigate} onRegister={handleLogin} />}
      {page === 'home' && (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] text-[#1A1A1A] font-bold text-3xl">
          Welcome {user?.role || 'User'} to SliceHub!
        </div>
      )}
    </>
  );
}

export default App;