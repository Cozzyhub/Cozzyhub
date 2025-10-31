import Link from "next/link";
import { Heart, MessageCircle, Instagram, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="backdrop-blur-xl bg-white/95 border-t border-gray-200 mt-auto transition-colors duration-300">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              CosyHub
            </h2>
            <p className="text-gray-600 mb-6 max-w-md leading-relaxed transition-colors duration-300">
              Your cozy corner for comfort and style. Discover handpicked
              products that make your space feel like home.
            </p>
            <div className="flex items-center gap-2 text-gray-600 mb-6 transition-colors duration-300">
              <span>Made with</span>
              <Heart size={16} className="text-pink-500 fill-pink-500" />
              <span>for comfort seekers</span>
            </div>
            <a
              href="https://wa.me/message/ZS4AVDIPSYGDO1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:from-green-500 hover:to-emerald-600 transition-all duration-200"
            >
              <MessageCircle size={20} />
              Contact us on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 tracking-wide transition-colors duration-300">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-300"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-300"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-300"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 tracking-wide transition-colors duration-300">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  type="button"
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-300 text-left"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-300 text-left"
                >
                  Shipping Info
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-300 text-left"
                >
                  Returns
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-600 text-sm transition-colors duration-300">
          <p className="transition-colors duration-300">© {new Date().getFullYear()} CosyHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-pink-600 transition-colors duration-300"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-pink-600 transition-colors duration-300"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="hover:text-pink-600 transition-colors duration-300"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
