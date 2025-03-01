import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Mobile Navbar state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-500 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-white text-3xl font-bold">
            <span className="text-yellow-300">Expense</span> Genius
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Navbar Links */}
        <div className={`flex items-center space-x-4 ${isMenuOpen ? 'block' : 'hidden'} md:flex`}>
          {!token ? (
            <>
              <Link
                to="/login"
                className="text-white font-bold hover:bg-blue-600 px-3 py-2 rounded"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white font-bold hover:bg-blue-600 px-3 py-2 rounded"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="text-white font-bold hover:bg-blue-600 px-3 py-2 rounded"
              >
                Dashboard
              </Link>
              {/* User Avatar / Profile (if logged in) */}
              <div className="relative">
                <img
                  src="https://via.placeholder.com/40" // Placeholder avatar
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <div className="absolute top-0 right-0 text-white text-xs bg-red-500 w-4 h-4 rounded-full flex items-center justify-center">
                  3 {/* Notification Count */}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-white font-bold hover:bg-blue-600 px-3 py-2 rounded"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu - Display on small screens */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-600 p-4 space-y-4">
          {!token ? (
            <>
              <Link to="/login" className="text-white block py-2">Login</Link>
              <Link to="/signup" className="text-white block py-2">Signup</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-white block py-2">Dashboard</Link>
              <button
                onClick={handleLogout}
                className="text-white block py-2"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
