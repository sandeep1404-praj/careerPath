import { Button } from "./ui/Button";
import { TypingAnimation } from "./ui/TypingAnimation";

export function HeroSection() {
  const typingTexts = [
    "career choices?",
    "your future path?",
    "what career to pick?",
    "which skills to learn?"
  ];

  return (
    <section className="relative bg-background py-32 lg:py-40 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-center w-full">
          <h1 className="text-4xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-10" style={{height: "117px"}}>
            Struggling with{" "}
            <span className="text-primary block sm:inline mt-2 sm:mt-0">
              <TypingAnimation
                texts={typingTexts}
                speed={80}
                deleteSpeed={60}
                delayBetweenTexts={1500}
              />
            </span>
          </h1>

          <div className="space-y-6 mb-12">
            <p
              className="text-xl sm:text-2xl text-muted-foreground opacity-0 animate-fade-in-up max-w-3xl mx-auto"
              style={{ animationDelay: "1s", animationFillMode: "forwards" }}
            >
              We're here to guide you.
            </p>
            <p
              className="text-lg text-muted-foreground opacity-0 animate-fade-in-up max-w-3xl mx-auto"
              style={{ animationDelay: "1.5s", animationFillMode: "forwards" }}
            >
              Personalized roadmaps, mentorship & AI-powered chatbots to lead your way.
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up"
            style={{ animationDelay: "2s", animationFillMode: "forwards" }}
          >
            <Button size="lg" className="px-8 py-3 transform hover:scale-105 transition-all duration-200">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 transform hover:scale-105 transition-all duration-200">
              Explore Your Path
            </Button>
          </div>
        </div>
      </div>

      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/10 opacity-20 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 opacity-30 animate-pulse-slow"></div>
      </div>
    </section>
  );
}
export default HeroSection;