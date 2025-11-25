import React, { useState } from 'react';
import { Menu, X, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_038f5287-0ae4-4474-bffb-d48d321d9405/artifacts/rbirf40v_WhatsApp%20Image%202025-11-21%20at%201.10.29%20AM.jpeg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src={LOGO_URL}
              alt="Golden Touch Cleaning Services"
              loading="lazy"
              decoding="async"
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">
                  Golden Touch
                </span>
              </h1>
              <p className="text-xs text-gray-600 font-medium">Cleaning Services</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('services')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollToSection('booking')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Contact
            </button>
          </nav>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Calgary, AB</span>
            </div>
            <Button
              onClick={() => scrollToSection('booking')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('services')}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection('booking')}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </button>
              <Button
                onClick={() => scrollToSection('booking')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white w-full"
              >
                Book Now
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
