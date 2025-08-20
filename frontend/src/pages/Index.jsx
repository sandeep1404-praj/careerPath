import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import RoadmapPreviewSection from "@/components/RoadmapPreviewSection";
import BlogSection from "@/components/BlogSection";
import CTASection from "@/components/CTASection";
import ChatbotButton from "@/components/ChatbotButton";
// import Footer from "@/components/Footer";
// import { Navbar } from "../components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RoadmapPreviewSection />
      <BlogSection />
      <CTASection />
      <ChatbotButton />
    </div>
  );
};

export default Index; 