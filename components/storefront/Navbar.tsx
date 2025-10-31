"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useScrollPosition } from "@/lib/hooks/useScrollPosition";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  const scrollY = useScrollPosition();
  const scrolled = scrollY > 8;

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav
      className={`frosted-nav sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/98 shadow-lg"
          : "bg-white/90 shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="font-serif text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              CosyHub
            </motion.h1>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-pink-600 font-medium transition-colors duration-300"
            >
              Products
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-pink-600 font-medium transition-colors duration-300"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-pink-600 font-medium transition-colors duration-300"
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/search">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-pink-600 transition-colors duration-300"
                aria-label="Search"
              >
                <Search size={20} />
              </motion.button>
            </Link>

            <Link href="/cart">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-pink-600 transition-colors duration-300 relative"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
              </motion.button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-700 hover:text-pink-600 transition-colors duration-300"
                    aria-label="Profile"
                  >
                    <User size={20} />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 transition-colors duration-300"
                  aria-label="Logout"
                >
                  <LogOut size={20} />
                </motion.button>
              </div>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 btn-primary rounded-xl"
                >
                  Login
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
