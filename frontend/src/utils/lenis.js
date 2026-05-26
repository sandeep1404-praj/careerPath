let lenisInstance = null;

export const setLenis = (instance) => {
  lenisInstance = instance;
};

export const getLenis = () => lenisInstance;

export const scrollToTop = (options = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, options);
    return;
  }

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
};
