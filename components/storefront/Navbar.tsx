"use client";

import Link from "next/link";
import {
  ShoppingCart,
  User,
  Search,
  LogOut,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useScrollPosition } from "@/lib/hooks/useScrollPosition";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const scrollY = useScrollPosition();
  const scrolled = scrollY > 8;
  const shouldHide = scrollY > 400; // Hide after scrolling past hero

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Fetch cart count
      if (user) {
        const { data: cartItems } = await supabase
          .from("cart")
          .select("quantity")
          .eq("user_id", user.id);

        const total =
          cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(total);
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setCartCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav
      className={`frosted-nav sticky z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg" : "shadow-md"
      } ${
        shouldHide ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ top: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <motion.h1
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="font-serif text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent will-change-transform"
            >
              CozzyHub
            </motion.h1>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-pink-600 p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-pink-600 font-medium smooth-transition"
            >
              Products
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-pink-600 font-medium smooth-transition"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-pink-600 font-medium smooth-transition"
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/search">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="text-gray-700 hover:text-pink-600 smooth-transition p-2 rounded-lg hover:bg-pink-50 will-change-transform"
                aria-label="Search"
              >
                <Search size={20} />
              </motion.button>
            </Link>

            <Link href="/wishlist">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="text-gray-700 hover:text-pink-600 smooth-transition p-2 rounded-lg hover:bg-pink-50 will-change-transform"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </motion.button>
            </Link>

            <Link href="/cart">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="text-gray-700 hover:text-pink-600 smooth-transition relative p-2 rounded-lg hover:bg-pink-50 will-change-transform"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </motion.button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    className="text-gray-700 hover:text-pink-600 smooth-transition p-2 rounded-lg hover:bg-pink-50 will-change-transform"
                    aria-label="Profile"
                  >
                    <User size={20} />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 smooth-transition p-2 rounded-lg hover:bg-red-50 will-change-transform"
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
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="px-6 py-2 btn-primary will-change-transform"
                >
                  Login
                </motion.button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="flex flex-col gap-4">
              <Link
                href="/products"
                className="text-gray-700 hover:text-pink-600 font-medium px-4 py-2 hover:bg-pink-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-pink-600 font-medium px-4 py-2 hover:bg-pink-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-pink-600 font-medium px-4 py-2 hover:bg-pink-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/wishlist"
                className="text-gray-700 hover:text-pink-600 font-medium px-4 py-2 hover:bg-pink-50 rounded-lg transition flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={18} />
                Wishlist
              </Link>
              <Link
                href="/cart"
                className="text-gray-700 hover:text-pink-600 font-medium px-4 py-2 hover:bg-pink-50 rounded-lg transition flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart size={18} />
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-pink-600 font-medium px-4 py-2 hover:bg-pink-50 rounded-lg transition flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition text-left flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-white bg-gradient-to-r from-pink-500 to-purple-500 font-medium px-4 py-2 rounded-lg transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
