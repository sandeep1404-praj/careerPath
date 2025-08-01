import { Link, useLocation } from 'react-router-dom';
import { Button } from "./ui/Button";
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Helper function to check if a path is active
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to get link classes with active state
  const getLinkClasses = (path, baseClasses = "transition-colors relative") => {
    const isActive = isActiveLink(path);
    return `${baseClasses} ${
      isActive 
        ? 'text-primary after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:content-[""]' 
        : 'text-muted-foreground hover:text-primary'
    }`;
  };

  return (
    <nav className="w-full border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-foreground">CareerCompass</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                to="/" 
                className={getLinkClasses('/')}
              >
                Home
              </Link>
              <a 
                href="#about" 
                className="text-muted-foreground hover:text-primary transition-colors relative"
              >
                About
              </a>
              <a 
                href="#blogs" 
                className="text-muted-foreground hover:text-primary transition-colors relative"
              >
                Blogs
              </a>
              {isAuthenticated && (
                <Link 
                  to="/dashboard" 
                  className={getLinkClasses('/dashboard')}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Login/Signup Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.name || 'User'}!
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}