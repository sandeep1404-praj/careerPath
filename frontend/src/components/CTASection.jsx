import { ArrowRight, Sparkles, Shield, Clock, Users } from "lucide-react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const CTASection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation(0.1);

  return (
    <section className="relative py-24 bg-slate-950 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div 
        ref={sectionRef}
        className="relative z-10 max-w-6xl mx-auto px-6 text-center"
      >
        {/* Icon */}
        <div 
          className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-8 shadow-lg shadow-blue-500/25 transition-all duration-300 ease-bounce ${
            sectionVisible 
              ? 'scale-100 opacity-100' 
              : 'scale-90 opacity-0'
          }`}
          style={{
            transitionDelay: '500ms'
          }}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        {/* Headline */}
        <h2 
          className={`text-5xl md:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-300 ease-smooth ${
            sectionVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-10 opacity-0'
          }`}
          style={{
            transitionDelay: '700ms'
          }}
        >
          Not sure where to{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            begin?
          </span>
        </h2>
        
        {/* Subheadline */}
        <p 
          className={`text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-300 ease-smooth ${
            sectionVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-10 opacity-0'
          }`}
          style={{
            transitionDelay: '1000ms'
          }}
        >
          Let us guide you through personalized assessments and create the perfect roadmap for your career journey.
        </p>
        
        
        {/* CTA Buttons */}
        <div 
          className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 transition-all duration-300 ease-smooth ${
            sectionVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-10 opacity-0'
          }`}
          style={{
            transitionDelay: '1200ms'
          }}
        >
                      <button className="btn btn-primary btn-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 ease-bounce hover:-translate-y-1 hover:scale-105">
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          
                      <button className="btn btn-outline btn-lg border-2 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ease-smooth hover:-translate-y-1 hover:scale-105">
            Talk to Our Experts
          </button>
        </div>
        
        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Free",
              description: "No credit card required",
              color: "blue",
              delay: 1500
            },
            {
              icon: Clock,
              title: "24/7 AI Support",
              description: "Available anytime you need help",
              color: "purple",
              delay: 1800
            },
            {
              icon: Users,
              title: "Expert Industry Mentors",
              description: "Learn from professionals",
              color: "green",
              delay: 2100
            }
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={index}
                className={`bg-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-blue-400/50 transition-all duration-300 ease-elastic hover:-translate-y-2 hover:scale-105 ${
                  sectionVisible 
                    ? 'scale-100 opacity-100' 
                    : 'scale-90 opacity-0'
                }`}
                style={{
                  transitionDelay: `${item.delay}ms`
                }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-${item.color}-500/20 rounded-xl mb-4`}>
                  <IconComponent className={`w-8 h-8 text-${item.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CTASection;