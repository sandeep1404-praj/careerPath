import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'

  const { signup, verifySignupOtp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await signup(formData.name, formData.email, formData.password);
      if (result.success) {
        setSuccess(result.message);
        setStep('otp');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Unable to connect to server. Please try again later.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await verifySignupOtp(formData.email, formData.otp);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(result.error || 'OTP verification failed');
      }
    } catch (error) {
      setError(error.message || 'Unable to connect to server. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {step === 'signup' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
            {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}
            <div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </div>
            <div className="text-sm text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">Login</Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP sent to your email
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                autoComplete="one-time-code"
                required
                value={formData.otp}
                onChange={handleChange}
                maxLength="6"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md text-center text-xl focus:ring-primary focus:border-primary"
                placeholder="000000"
              />
            </div>
            {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}
            <div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;

const verifySignupOtp = async (email, otp) => {
  try {
    const res = await fetch('/api/auth/verify-signup-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message || 'OTP verification failed' };
    }
  } catch (err) {
    return { success: false, error: 'Unable to connect to server. Please try again later.' };
  }
};