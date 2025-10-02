import { Button } from "./ui/Button";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

const TYPING_TEXTS = [
  "career choices?",
  "your future path?",
  "what career to pick?",
  "which skills to learn?",
];

const GRADIENT_CLASSES = [
  "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent",
  "bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent",
  "bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent",
  "bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent",
];

gsap.registerPlugin(TextPlugin);

export function HeroSection() {

  const textRef = useRef(null);
  const octopusRef = useRef(null);
  const [octopusColor, setOctopusColor] = useState("#6366F1");

  const colorOptions = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Green", value: "#10B981" },
    { name: "Orange", value: "#F97316" },
    { name: "Red", value: "#EF4444" },
  ];

  // Typing text effect
  useEffect(() => {
    if (!textRef.current) return;
    const tl = gsap.timeline({ repeat: -1 });
    TYPING_TEXTS.forEach((text, index) => {
      tl.set(textRef.current, {
        scale: 0.95,
        opacity: 0.7,
        className: GRADIENT_CLASSES[index],
      });
      tl.to(textRef.current, {
        duration: 1.5,
        text,
        scale: 1,
        opacity: 1,
        ease: "power3.out",
      });
      tl.to({}, { duration: 1.2 });
  if (index < TYPING_TEXTS.length - 1) {
        tl.to(textRef.current, {
          duration: 0.8,
          text: "",
          scale: 0.95,
          opacity: 0.7,
          ease: "power3.in",
        });
      }
    });
    return () => tl.kill();
  }, []);

  // Octopus animation
  useEffect(() => {
    if (!octopusRef.current) return;

    // Floating effect
    gsap.to(octopusRef.current, {
      y: -20,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Tentacle wave animation
    const tentacles = octopusRef.current.querySelectorAll(".tentacle");
    tentacles.forEach((tentacle, i) => {
      gsap.to(tentacle, {
        duration: 3 + i * 0.5,
        attr: { d: tentacle.getAttribute("d") }, // reset path
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        motionPath: {
          path: tentacle.getAttribute("d"),
          autoRotate: false,
        },
      });
    });
  }, []);

  const handleColorChange = (color) => {
    setOctopusColor(color);
  };

  return (
    <section className="relative bg-background py-20 md:py-32 lg:py-40 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row items-center justify-between w-full">
        
        {/* Left content */}
        <div className="text-center md:text-left md:w-1/2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 md:mb-10">
            Struggling with{" "}
            <span className="text-primary block sm:inline mt-2 sm:mt-0 min-h-[1.2em]">
              <span ref={textRef} className="inline-block"></span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4">
            We're here to guide you.
          </p>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            Personalized roadmaps, mentorship & AI-powered chatbots to lead your way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">Explore Your Path</Button>
          </div>
        </div>

        {/* Right octopus + picker */}
        <div className="hidden md:flex flex-col items-center md:w-1/2 relative">
          {/* Octopus */}
          <svg
            ref={octopusRef}
            viewBox="0 0 300 300"
            className="drop-shadow-lg w-64 h-64 lg:w-80 lg:h-80"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="octoGradient" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor={octopusColor} stopOpacity="0.9" />
                <stop offset="80%" stopColor={octopusColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={octopusColor} stopOpacity="0.1" />
              </radialGradient>
              <linearGradient id="tentacleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={octopusColor} stopOpacity="0.6" />
                <stop offset="100%" stopColor={octopusColor} stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Body */}
            <ellipse
              className="octopus-body"
              cx="150"
              cy="120"
              rx="70"
              ry="55"
              fill="url(#octoGradient)"
              filter="url(#glow)"
            />

            {/* Eyes */}
            <circle cx="135" cy="110" r="10" fill="white" opacity="0.9" />
            <circle cx="165" cy="110" r="10" fill="white" opacity="0.9" />
            <circle cx="137" cy="108" r="5" fill="black" opacity="0.9" />
            <circle cx="167" cy="108" r="5" fill="black" opacity="0.9" />

            {/* Tentacles */}
            <path
              className="tentacle"
              d="M120 160 Q100 190 110 240 Q120 270 90 290"
              stroke="url(#tentacleGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <path
              className="tentacle"
              d="M150 170 Q150 200 140 250 Q135 280 160 300"
              stroke="url(#tentacleGradient)"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <path
              className="tentacle"
              d="M180 160 Q200 190 190 240 Q180 270 210 290"
              stroke="url(#tentacleGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
            />
          </svg>

          {/* Color Picker */}
          <div className="absolute bottom-0 right-0">
            <div className="bg-black/70 backdrop-blur-md rounded-lg p-3 shadow-lg grid grid-cols-6 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.value)}
                  className={`w-6 h-6 rounded hover:scale-110 transition-transform ${
                    octopusColor === color.value ? "ring-2 ring-white" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
