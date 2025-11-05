"use client";

import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Instagram,
  Github,
  Twitter,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/lib/contexts/ToastContext";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Successfully subscribed to newsletter!");
        setEmail("");
      } else if (res.status === 409) {
        toast.info("Email already subscribed");
      } else {
        toast.error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="backdrop-blur-xl bg-white/95 border-t border-gray-200 mt-auto transition-colors duration-300">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              CozzyHub
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

          {/* Newsletter */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 tracking-wide transition-colors duration-300">
              Newsletter
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Subscribe for deals and new arrivals
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm disabled:opacity-50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition font-semibold text-sm disabled:opacity-50"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
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
          <p className="transition-colors duration-300">
            © {new Date().getFullYear()} CozzyHub. All rights reserved.
          </p>
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
