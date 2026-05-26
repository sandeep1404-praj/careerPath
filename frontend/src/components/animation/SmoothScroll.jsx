import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/utils/lenis";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotionQuery.matches) {
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.045,
      smoothWheel: true,
      smoothTouch: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      gestureOrientation: "vertical",
      syncTouch: true,
      syncTouchLerp: 0.08,
      touchInertiaMultiplier: 28,
    });

    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    let frameId = null;
    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    const handleReduceMotionChange = (event) => {
      if (event.matches) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    if (reduceMotionQuery.addEventListener) {
      reduceMotionQuery.addEventListener("change", handleReduceMotionChange);
    } else {
      reduceMotionQuery.addListener(handleReduceMotionChange);
    }

    return () => {
      if (reduceMotionQuery.removeEventListener) {
        reduceMotionQuery.removeEventListener("change", handleReduceMotionChange);
      } else {
        reduceMotionQuery.removeListener(handleReduceMotionChange);
      }

      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
