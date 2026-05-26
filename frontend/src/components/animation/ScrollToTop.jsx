import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '@/utils/lenis';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3)
    });
  }, [pathname]);

  return null;
}
