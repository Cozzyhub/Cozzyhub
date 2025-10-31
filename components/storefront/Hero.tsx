"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Truck, Shield, IndianRupee } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24 px-6">
      <div className="section-container">
        <div className="text-center relative z-10">
          {/* Hero Headline */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight tracking-wide text-gray-900 mb-6">
            Welcome to{" "}
            <span className="block mt-2 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              CosyHub
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Your cozy corner for comfort and style. Discover curated collections
            built on trust, warmth, and luxury.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="group w-full sm:w-auto px-8 py-4 btn-primary rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/40"
              >
                Shop Now
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </motion.button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full sm:w-auto px-8 py-4 btn-ghost rounded-2xl"
              >
                Explore Collection
              </motion.button>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card rounded-2xl p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <Truck size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-gray-900 font-semibold text-base">
                  Free Delivery
                </p>
                <p className="text-gray-600 text-sm">
                  On all orders
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card rounded-2xl p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <IndianRupee size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-gray-900 font-semibold text-base">
                  Cash on Delivery
                </p>
                <p className="text-gray-600 text-sm">
                  Pay at doorstep
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card rounded-2xl p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <Shield size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-gray-900 font-semibold text-base">
                  Secure Shopping
                </p>
                <p className="text-gray-600 text-sm">
                  100% protected
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Subtle ambient glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-50/30 via-purple-50/30 to-blue-50/30" />
    </section>
  );
}
