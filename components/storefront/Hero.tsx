"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Truck, Shield, IndianRupee } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              CosyHub
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto px-4">
            Your cozy corner for comfort and style. Discover handpicked products
            that make your space feel like home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Shop Now
                <ArrowRight
                  className="group-hover:translate-x-1 transition"
                  size={20}
                />
              </motion.button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="w-full sm:w-auto px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/30 transition-all"
              >
                Explore Collection
              </motion.button>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-indigo-500/30 rounded-xl p-4 flex items-center gap-3 shadow-lg hover:shadow-xl hover:border-indigo-500/50 transition-all"
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 flex items-center gap-3 shadow-lg hover:shadow-xl hover:border-purple-500/50 transition-all"
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-pink-500/30 rounded-xl p-4 flex items-center gap-3 shadow-lg hover:shadow-xl hover:border-pink-500/50 transition-all"
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
          </div>
        </div>
      </div>
      
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
    </div>
  );
}
