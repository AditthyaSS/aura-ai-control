import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-[1000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#E53935]">Agent</span>
              <span className="text-gray-900">opia</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-[#E53935] transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-[#E53935] transition-colors duration-200 font-medium"
            >
              About
            </Link>
            <Link
              to="/features"
              className="text-gray-700 hover:text-[#E53935] transition-colors duration-200 font-medium"
            >
              Features
            </Link>
            
            {/* Primary CTA Button */}
            <button
              onClick={() => navigate('/app')}
              className="bg-[#E53935] hover:bg-[#FF4D4F] text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Enter Office
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => navigate('/app')}
              className="bg-[#E53935] text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
