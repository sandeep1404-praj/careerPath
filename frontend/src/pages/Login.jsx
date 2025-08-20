import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { BiHide } from 'react-icons/bi';
import { AiOutlineEye } from 'react-icons/ai';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Unable to connect to server. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8 bg-gray-800 rounded-xl shadow-lg p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link to="/signup" className="text-primary hover:underline">
              create a new account
            </Link>
          </p>
        </motion.div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded">{error}</div>}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md pr-10 focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                  >
                  {/* {showPassword ? <BiHide/> : <AiOutlineEye/>} */}
                  {showPassword ? <AiOutlineEye/> :<BiHide/> }
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <Link to="/forgot-password" className="hover:text-white">Forgot your password?</Link>
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
