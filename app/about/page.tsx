import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { Heart, ShoppingBag, Truck, Shield, Users, Award } from "lucide-react";

export const metadata = {
  title: "About Us - CozzyHub",
  description:
    "Learn about CozzyHub, your cozy corner for comfort and style. Discover our mission, values, and commitment to quality.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              CozzyHub
            </span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Your trusted destination for quality products that bring comfort,
            style, and joy to your everyday life.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                CozzyHub was founded with a simple vision: to create a space
                where quality meets comfort, and style meets affordability. We
                believe that everyone deserves access to products that make
                their lives better.
              </p>
              <p>
                What started as a small collection has grown into a carefully
                curated marketplace featuring products across multiple
                categories - from ethnic wear and fashion to home essentials and
                electronics.
              </p>
              <p>
                We're passionate about bringing you the best products at the
                best prices, delivered right to your doorstep with care and
                convenience.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl aspect-square flex items-center justify-center p-12">
              <ShoppingBag size={120} className="text-pink-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              These core principles guide everything we do at CozzyHub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="text-pink-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Customer First
              </h3>
              <p className="text-gray-600">
                Your satisfaction is our top priority. We're committed to
                providing excellent service and quality products.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Award className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Quality Guaranteed
              </h3>
              <p className="text-gray-600">
                Every product is carefully selected and vetted to ensure it
                meets our high standards of quality.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Users className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Community Focus
              </h3>
              <p className="text-gray-600">
                We believe in building lasting relationships with our customers
                and supporting our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">
            Why Choose CozzyHub?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We make shopping easy, safe, and enjoyable
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Truck className="text-green-600" size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Free Delivery
              </h3>
              <p className="text-gray-600">
                Enjoy free delivery on all orders. We bring quality right to
                your doorstep at no extra cost.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="text-yellow-600" size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cash on Delivery
              </h3>
              <p className="text-gray-600">
                Pay when you receive your order. Shop with confidence and
                convenience.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="text-blue-600" size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Secure Shopping
              </h3>
              <p className="text-gray-600">
                Your privacy and security are protected with industry-standard
                encryption and secure payment processing.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="text-pink-600" size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Curated Collection
              </h3>
              <p className="text-gray-600">
                Every product is handpicked with care to ensure quality, style,
                and value for money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6">
            Start Shopping Today
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Discover our complete collection of quality products. Your perfect
            find is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/products">
              <button
                type="button"
                className="px-8 py-4 btn-primary rounded-2xl"
              >
                Browse Products
              </button>
            </a>
            <a
              href="https://wa.me/message/ZS4AVDIPSYGDO1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button type="button" className="px-8 py-4 btn-ghost rounded-2xl">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
