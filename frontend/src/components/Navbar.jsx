import { Link, useLocation } from 'react-router-dom';
import { Button } from "./ui/Button";
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import dashIconApng from '../assets/Cube 3d.svg';
import dashIconGif from '../assets/Cube 3d.gif';
import gsap from 'gsap';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuItemsRef = useRef([]);
  const dashButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  // dashboard icon menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [dashIconSrc, setDashIconSrc] = useState(dashIconApng);
  
  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  const navbarRef = useRef(null);
  const logoRef = useRef(null);
  const welcomeRef = useRef(null);

  const handleDashEnter = () => {
    setDashIconSrc(dashIconGif);
    setMenuOpen(true);
  };
  const handleDashLeave = () => {
    setDashIconSrc(dashIconApng);
  };

  const handleMenuAreaLeave = () => {
    setMenuOpen(false);
    setDashIconSrc(dashIconApng);
  };

  // Scroll effect to shrink navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const shouldShrink = scrollPosition > 50;
      
      if (shouldShrink !== isScrolled) {
        setIsScrolled(shouldShrink);
        
        if (navbarRef.current) {
          if (shouldShrink) {
            // Shrink navbar with margin - 60% width centered
            gsap.to(navbarRef.current, {
              width: '60vw',
              marginLeft: '20vw',
              marginRight: '20vw',
              borderRadius: '24px',
              marginTop: '12px',
              duration: 0.5,
              ease: 'power2.out'
            });
          } else {
            // Expand navbar to full width
            gsap.to(navbarRef.current, {
              width: '100%',
              marginLeft: '0',
              marginRight: '0',
              borderRadius: '0px',
              marginTop: '0px',
              duration: 0.5,
              ease: 'power2.out'
            });
          }
        }
        
        // Animate logo text
        if (logoRef.current) {
          if (shouldShrink) {
            gsap.to(logoRef.current, {
              opacity: 0,
              duration: 0.2,
              ease: 'power2.in',
              onComplete: () => {
                if (logoRef.current) {
                  logoRef.current.textContent = 'CP';
                  gsap.to(logoRef.current, {
                    opacity: 1,
                    duration: 0.2,
                    ease: 'power2.out'
                  });
                }
              }
            });
          } else {
            gsap.to(logoRef.current, {
              opacity: 0,
              duration: 0.2,
              ease: 'power2.in',
              onComplete: () => {
                if (logoRef.current) {
                  logoRef.current.textContent = 'CareerPath';
                  gsap.to(logoRef.current, {
                    opacity: 1,
                    duration: 0.2,
                    ease: 'power2.out'
                  });
                }
              }
            });
          }
        }
        
        // Animate welcome message
        if (welcomeRef.current) {
          if (shouldShrink) {
            gsap.to(welcomeRef.current, {
              opacity: 0,
              width: 0,
              marginRight: 0,
              duration: 0.3,
              ease: 'power2.in'
            });
          } else {
            gsap.to(welcomeRef.current, {
              opacity: 1,
              width: 'auto',
              marginRight: '1rem',
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // animate dashboard dropdown with GSAP
  useEffect(() => {
    if (!dropdownRef.current || !dashButtonRef.current) return;

    if (menuOpen) {
      gsap.killTweensOf(dropdownRef.current);
      gsap.fromTo(dropdownRef.current, { y: -8, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.22, ease: 'power3.out' });
      gsap.to(dashButtonRef.current, { rotate: 6, scale: 1.03, duration: 0.18, ease: 'power2.out' });
    } else {
      gsap.to(dropdownRef.current, { y: -8, opacity: 0, scale: 0.98, duration: 0.16, ease: 'power2.in' });
      gsap.to(dashButtonRef.current, { rotate: 0, scale: 1, duration: 0.18, ease: 'power2.in' });
    }
  }, [menuOpen]);

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

  // Close user menu on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <nav className="w-full sticky top-0 z-50">
      <div 
        ref={navbarRef}
        className="border-b bg-background/80 backdrop-blur-sm"
        style={{ 
          width: '100%',
          borderRadius: '0px',
          marginTop: '0px',
          marginLeft: '0',
          marginRight: '0',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex-shrink-0">
              <span ref={logoRef} className="text-2xl font-bold text-foreground">CareerPath</span>
            </Link>
          </div>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-baseline space-x-8">
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
              <Link 
                to="/roadmaps" 
                className={getLinkClasses('/roadmaps')}
              >
                Roadmaps
              </Link>
              
            </div>
          </div>

          {/* Login/Signup Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                

                <div className="relative" ref={menuRef}>
                  <button
                    ref={dashButtonRef}
                    onClick={() => setMenuOpen((s) => !s)}
                    className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                    onMouseEnter={handleDashEnter}
                    onMouseLeave={handleDashLeave}
                    onFocus={handleDashEnter}
                    onBlur={handleDashLeave}
                  >
                    <img src={dashIconSrc} alt="dashboard menu" className="w-8 h-8 object-contain" />
                  </button>

                  {/* Dropdown */}
                  <div
                    ref={dropdownRef}
                    className={`absolute right-0 mt-2 w-40 bg-background/70 rounded shadow-lg py-1 z-50 backdrop-blur-sm ${menuOpen ? 'block' : 'hidden'}`}
                    role="menu"
                    aria-label="User menu"
                  >
                    <Link to="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-slate-700" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-slate-700" onClick={() => setMenuOpen(false)}>Settings</Link>
                  </div>
                </div>

                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">Login</Button></Link>
                <Link to="/signup"><Button>Sign Up</Button></Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-auto">
            <button 
              type="button"
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
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
          <Link 
            to="/roadmaps" 
            className={getLinkClasses('/roadmaps', 'block py-2 text-base md:text-lg font-medium')}
            onClick={toggleMobileMenu}
            ref={(el) => (menuItemsRef.current[3] = el)}
          >
            Roadmaps
          </Link>
          {isAuthenticated && (
            <>
              
              <Link
                to="/profile"
                className={getLinkClasses('/profile', 'block py-2 text-base md:text-lg font-medium')}
                onClick={toggleMobileMenu}
                ref={(el) => (menuItemsRef.current[5] = el)}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className={getLinkClasses('/settings', 'block py-2 text-base md:text-lg font-medium')}
                onClick={toggleMobileMenu}
                ref={(el) => (menuItemsRef.current[6] = el)}
              >
                Settings
              </Link>
            </>
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