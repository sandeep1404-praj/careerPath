import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Link, NavLink } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <NavLink to = '/'>
                <h1 className="text-2xl font-bold text-gray-900">CareerCompass Dashboard</h1>
              </NavLink>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || 'User'}!</span>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.name || 'Not available'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.email || 'Not available'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link to="/profile" className="block text-sm text-blue-700 hover:text-blue-900">
                      Edit Profile
                    </Link>
                    <Link to="/settings" className="block text-sm text-blue-700 hover:text-blue-900">
                      Account Settings
                    </Link>
                    <Link to="/" className="block text-sm text-blue-700 hover:text-blue-900">
                      Back to Home
                    </Link>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Authentication Status</h3>
                  <p className="text-sm text-green-700 mb-2">
                    {user ? 'You are successfully logged in!' : 'Authentication status unknown'}
                  </p>
                  {user && (
                    <div className="text-xs text-green-600">
                      <p>• JWT Token: {user.token ? 'Valid' : 'Not available'}</p>
                      <p>• User ID: {user._id || 'Not available'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Connection Status */}
            {!user && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-900 mb-2">Connection Status</h3>
                <p className="text-sm text-yellow-700">
                  Unable to load user data. This might be due to:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                  <li>Backend server is not running</li>
                  <li>Database connection issues</li>
                  <li>Network connectivity problems</li>
                </ul>
                <div className="mt-3">
                  <Link to="/login">
                    <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-300">
                      Try Logging In Again
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 