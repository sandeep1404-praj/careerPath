import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState("signup"); // "signup" or "otp"

  const { signup, verifySignupOtp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await signup(
        formData.name,
        formData.email,
        formData.password
      );
      if (result.success) {
        setSuccess(result.message);
        setStep("otp");
      } else {
        setError(result.error);
      }
    } catch {
      setError("Unable to connect to server. Please try again later.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await verifySignupOtp(formData.email, formData.otp);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(result.error || "OTP verification failed");
      }
    } catch (err) {
      setError(
        err.message || "Unable to connect to server. Please try again later."
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-extrabold text-white"
        >
          {step === "signup" ? "Create an account" : "Verify Your Email"}
        </motion.h2>

        <AnimatePresence mode="wait">
          {step === "signup" ? (
            <motion.form
              key="signup-form"
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="mt-8 space-y-6 bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div>
                <label className="block text-sm text-gray-300">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-600/20 text-red-400 px-4 py-2 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-center text-gray-400"
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Login
                </Link>
              </motion.div>
            </motion.form>
          ) : (
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleVerifyOtp}
              className="mt-8 space-y-6 bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div>
                <label className="block text-sm text-gray-300">
                  Enter OTP sent to your email
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength="6"
                  className="mt-1 w-full px-4 py-3 text-center text-xl bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="000000"
                />
              </div>

              {error && (
                <div className="bg-red-600/20 text-red-400 px-4 py-2 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Signup;
