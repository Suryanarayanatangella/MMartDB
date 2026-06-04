import { Mail, Phone, MapPin, Share2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="inline-flex items-center gap-2 mb-4 bg-white p-2 rounded">
              <div className="w-5 h-5 flex items-center justify-center">
                <img src='/favicon.svg' className='img-fluid' alt='Logo' />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:inline">
                M-Mart
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your trusted online marketplace for quality products and exceptional service.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Share2 size={20} />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <MessageCircle size={20} />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Mail size={20} />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Phone size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/store" className="hover:text-white transition-colors text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors text-sm">
                  Electronics
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors text-sm">
                  Fashion
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors text-sm">
                  Home & Garden
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors text-sm">
                  Sports
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex gap-3 items-start">
                <MapPin size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span>123 Market Street, Business City, BC 12345</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={18} className="text-blue-400 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={18} className="text-blue-400 flex-shrink-0" />
                <a href="mailto:support@maheswari.com" className="hover:text-white transition-colors">
                  support@maheswari.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; 2024 Maheswari Store. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
