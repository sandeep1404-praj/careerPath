import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    setShowText(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setShowText(false);
    }, 1400); // smooth duration

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center 
                       bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Top wave */}
            <motion.svg
              className="absolute top-0 left-0 w-full h-1/2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <path
                fill="#4c1d95" // deep purple
                d="M0,160L48,144C96,128,192,96,288,80C384,64,480,64,576,101.3C672,139,768,213,864,229.3C960,245,1056,203,1152,192C1248,181,1344,203,1392,213.3L1440,224L1440,0L0,0Z"
              />
            </motion.svg>

            {/* Bottom wave */}
            <motion.svg
              className="absolute bottom-0 left-0 w-full h-1/2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <path
                fill="#1f2937" // slate gray (dark, but not pure black)
                d="M0,64L40,90.7C80,117,160,171,240,186.7C320,203,400,181,480,165.3C560,149,640,139,720,160C800,181,880,235,960,229.3C1040,224,1120,160,1200,122.7C1280,85,1360,75,1400,69.3L1440,64L1440,320L0,320Z"
              />
            </motion.svg>

            {/* Center text */}
            {showText && (
              <motion.div
                className="absolute z-10 text-4xl md:text-6xl font-bold 
                           bg-gradient-to-r from-cyan-400 to-blue-500 
                           bg-clip-text text-transparent"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: { duration: 0.5, delay: 0.5 },
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                  transition: { duration: 0.3 },
                }}
              >
                Career Compass
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content fade-in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageTransition;
