import { Calendar, ArrowRight, Clock, Eye, Heart } from "lucide-react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const BlogSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation(0.1);

  const blogs = [
    {
      title: "10 In-Demand Skills for 2024 Tech Jobs",
      description: "Discover the technologies and skills that employers are actively seeking in today's competitive job market.",
      image:"https://bernardmarr.com/wp-content/uploads/2022/08/The-Top-10-Most-In-Demand-Skills-For-The-Next-10-Years-1.png",
      date: "Dec 15, 2023",
      readTime: "5 min read",
      category: "Career Tips",
      views: "2.4k",
      likes: "156"
    },
    {
      title: "From Tier 3 City to Tech Giant: Success Stories",
      description: "Inspiring journeys of students who transformed their careers using structured learning paths and mentorship.",
      image: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d06f41fb-6f44-436e-97ef-546e42b5d0e5/dgg5th2-e96d3e43-28c2-469b-9cb9-22da244bf907.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2QwNmY0MWZiLTZmNDQtNDM2ZS05N2VmLTU0NmU0MmI1ZDBlNVwvZGdnNXRoMi1lOTZkM2U0My0yOGMyLTQ2OWItOWNiOS0yMmRhMjQ0YmY5MDcuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.cOb1X6edBJwcVMlLorbpQHk2XXNDdsQpq_X7ynz6LA8",
      date: "Dec 12, 2023",
      readTime: "8 min read",
      category: "Success Stories",
      views: "3.1k",
      likes: "234"
    },
    {
      title: "Government Job Preparation: A Complete Guide",
      description: "Everything you need to know about preparing for government exams, from strategy to time management.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      date: "Dec 10, 2023",
      readTime: "6 min read",
      category: "Government Exams",
      views: "1.8k",
      likes: "98"
    }
  ];

  return (
    <section id="blogs" className="py-24 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Explore{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Knowledge
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with the latest career insights, success stories, and expert guidance
          </p>
        </div>

        {/* Blog Cards */}
        <div 
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {blogs.map((blog, index) => (
            <article 
              key={index} 
              className={`bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-1200 ease-elastic group hover:-translate-y-3 hover:scale-105 ${
                sectionVisible 
                  ? 'scale-100 opacity-100' 
                  : 'scale-90 opacity-0'
              }`}
              style={{
                transitionDelay: `${index * 300}ms`
              }}
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {blog.category}
                  </span>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-4 right-4 flex items-center gap-4 text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                    <Eye className="w-3 h-3" />
                    {blog.views}
                  </div>
                  <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                    <Heart className="w-3 h-3" />
                    {blog.likes}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {blog.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-purple-400" />
                    {blog.readTime}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
                  {blog.title}
                </h3>
                <p className="text-muted-foreground mb-6 line-clamp-3 group-hover:text-gray-300 transition-colors duration-300">
                  {blog.description}
                </p>

                <button className="btn btn-ghost text-primary hover:text-primary-dark font-medium transition-all duration-500 ease-smooth hover:scale-105 group/btn">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* View All Blogs CTA */}
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
          <button className="btn btn-outline w-full max-w-md border-2 border-slate-600 hover:border-blue-400 text-gray-300 hover:text-white py-4 rounded-xl font-semibold transition-all duration-500 ease-smooth group-hover:bg-blue-500/10 hover:scale-105 shadow-lg hover:shadow-blue-500/20">
            View All Articles
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;