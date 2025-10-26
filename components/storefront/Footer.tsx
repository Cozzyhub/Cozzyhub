import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="backdrop-blur-xl bg-white/5 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              CosyHub
            </h2>
            <p className="text-gray-400 mb-4 max-w-md">
              Your cozy corner for comfort and style. Discover handpicked
              products that make your space feel like home.
            </p>
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <span>Made with</span>
              <Heart size={16} className="text-pink-400 fill-pink-400" />
              <span>for comfort seekers</span>
            </div>
            <a
              href="https://wa.me/message/ZS4AVDIPSYGDO1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-lg"
            >
              <MessageCircle size={20} />
              Contact us on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-gray-400 hover:text-white transition"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-gray-400 hover:text-white transition"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-400 hover:text-white transition"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition text-left"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition text-left"
                >
                  Shipping Info
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition text-left"
                >
                  Returns
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} CosyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
