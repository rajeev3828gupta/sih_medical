import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold text-primary-600">
            Telemedicine Nabha
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600">
              Dashboard
            </Link>
            <Link to="/consultation" className="text-gray-600 hover:text-primary-600">
              Consultation
            </Link>
            <Link to="/pharmacy" className="text-gray-600 hover:text-primary-600">
              Pharmacy
            </Link>
            <Link to="/symptom-checker" className="text-gray-600 hover:text-primary-600">
              Symptom Checker
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.phone}
            </span>
            <Link to="/profile" className="text-gray-600 hover:text-primary-600">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
