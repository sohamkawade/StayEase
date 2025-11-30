import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-40 bg-black text-white py-16 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-extrabold font-sans text-white">
                StayEase
              </h1>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner for seamless hotel bookings and exceptional hospitality experiences.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="text-gray-300 hover:text-white transition">
                  Hotels
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-gray-300 hover:text-white transition">
                  Rooms
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="text-gray-300" size={18} />
                <a href="mailto:steyease.team@gmail.com" className="text-gray-300 hover:text-white transition">
                  stayease.team@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-gray-300" size={18} />
                <span className="text-gray-300">+91 9372463345</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="text-gray-300" size={18} />
                <span className="text-gray-300">Mumbai, India</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 space-y-2 text-center text-gray-300 text-sm">
          <p>
            &copy; {new Date().getFullYear()} StayEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
