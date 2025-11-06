"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, User, Mail, Calendar, Shield } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_authorized: boolean;
  authorized_at: string | null;
  created_at: string;
}

export default function UserPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justAuthorized = searchParams.get("authorized") === "true";

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();

      // Check if user is logged in
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      // Fetch user profile
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError("Failed to load profile");
        setLoading(false);
        return;
      }

      // Check if user is authorized
      if (!data.is_authorized) {
        setError(
          "Your account is not yet authorized. Please check your email for the authorization link."
        );
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md text-center"
        >
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Authorization Required
          </h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
          >
            Go to Profile
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Authorization Success Banner */}
        {justAuthorized && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 backdrop-blur-xl bg-green-500/20 border border-green-500/50 rounded-2xl p-6 text-center"
          >
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white mb-2">
              🎉 Authorization Successful!
            </h2>
            <p className="text-green-200">
              Your account has been successfully authorized. Welcome to
              CozzyHub!
            </p>
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile?.full_name || "User"}
            </h1>
            <p className="text-purple-100">Welcome to your profile</p>
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-medium text-gray-300">Email</h3>
                </div>
                <p className="text-lg text-white">{profile?.email}</p>
              </div>

              {/* Authorization Status */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h3 className="text-sm font-medium text-gray-300">Status</h3>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-lg text-white">Authorized</p>
                </div>
              </div>

              {/* Authorized Date */}
              {profile?.authorized_at && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-medium text-gray-300">
                      Authorized On
                    </h3>
                  </div>
                  <p className="text-lg text-white">
                    {new Date(profile.authorized_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}

              {/* Member Since */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-medium text-gray-300">
                    Member Since
                  </h3>
                </div>
                <p className="text-lg text-white">
                  {new Date(profile?.created_at || "").toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => router.push("/")}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
              >
                Browse Products
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition"
              >
                View Orders
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
