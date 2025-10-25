import { Target, Users, TrendingUp, Award } from "lucide-react";
// import { useScrollAnimation } from "../hooks/useScrollAnimation";

const AboutSection = () => {
  // const [leftRef, leftVisible] = useScrollAnimation(0.1);
  // const [rightRef, rightVisible] = useScrollAnimation(0.2);
  

  const stats = [
    { icon: Target, value: "1000+", label: "Students Guided" },
    { icon: Users, value: "50+", label: "Career Paths" },
    { icon: TrendingUp, value: "85%", label: "Success Rate" },
    { icon: Award, value: "500+", label: "Mentors" }
  ];

  return (
    
    <section className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div 
            // ref={leftRef}
            // className={`
            //   transition-all duration-3000 ease-smooth
            //   opacity-100 translate-x-0
            //   lg:${leftVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
            // `}
            className={`
              transition-all duration-3000 ease-smooth
              opacity-100 translate-x-0
            `}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Bridging the{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Career Gap
              </span>
            </h2>
            
            
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                Students in Tier 2/3 cities often lack personalized career guidance, leaving them uncertain about their future paths. Traditional education systems fail to provide the practical roadmaps needed for today's dynamic job market.
              </p>
              
              <p>
                Our platform transforms this challenge into opportunity by providing AI-powered career guidance, expert mentorship, and structured learning paths tailored specifically for Indian students.
              </p>
              
              <p className="font-semibold text-foreground">
                Your success is our mission. Every roadmap, every lesson, every interaction is designed to accelerate your career journey.
              </p>
            </div>
          </div>

          {/* Right Stats Grid */}
          <div 
            // ref={rightRef}
            // className={`transition-all duration-1000 ease-smooth delay-500 ${
            //   rightVisible 
            //     ? 'translate-x-0 opacity-100' 
            //     : 'translate-x-full opacity-0'
            // }`}
            className={`transition-all duration-1000 ease-smooth delay-500 `}
          >
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={index} 
                    className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700 transition-all duration-700 ease-smooth hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105"
                    style={{
                      animationDelay: `${index * 200}ms`
                    }}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;