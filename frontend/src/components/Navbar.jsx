import { Link, useLocation } from 'react-router-dom';
import { Button } from "./ui/Button";
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuItemsRef = useRef([]);

  const handleLogout = () => {
    logout();
  };
  
  const toggleMobileMenu = () => {
    console.log('Toggle mobile menu clicked', !mobileMenuOpen);
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Helper function to check if a path is active
  const isActiveLink = (path) => {
    // For regular routes
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path.startsWith('/')) {
      return location.pathname.startsWith(path);
    }
    
    // For anchor links (like #about, #blogs)
    if (path.startsWith('#')) {
      // Check if we're on the homepage and the hash matches
      return location.pathname === '/' && location.hash === path;
    }
    
    return false;
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

  // Listen for hash changes to update active link state
  useEffect(() => {
    const handleHashChange = () => {
      // Force a re-render when hash changes
      setMobileMenuOpen(mobileMenuOpen);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [mobileMenuOpen]);
  
  // GSAP animation for mobile menu
  useEffect(() => {
    if (!mobileMenuRef.current) return;
    
    if (mobileMenuOpen) {
      // Open animation for container
      gsap.to(mobileMenuRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out'
      });
      
      // Animate menu items from right to center
      menuItemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(item,
            { 
              x: 100, // Start from right
              opacity: 0 
            },
            { 
              x: 0, // Move to center
              opacity: 1, 
              duration: 0.6,
              delay: 0.2 + (index * 0.08),
              ease: 'back.out(1.2)' // Smooth overshoot effect
            }
          );
        }
      });
    } else {
      // Reset menu items position immediately
      menuItemsRef.current.forEach((item) => {
        if (item) {
          gsap.set(item, { clearProps: 'all' });
        }
      });
      
      // Close animation for container
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    }
  }, [mobileMenuOpen]);

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
                href="/about" 
                className={getLinkClasses('/about')}
              >
                About
              </a>
              <a 
                href="/blogs" 
                className={getLinkClasses('/blogs')}
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
              {isAuthenticated && (
                <Link 
                  to="/profile" 
                  className={getLinkClasses('/profile')}
                >
                  Profile
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
          <div className="md:hidden z-50">
            <button 
              type="button"
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white relative z-50"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        ref={mobileMenuRef} 
        className={`md:hidden fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-sm shadow-lg border-b border-slate-700 overflow-hidden z-40`}
        style={{ 
          height: mobileMenuOpen ? 'auto' : 0, 
          opacity: mobileMenuOpen ? 1 : 0, 
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      >
        <div className="px-4 py-6 space-y-4">
          <Link 
            to="/" 
            className={getLinkClasses('/', 'block py-2 text-base md:text-lg font-medium')}
            onClick={toggleMobileMenu}
            ref={(el) => (menuItemsRef.current[0] = el)}
          >
            Home
          </Link>
          <a 
            href="/about" 
            className={getLinkClasses('/about', 'block py-2 text-base md:text-lg font-medium')}
            onClick={toggleMobileMenu}
            ref={(el) => (menuItemsRef.current[1] = el)}
          >
            About
          </a>
          <a 
            href="/blogs" 
            className={getLinkClasses('/blogs', 'block py-2 text-base md:text-lg font-medium')}
            onClick={toggleMobileMenu}
            ref={(el) => (menuItemsRef.current[2] = el)}
          >
            Blogs
          </a>
          {isAuthenticated && (
            <Link 
              to="/dashboard" 
              className={getLinkClasses('/dashboard', 'block py-2 text-base md:text-lg font-medium')}
              onClick={toggleMobileMenu}
              ref={(el) => (menuItemsRef.current[3] = el)}
            >
              Dashboard
            </Link>
          )}
          
          <div className="pt-4 border-t border-slate-700 mt-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Welcome, {user?.name || 'User'}!
                </p>
                <Button variant="outline" onClick={() => { handleLogout(); toggleMobileMenu(); }} className="w-full transition-all duration-200 hover:shadow-md">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" onClick={toggleMobileMenu} className="w-full block">
                  <Button variant="ghost" className="w-full transition-all duration-200 hover:bg-accent hover:text-accent-foreground">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={toggleMobileMenu} className="w-full block">
                  <Button className="w-full transition-all duration-200 hover:shadow-md">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
  
  
}