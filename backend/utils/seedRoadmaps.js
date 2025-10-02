import StaticRoadmap from "../models/StaticRoadmap.js";

// Seed data for static roadmaps
const roadmapData = [
  {
    id: "frontend-developer",
    name: "Frontend Developer",
    track: "Frontend Development",
    description: "Complete path to become a professional frontend developer. Learn modern technologies, best practices, and build real-world projects.",
    color: "#3B82F6",
    icon: "🎨",
    totalEstimatedTime: "8-12 months",
    prerequisites: ["Basic computer skills", "Problem-solving mindset"],
    tasks: [
      {
        id: "html-basics",
        name: "HTML Fundamentals",
        description: "Learn HTML structure, semantic elements, forms, and accessibility basics",
        estimatedTime: "2 weeks",
        difficulty: "Beginner",
        category: "Frontend Basics",
        resources: [
          { title: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "article" },
          { title: "HTML Crash Course", url: "https://www.youtube.com/watch?v=UB1O30fR-EE", type: "video" }
        ],
        order: 1
      },
      {
        id: "css-fundamentals",
        name: "CSS Fundamentals",
        description: "Master CSS selectors, box model, flexbox, grid, and responsive design",
        estimatedTime: "3 weeks",
        difficulty: "Beginner",
        category: "Frontend Basics",
        resources: [
          { title: "CSS Complete Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS", type: "article" },
          { title: "Flexbox Froggy Game", url: "https://flexboxfroggy.com/", type: "practice" }
        ],
        order: 2
      },
      {
        id: "javascript-basics",
        name: "JavaScript Fundamentals",
        description: "Learn JS syntax, DOM manipulation, events, and ES6+ features",
        estimatedTime: "4 weeks",
        difficulty: "Beginner",
        category: "Programming",
        resources: [
          { title: "JavaScript.info", url: "https://javascript.info/", type: "article" },
          { title: "JavaScript Course by FreeCodeCamp", url: "https://www.freecodecamp.org/learn", type: "course" }
        ],
        order: 3
      },
      {
        id: "version-control-git",
        name: "Version Control with Git",
        description: "Learn Git basics, GitHub, branching, merging, and collaborative workflows",
        estimatedTime: "1 week",
        difficulty: "Beginner",
        category: "Tools",
        resources: [
          { title: "Pro Git Book", url: "https://git-scm.com/book", type: "article" },
          { title: "Git Tutorial", url: "https://www.atlassian.com/git/tutorials", type: "article" }
        ],
        order: 4
      },
      {
        id: "react-basics",
        name: "React Fundamentals",
        description: "Learn React components, props, state, hooks, and component lifecycle",
        estimatedTime: "4 weeks",
        difficulty: "Intermediate",
        category: "Framework",
        resources: [
          { title: "React Official Docs", url: "https://react.dev/learn", type: "article" },
          { title: "React Course by Scrimba", url: "https://scrimba.com/learn/learnreact", type: "course" }
        ],
        order: 5
      },
      {
        id: "state-management",
        name: "State Management",
        description: "Learn Redux, Context API, and modern state management patterns",
        estimatedTime: "2 weeks",
        difficulty: "Intermediate",
        category: "Framework",
        resources: [
          { title: "Redux Toolkit", url: "https://redux-toolkit.js.org/", type: "article" },
          { title: "State Management Explained", url: "https://www.youtube.com/watch?v=35lXWvCuM8o", type: "video" }
        ],
        order: 6
      },
      {
        id: "build-tools",
        name: "Build Tools & Bundlers",
        description: "Learn Webpack, Vite, npm/yarn, and modern development workflow",
        estimatedTime: "2 weeks",
        difficulty: "Intermediate",
        category: "Tools",
        resources: [
          { title: "Vite Guide", url: "https://vitejs.dev/guide/", type: "article" },
          { title: "Webpack Documentation", url: "https://webpack.js.org/concepts/", type: "article" }
        ],
        order: 7
      },
      {
        id: "testing",
        name: "Testing & Quality Assurance",
        description: "Learn unit testing, integration testing with Jest, React Testing Library",
        estimatedTime: "3 weeks",
        difficulty: "Intermediate",
        category: "Quality Assurance",
        resources: [
          { title: "Testing Library Docs", url: "https://testing-library.com/docs/", type: "article" },
          { title: "Jest Documentation", url: "https://jestjs.io/docs/getting-started", type: "article" }
        ],
        order: 8
      },
      {
        id: "performance-optimization",
        name: "Performance Optimization",
        description: "Learn code splitting, lazy loading, memoization, and web vitals",
        estimatedTime: "2 weeks",
        difficulty: "Advanced",
        category: "Performance",
        resources: [
          { title: "Web.dev Performance", url: "https://web.dev/performance/", type: "article" },
          { title: "React Performance", url: "https://react.dev/learn/render-and-commit", type: "article" }
        ],
        order: 9
      },
      {
        id: "portfolio-project",
        name: "Portfolio Project",
        description: "Build a complete portfolio website showcasing your skills and projects",
        estimatedTime: "4 weeks",
        difficulty: "Advanced",
        category: "Project",
        resources: [
          { title: "Portfolio Examples", url: "https://github.com/collections/portfolios", type: "article" },
          { title: "Deploy with Vercel", url: "https://vercel.com/docs", type: "article" }
        ],
        order: 10
      }
    ]
  },
  {
    id: "backend-developer",
    name: "Backend Developer",
    track: "Backend Development",
    description: "Master server-side development, databases, APIs, and system architecture to build scalable backend systems.",
    color: "#10B981",
    icon: "⚙️",
    totalEstimatedTime: "10-14 months",
    prerequisites: ["Programming fundamentals", "Basic understanding of web concepts"],
    tasks: [
      {
        id: "programming-fundamentals",
        name: "Programming Fundamentals",
        description: "Master core programming concepts, data structures, and algorithms",
        estimatedTime: "4 weeks",
        difficulty: "Beginner",
        category: "Programming",
        resources: [
          { title: "Data Structures & Algorithms", url: "https://www.freecodecamp.org/learn", type: "course" },
          { title: "Big O Notation", url: "https://www.youtube.com/watch?v=Mo4vesaut8g", type: "video" }
        ],
        order: 1
      },
      {
        id: "nodejs-basics",
        name: "Node.js Fundamentals",
        description: "Learn Node.js runtime, modules, npm, and building server applications",
        estimatedTime: "3 weeks",
        difficulty: "Beginner",
        category: "Runtime",
        resources: [
          { title: "Node.js Official Docs", url: "https://nodejs.org/en/docs/", type: "article" },
          { title: "Node.js Course", url: "https://www.youtube.com/watch?v=TlB_eWDSMt4", type: "video" }
        ],
        order: 2
      },
      {
        id: "express-framework",
        name: "Express.js Framework",
        description: "Build RESTful APIs, handle routing, middleware, and error handling",
        estimatedTime: "3 weeks",
        difficulty: "Intermediate",
        category: "Framework",
        resources: [
          { title: "Express.js Guide", url: "https://expressjs.com/en/guide/routing.html", type: "article" },
          { title: "REST API Tutorial", url: "https://www.youtube.com/watch?v=pKd0Rpw7O48", type: "video" }
        ],
        order: 3
      },
      {
        id: "database-fundamentals",
        name: "Database Design & SQL",
        description: "Learn relational databases, SQL, normalization, and database design principles",
        estimatedTime: "4 weeks",
        difficulty: "Intermediate",
        category: "Database",
        resources: [
          { title: "SQL Tutorial", url: "https://www.w3schools.com/sql/", type: "course" },
          { title: "Database Design Course", url: "https://www.youtube.com/watch?v=ztHopE5Wnpc", type: "video" }
        ],
        order: 4
      },
      {
        id: "mongodb-nosql",
        name: "MongoDB & NoSQL",
        description: "Learn document databases, MongoDB operations, aggregation, and data modeling",
        estimatedTime: "2 weeks",
        difficulty: "Intermediate",
        category: "Database",
        resources: [
          { title: "MongoDB University", url: "https://university.mongodb.com/", type: "course" },
          { title: "Mongoose ODM", url: "https://mongoosejs.com/docs/", type: "article" }
        ],
        order: 5
      },
      {
        id: "authentication-security",
        name: "Authentication & Security",
        description: "Implement JWT, OAuth, password hashing, and security best practices",
        estimatedTime: "3 weeks",
        difficulty: "Intermediate",
        category: "Security",
        resources: [
          { title: "JWT.io", url: "https://jwt.io/introduction/", type: "article" },
          { title: "Web Security Course", url: "https://www.youtube.com/watch?v=F-sFp_AvHc8", type: "video" }
        ],
        order: 6
      },
      {
        id: "api-documentation",
        name: "API Documentation & Testing",
        description: "Learn API design, documentation with Swagger, and testing with Postman/Jest",
        estimatedTime: "2 weeks",
        difficulty: "Intermediate",
        category: "Documentation",
        resources: [
          { title: "Swagger Documentation", url: "https://swagger.io/docs/", type: "article" },
          { title: "API Testing Guide", url: "https://www.postman.com/api-testing/", type: "article" }
        ],
        order: 7
      },
      {
        id: "deployment-devops",
        name: "Deployment & DevOps Basics",
        description: "Learn Docker, CI/CD, cloud deployment, and monitoring",
        estimatedTime: "4 weeks",
        difficulty: "Advanced",
        category: "DevOps",
        resources: [
          { title: "Docker Tutorial", url: "https://docs.docker.com/get-started/", type: "article" },
          { title: "AWS Basics", url: "https://aws.amazon.com/getting-started/", type: "course" }
        ],
        order: 8
      },
      {
        id: "microservices-architecture",
        name: "Microservices Architecture",
        description: "Learn service-oriented architecture, API gateways, and distributed systems",
        estimatedTime: "4 weeks",
        difficulty: "Advanced",
        category: "Architecture",
        resources: [
          { title: "Microservices Patterns", url: "https://microservices.io/patterns/", type: "article" },
          { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "article" }
        ],
        order: 9
      },
      {
        id: "scalable-backend-project",
        name: "Scalable Backend Project",
        description: "Build a complete backend system with multiple services, databases, and APIs",
        estimatedTime: "6 weeks",
        difficulty: "Advanced",
        category: "Project",
        resources: [
          { title: "Real-world Backend Projects", url: "https://github.com/gothinkster/realworld", type: "practice" },
          { title: "System Design Interview", url: "https://www.youtube.com/watch?v=bUHFg8CZFws", type: "video" }
        ],
        order: 10
      }
    ]
  },
  {
    id: "fullstack-developer",
    name: "Full-Stack Developer",
    track: "Full-Stack Development",
    description: "Become a versatile developer capable of building complete web applications from frontend to backend.",
    color: "#8B5CF6",
    icon: "🔄",
    totalEstimatedTime: "12-16 months",
    prerequisites: ["Basic programming knowledge", "Understanding of web technologies"],
    tasks: [
      {
        id: "web-fundamentals",
        name: "Web Development Fundamentals",
        description: "Master HTML, CSS, JavaScript, and how the web works",
        estimatedTime: "6 weeks",
        difficulty: "Beginner",
        category: "Fundamentals",
        resources: [
          { title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn", type: "article" },
          { title: "The Odin Project", url: "https://www.theodinproject.com/", type: "course" }
        ],
        order: 1
      },
      {
        id: "frontend-framework",
        name: "Frontend Framework (React/Vue/Angular)",
        description: "Choose and master a modern frontend framework for building interactive UIs",
        estimatedTime: "6 weeks",
        difficulty: "Intermediate",
        category: "Frontend",
        resources: [
          { title: "React Documentation", url: "https://react.dev/", type: "article" },
          { title: "Vue.js Guide", url: "https://vuejs.org/guide/", type: "article" }
        ],
        order: 2
      },
      {
        id: "backend-language",
        name: "Backend Language & Framework",
        description: "Learn a backend language (Node.js, Python, Java) and its web framework",
        estimatedTime: "6 weeks",
        difficulty: "Intermediate",
        category: "Backend",
        resources: [
          { title: "Node.js & Express", url: "https://expressjs.com/", type: "article" },
          { title: "Python Django", url: "https://docs.djangoproject.com/", type: "article" }
        ],
        order: 3
      },
      {
        id: "database-management",
        name: "Database Management",
        description: "Learn both SQL and NoSQL databases, design schemas, and optimize queries",
        estimatedTime: "4 weeks",
        difficulty: "Intermediate",
        category: "Database",
        resources: [
          { title: "PostgreSQL Tutorial", url: "https://www.postgresql.org/docs/", type: "article" },
          { title: "MongoDB Course", url: "https://university.mongodb.com/", type: "course" }
        ],
        order: 4
      },
      {
        id: "api-development",
        name: "RESTful API Development",
        description: "Design and build scalable APIs, handle authentication, and manage state",
        estimatedTime: "4 weeks",
        difficulty: "Intermediate",
        category: "API",
        resources: [
          { title: "REST API Best Practices", url: "https://restfulapi.net/", type: "article" },
          { title: "GraphQL Tutorial", url: "https://graphql.org/learn/", type: "article" }
        ],
        order: 5
      },
      {
        id: "version-control-collaboration",
        name: "Version Control & Collaboration",
        description: "Master Git workflows, code reviews, and team collaboration practices",
        estimatedTime: "2 weeks",
        difficulty: "Beginner",
        category: "Tools",
        resources: [
          { title: "Git Handbook", url: "https://guides.github.com/introduction/git-handbook/", type: "article" },
          { title: "GitHub Flow", url: "https://guides.github.com/introduction/flow/", type: "article" }
        ],
        order: 6
      },
      {
        id: "testing-deployment",
        name: "Testing & Deployment",
        description: "Learn testing strategies, CI/CD pipelines, and deployment to cloud platforms",
        estimatedTime: "4 weeks",
        difficulty: "Advanced",
        category: "DevOps",
        resources: [
          { title: "Testing Best Practices", url: "https://kentcdodds.com/blog/write-tests", type: "article" },
          { title: "Vercel Deployment", url: "https://vercel.com/docs", type: "article" }
        ],
        order: 7
      },
      {
        id: "performance-security",
        name: "Performance & Security",
        description: "Optimize application performance and implement security best practices",
        estimatedTime: "3 weeks",
        difficulty: "Advanced",
        category: "Optimization",
        resources: [
          { title: "Web Performance", url: "https://web.dev/performance/", type: "article" },
          { title: "OWASP Security", url: "https://owasp.org/www-project-top-ten/", type: "article" }
        ],
        order: 8
      },
      {
        id: "modern-tools-practices",
        name: "Modern Tools & Practices",
        description: "Learn modern development tools, package managers, and best practices",
        estimatedTime: "3 weeks",
        difficulty: "Intermediate",
        category: "Tools",
        resources: [
          { title: "Vite Build Tool", url: "https://vitejs.dev/", type: "article" },
          { title: "ESLint & Prettier", url: "https://eslint.org/docs/", type: "article" }
        ],
        order: 9
      },
      {
        id: "capstone-project",
        name: "Full-Stack Capstone Project",
        description: "Build a complete full-stack application with all learned technologies",
        estimatedTime: "8 weeks",
        difficulty: "Advanced",
        category: "Project",
        resources: [
          { title: "Project Ideas", url: "https://github.com/florinpop17/app-ideas", type: "practice" },
          { title: "Full-Stack Open", url: "https://fullstackopen.com/en/", type: "course" }
        ],
        order: 10
      }
    ]
  }
];

// Function to seed the database with roadmaps
export const seedRoadmaps = async () => {
  try {
    console.log('🌱 Starting roadmap seeding...');
    
    // Check database connection
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      throw new Error(`Database not connected. ReadyState: ${mongoose.default.connection.readyState}`);
    }
    
    // Check if roadmaps already exist
    const existingCount = await StaticRoadmap.countDocuments();
    console.log(`📊 Found ${existingCount} existing roadmaps in database`);
    
    if (existingCount > 0) {
      console.log('📝 Roadmaps already exist. Skipping seeding.');
      return { message: 'Roadmaps already exist', count: existingCount };
    }

    // Validate data before inserting
    console.log(`📝 Attempting to seed ${roadmapData.length} roadmaps...`);
    if (!roadmapData || roadmapData.length === 0) {
      throw new Error('No roadmap data to seed');
    }

    // Insert all roadmaps
    const result = await StaticRoadmap.insertMany(roadmapData);
    console.log(`✅ Successfully seeded ${result.length} roadmaps`);

    // Log the seeded roadmaps
    result.forEach(roadmap => {
      console.log(`  📚 ${roadmap.name} (${roadmap.tasks?.length || 0} tasks)`);
    });

    return result;
  } catch (error) {
    console.error('❌ Error seeding roadmaps:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

// Function to reset roadmaps (useful for development)
export const resetRoadmaps = async () => {
  try {
    console.log('🔄 Resetting roadmaps...');
    await StaticRoadmap.deleteMany({});
    console.log('🗑️ Cleared existing roadmaps');
    
    const result = await seedRoadmaps();
    console.log('✅ Roadmaps reset successfully');
    return result;
  } catch (error) {
    console.error('❌ Error resetting roadmaps:', error);
    throw error;
  }
};