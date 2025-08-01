import { Code, Database, BookOpen, ArrowRight, Clock, Users } from "lucide-react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const RoadmapPreviewSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation(0.1);

  const roadmaps = [
    {
      icon: Code,
      title: "Web Development",
      description: "Full-stack development with React, Node.js, and modern technologies",
      duration: "6-8 months",
      students: "1,200+",
      skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "MongoDB"],
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Database,
      title: "Data Science",
      description: "Analytics, machine learning, and AI with Python and R",
      duration: "8-10 months",
      students: "850+",
      skills: ["Python", "Statistics", "SQL", "Machine Learning", "Visualization"],
      color: "from-green-500 to-teal-600"
    },
    {
      icon: BookOpen,
      title: "Government Exams",
      description: "Comprehensive preparation for UPSC, SSC, Banking, and more",
      duration: "12-18 months",
      students: "2,500+",
      skills: ["General Studies", "Current Affairs", "Mathematics", "Reasoning", "English"],
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Career{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Roadmaps
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover structured paths to your dream career. Each roadmap is crafted by industry experts.
          </p>
        </div>

        {/* Roadmap Cards */}
        <div 
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {roadmaps.map((roadmap, index) => {
            const IconComponent = roadmap.icon;
            return (
              <div 
                key={index} 
                className={`bg-slate-900 rounded-2xl shadow-lg border border-slate-700 overflow-hidden hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-700 ease-elastic group hover:-translate-y-2 hover:scale-105 ${
                  sectionVisible 
                    ? 'scale-100 opacity-100' 
                    : 'scale-90 opacity-0'
                }`}
                style={{
                  transitionDelay: `${index * 300}ms`
                }}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${roadmap.color} p-6 text-white relative overflow-hidden`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                          <Clock className="w-4 h-4" />
                          {roadmap.duration}
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                          <Users className="w-4 h-4" />
                          {roadmap.students}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3">{roadmap.title}</h3>
                    <p className="text-white/90 text-base leading-relaxed">{roadmap.description}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="p-8">
                  <h4 className="font-bold text-white mb-6 text-lg">Key Skills You'll Learn</h4>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {roadmap.skills.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex}
                        className="bg-slate-800 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 hover:border-blue-400/50 transition-colors duration-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* CTA */}
                  <button className="btn btn-outline w-full border-2 border-slate-600 hover:border-blue-400 text-gray-300 hover:text-white py-4 rounded-xl font-semibold transition-all duration-500 ease-smooth group-hover:bg-blue-500/10 hover:scale-105">
                    View Roadmap
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All CTA */}
        <div 
          className={`text-center transition-all duration-1200 ease-smooth ${
            sectionVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-10 opacity-0'
          }`}
          style={{
            transitionDelay: '900ms'
          }}
        >
          <button className="btn btn-primary btn-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
            Explore All Roadmaps
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RoadmapPreviewSection;