import React, { useState } from 'react';
import { User, MapPin, Calendar, Clock, CheckCircle, Circle, ArrowRight, Trophy, Target, Code, Database, Palette } from 'lucide-react';

const ProfileRoadmapPage = () => {
  const [user] = useState({
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    title: "Full Stack Developer",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    currentRoadmap: "Full Stack Web Development",
    completedProjects: 8,
    totalProjects: 15
  });

  const [roadmaps] = useState([
    {
      id: 1,
      name: "Full Stack Web Development",
      category: "Web Development",
      progress: 53,
      icon: Code,
      isActive: true,
      totalProjects: 15,
      completedProjects: 8,
      estimatedCompletion: "3 months"
    },
    {
      id: 2,
      name: "Data Science & Analytics",
      category: "Data Science",
      progress: 0,
      icon: Database,
      isActive: false,
      totalProjects: 12,
      completedProjects: 0,
      estimatedCompletion: "Not started"
    },
    {
      id: 3,
      name: "UI/UX Design",
      category: "Design",
      progress: 0,
      icon: Palette,
      isActive: false,
      totalProjects: 10,
      completedProjects: 0,
      estimatedCompletion: "Not started"
    }
  ]);

  const [projects] = useState([
    {
      id: 1,
      name: "HTML & CSS Fundamentals",
      description: "Master the basics of web markup and styling",
      status: "completed",
      difficulty: "Beginner",
      estimatedHours: 20,
      completedDate: "2024-02-15"
    },
    {
      id: 2,
      name: "JavaScript ES6+",
      description: "Learn modern JavaScript features and best practices",
      status: "completed",
      difficulty: "Beginner",
      estimatedHours: 30,
      completedDate: "2024-03-10"
    },
    {
      id: 3,
      name: "React Fundamentals",
      description: "Build interactive UIs with React components",
      status: "completed",
      difficulty: "Intermediate",
      estimatedHours: 40,
      completedDate: "2024-04-20"
    },
    {
      id: 4,
      name: "Node.js & Express",
      description: "Create backend APIs and server-side applications",
      status: "completed",
      difficulty: "Intermediate",
      estimatedHours: 35,
      completedDate: "2024-05-15"
    },
    {
      id: 5,
      name: "Database Design (SQL)",
      description: "Design and work with relational databases",
      status: "completed",
      difficulty: "Intermediate",
      estimatedHours: 25,
      completedDate: "2024-06-10"
    },
    {
      id: 6,
      name: "RESTful API Development",
      description: "Build scalable REST APIs with proper architecture",
      status: "completed",
      difficulty: "Intermediate",
      estimatedHours: 30,
      completedDate: "2024-07-05"
    },
    {
      id: 7,
      name: "Authentication & Security",
      description: "Implement user authentication and security best practices",
      status: "completed",
      difficulty: "Advanced",
      estimatedHours: 25,
      completedDate: "2024-07-30"
    },
    {
      id: 8,
      name: "React State Management",
      description: "Master Redux, Context API, and state management patterns",
      status: "completed",
      difficulty: "Advanced",
      estimatedHours: 30,
      completedDate: "2024-08-20"
    },
    {
      id: 9,
      name: "Testing & Quality Assurance",
      description: "Write unit tests, integration tests, and implement CI/CD",
      status: "in-progress",
      difficulty: "Advanced",
      estimatedHours: 35,
      progress: 60
    },
    {
      id: 10,
      name: "Cloud Deployment (AWS/Vercel)",
      description: "Deploy applications to cloud platforms",
      status: "pending",
      difficulty: "Advanced",
      estimatedHours: 25
    },
    {
      id: 11,
      name: "Performance Optimization",
      description: "Optimize frontend and backend performance",
      status: "pending",
      difficulty: "Advanced",
      estimatedHours: 30
    },
    {
      id: 12,
      name: "Microservices Architecture",
      description: "Design and implement microservices patterns",
      status: "pending",
      difficulty: "Expert",
      estimatedHours: 40
    },
    {
      id: 13,
      name: "GraphQL & Advanced APIs",
      description: "Implement GraphQL and advanced API patterns",
      status: "pending",
      difficulty: "Expert",
      estimatedHours: 35
    },
    {
      id: 14,
      name: "DevOps & Monitoring",
      description: "Set up monitoring, logging, and DevOps workflows",
      status: "pending",
      difficulty: "Expert",
      estimatedHours: 30
    },
    {
      id: 15,
      name: "Capstone Project",
      description: "Build a full-scale application showcasing all learned skills",
      status: "pending",
      difficulty: "Expert",
      estimatedHours: 60
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'in-progress':
        return 'text-blue-400';
      case 'pending':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-900/30 text-green-300';
      case 'Intermediate':
        return 'bg-yellow-900/30 text-yellow-300';
      case 'Advanced':
        return 'bg-orange-900/30 text-orange-300';
      case 'Expert':
        return 'bg-red-900/30 text-red-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };

  const completedProjects = projects.filter(p => p.status === 'completed');
  const inProgressProjects = projects.filter(p => p.status === 'in-progress');
  const pendingProjects = projects.filter(p => p.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-6">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-blue-500/30"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              <p className="text-xl text-gray-300 mt-1">{user.title}</p>
              <div className="flex items-center space-x-4 mt-3 text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400">{user.completedProjects}/{user.totalProjects}</div>
                <div className="text-sm text-gray-300">Projects Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Current Roadmap & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Roadmap */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-400" />
                Current Roadmap
              </h2>
              {roadmaps.filter(r => r.isActive).map(roadmap => {
                const IconComponent = roadmap.icon;
                return (
                  <div key={roadmap.id} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-900/30 rounded-lg">
                        <IconComponent className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{roadmap.name}</h3>
                        <p className="text-sm text-gray-400">{roadmap.category}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-blue-400 font-semibold">{roadmap.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${roadmap.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{roadmap.completedProjects} of {roadmap.totalProjects} projects</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {roadmap.estimatedCompletion}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Completed Projects</span>
                  <span className="text-green-400 font-bold">{completedProjects.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">In Progress</span>
                  <span className="text-blue-400 font-bold">{inProgressProjects.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Remaining</span>
                  <span className="text-orange-400 font-bold">{pendingProjects.length}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Hours Invested</span>
                    <span className="text-purple-400 font-bold">
                      {completedProjects.reduce((sum, project) => sum + project.estimatedHours, 0)}h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Roadmaps */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Available Roadmaps</h2>
              <div className="space-y-3">
                {roadmaps.filter(r => !r.isActive).map(roadmap => {
                  const IconComponent = roadmap.icon;
                  return (
                    <div key={roadmap.id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer">
                      <div className="p-2 bg-gray-600 rounded-lg">
                        <IconComponent className="w-4 h-4 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-200">{roadmap.name}</h4>
                        <p className="text-xs text-gray-400">{roadmap.totalProjects} projects</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Project */}
            {inProgressProjects.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  Currently Working On
                </h2>
                {inProgressProjects.map(project => (
                  <div key={project.id} className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <p className="text-gray-300 mt-1">{project.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-blue-400 font-semibold">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Estimated: {project.estimatedHours} hours</span>
                        <span>~{Math.ceil((100 - project.progress) / 100 * project.estimatedHours)} hours remaining</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Projects */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                Completed Projects ({completedProjects.length})
              </h2>
              <div className="grid gap-3">
                {completedProjects.map(project => (
                  <div key={project.id} className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <h3 className="font-semibold text-white">{project.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                            {project.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-300 mt-1 ml-7">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-2 ml-7 text-sm text-gray-400">
                          <span>{project.estimatedHours} hours</span>
                          <span>Completed: {project.completedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remaining Projects */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Circle className="w-5 h-5 mr-2 text-orange-400" />
                Remaining Projects ({pendingProjects.length})
              </h2>
              <div className="grid gap-3">
                {pendingProjects.map((project, index) => (
                  <div key={project.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center w-6 h-6 bg-gray-600 text-gray-300 rounded-full text-xs font-bold">
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-white">{project.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                            {project.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-300 mt-1 ml-8">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-2 ml-8 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {project.estimatedHours} hours
                          </span>
                          <span className="text-orange-400">Up next</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap Timeline */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Learning Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Started Journey</span>
                  <span className="text-gray-400">{user.joinDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Current Progress</span>
                  <span className="text-blue-400 font-semibold">53% Complete</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Estimated Completion</span>
                  <span className="text-purple-400 font-semibold">November 2024</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Next Milestone</span>
                  <span className="text-orange-400 font-semibold">Cloud Deployment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileRoadmapPage;