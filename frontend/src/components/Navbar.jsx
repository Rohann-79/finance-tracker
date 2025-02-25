import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-500 p-4 shadow-md">
      <ul className="flex space-x-4">
        {!token && (
          <>
            <li>
              <Link to="/login" className="text-white font-bold hover:bg-blue-600 px-3 py-2 rounded">
                Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className="text-white font-bold hover:bg-blue-600 px-3 py-2 rounded">
                Signup
              </Link>
            </li>
          </>
        )}
        {token && (
          <>
            <li>
              <Link to="/dashboard" className="text-white font-bold hover:bg-blue-600 px-3 py-2 rounded">
                Dashboard
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-white font-bold hover:bg-blue-600 px-3 py-2 rounded"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;