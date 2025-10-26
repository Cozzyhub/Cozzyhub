"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Truck, Shield, IndianRupee } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CosyHub
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Your cozy corner for comfort and style. Discover handpicked products
            that make your space feel like home.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/products">
              <button
                type="button"
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-2"
              >
                Shop Now
                <ArrowRight
                  className="group-hover:translate-x-1 transition"
                  size={20}
                />
              </button>
            </Link>
            <Link href="/products">
              <button
                type="button"
                className="px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition"
              >
                Explore Collection
              </button>
            </Link>
          </motion.div>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-3 shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <Truck size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">
                  Free Delivery
                </p>
                <p className="text-gray-400 text-xs">On all orders</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-3 shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <IndianRupee size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">
                  Cash on Delivery
                </p>
                <p className="text-gray-400 text-xs">Pay at doorstep</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-3 shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Shield size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">
                  Secure Shopping
                </p>
                <p className="text-gray-400 text-xs">100% protected</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </div>
  );
}
