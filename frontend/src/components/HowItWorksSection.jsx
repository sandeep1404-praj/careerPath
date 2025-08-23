import { Target, Route, CheckCircle, MessageSquare } from "lucide-react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const HowItWorksSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation(0.1);

  const steps = [
    {
      icon: Target,
      title: "Choose Your Goal",
      description: "Tell us about your interests, skills, and career aspirations. Our smart assessment will understand your unique profile.",
      step: "01"
    },
    {
      icon: Route,
      title: "Get Your Personalized Roadmap",
      description: "Receive a custom-tailored learning path with milestones, resources, and timelines designed just for you.",
      step: "02"
    },
    {
      icon: CheckCircle,
      title: "Complete Tasks Weekly",
      description: "Follow structured weekly tasks that build your skills progressively. Each task is designed to move you closer to your goal.",
      step: "03"
    },
    {
      icon: MessageSquare,
      title: "Chat with AI & Mentors",
      description: "Get support whenever you need it. Our AI chatbot and expert mentors are always ready to help you succeed.",
      step: "04"
    }
  ];

  return (
    <section className="py-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How It{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Simple steps to transform your career journey. Start today and see results in weeks.
          </p>
        </div>
        
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-slate-600 transform -translate-y-1/2"></div>
          
          <div 
            ref={sectionRef}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div 
                  key={index} 
                  className={`relative text-center group transition-all duration-300 ease-smooth ${
                    sectionVisible 
                      ? 'translate-x-0 opacity-100' 
                      : '-translate-x-full opacity-0'
                  }`}
                  style={{
                    transitionDelay: `${index * 400}ms`
                  }}
                >
                  {/* Card */}
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-12 pt-16 h-full transition-all duration-200 ease-smooth hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 relative">
                    {/* Step Number Circle - Positioned on top of card */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-lg font-bold z-10">
                        {step.step}
                      </div>
                    </div>
                    
                    {/* Icon Container */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-700 rounded-lg mb-10 transition-all duration-200 ease-bounce hover:scale-110">
                      <IconComponent className="w-10 h-10 text-blue-400 transition-colors duration-150" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-8 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed text-center transition-colors duration-150">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;