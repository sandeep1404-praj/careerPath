import { Bot, Map, CheckSquare, Users, BarChart3 } from "lucide-react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const FeaturesSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation(0.1);

  const features = [
    {
      icon: Map,
      title: "Personalized Career Roadmaps",
      description: "Get step-by-step guidance tailored to your skills, interests, and career goals. Our AI analyzes your profile to create the perfect learning path.",
      color: "from-blue-500 to-purple-600",
      direction: "left"
    },
    {
      icon: Bot,
      title: "AI Chatbot for Doubts",
      description: "24/7 intelligent support for all your career questions. Get instant answers, clarifications, and guidance whenever you need it.",
      color: "from-purple-500 to-pink-600",
      direction: "right"
    },
    {
      icon: CheckSquare,
      title: "Task-based Learning",
      description: "Break down complex skills into manageable weekly tasks. Track your progress and build confidence with practical, hands-on projects.",
      color: "from-green-500 to-teal-600",
      direction: "left"
    },
    {
      icon: Users,
      title: "Expert Mentorship Sessions",
      description: "Connect with industry professionals who've walked your path. Get personalized advice, portfolio reviews, and interview preparation.",
      color: "from-orange-500 to-red-600",
      direction: "right"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Visualize your journey with detailed analytics. See your strengths, identify areas for improvement, and celebrate your achievements.",
      color: "from-indigo-500 to-blue-600",
      direction: "bottom"
    }
  ];

  const getAnimationClass = (direction, index) => {
    if (!sectionVisible) {
      return 'opacity-0 scale-75 blur-md';
    }
    return 'opacity-100 scale-100 blur-0';
  };

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Core{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to accelerate your career journey, all in one intelligent platform
          </p>
        </div>

        {/* Features Grid */}
        <div 
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className={`bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-700 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 ease-smooth group h-full hover:scale-105 ${getAnimationClass(feature.direction, index)}`}
                style={{
                  transitionDelay: `${index * 200}ms`
                }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-150 ease-bounce shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-150">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-150">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;