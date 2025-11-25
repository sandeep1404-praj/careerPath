// Resume Theme Configuration
export const RESUME_THEMES = {
  modern: {
    id: 'modern',
    name: 'Modern Sidebar',
    description: 'Clean design with left sidebar for contact info',
    thumbnail: '📱',
  },
  classic: {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional layout with header and single column',
    thumbnail: '📄',
  },
  creative: {
    id: 'creative',
    name: 'Creative Bold',
    description: 'Eye-catching design with photo and accent colors',
    thumbnail: '🎨',
  },
};

// Color Palettes - Each palette has 3 colors: [primary, secondary, accent]
export const COLOR_PALETTES = {
  purple: {
    id: 'purple',
    name: 'Purple Elegance',
    colors: ['#7C3AED', '#5B21B6', '#A78BFA'], // primary, dark, light
  },
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    colors: ['#3B82F6', '#1E40AF', '#60A5FA'],
  },
  green: {
    id: 'green',
    name: 'Forest Green',
    colors: ['#10B981', '#047857', '#34D399'],
  },
  orange: {
    id: 'orange',
    name: 'Sunset Orange',
    colors: ['#F59E0B', '#D97706', '#FBBf24'],
  },
  red: {
    id: 'red',
    name: 'Ruby Red',
    colors: ['#EF4444', '#B91C1C', '#F87171'],
  },
  teal: {
    id: 'teal',
    name: 'Teal Wave',
    colors: ['#14B8A6', '#0F766E', '#2DD4BF'],
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo Night',
    colors: ['#6366F1', '#4338CA', '#818CF8'],
  },
  pink: {
    id: 'pink',
    name: 'Rose Pink',
    colors: ['#EC4899', '#BE185D', '#F472B6'],
  },
  slate: {
    id: 'slate',
    name: 'Professional Slate',
    colors: ['#475569', '#1E293B', '#64748B'],
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Gem',
    colors: ['#059669', '#065F46', '#10B981'],
  },
};

// Helper function to get theme
export const getTheme = (themeId) => {
  return RESUME_THEMES[themeId] || RESUME_THEMES.modern;
};

// Helper function to get color palette
export const getColorPalette = (paletteId) => {
  return COLOR_PALETTES[paletteId] || COLOR_PALETTES.purple;
};

// Get all themes as array
export const getAllThemes = () => {
  return Object.values(RESUME_THEMES);
};

// Get all color palettes as array
export const getAllColorPalettes = () => {
  return Object.values(COLOR_PALETTES);
};

// Static placeholder data for empty resumes
export const PLACEHOLDER_DATA = {
  profileInfo: {
    fullName: 'Your Full Name',
    designation: 'Professional Title',
    summary: 'A brief professional summary highlighting your key skills, experience, and career objectives. This section should capture the attention of recruiters and showcase what makes you unique.',
  },
  contactInfo: {
    email: 'your.email@example.com',
    phoneNo: '+1 (555) 123-4567',
    location: '123 Main Street, City, State 12345',
    linkedin: 'https://linkedin.com/in/yourprofile',
    github: 'https://github.com/yourusername',
    website: 'https://yourwebsite.com',
  },
  workExperience: [
    {
      company: 'Company Name',
      role: 'Job Title',
      startingDate: '2022',
      endDate: 'Present',
      description: 'Describe your key responsibilities and achievements in this role. Focus on measurable results and impact.',
    },
    {
      company: 'Previous Company',
      role: 'Previous Position',
      startingDate: '2020',
      endDate: '2022',
      description: 'Highlight your accomplishments and the skills you developed during this period.',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institute: 'University Name',
      startDate: '2016',
      endDate: '2020',
    },
  ],
  skills: [
    { name: 'JavaScript', progress: 90 },
    { name: 'React', progress: 85 },
    { name: 'Node.js', progress: 80 },
    { name: 'Python', progress: 75 },
    { name: 'UI/UX Design', progress: 70 },
    { name: 'Project Management', progress: 85 },
  ],
  projects: [
    {
      title: 'Project Name',
      description: 'Brief description of the project, technologies used, and your role in its development.',
      github: 'https://github.com/yourusername/project',
      liveDemo: 'https://project-demo.com',
    },
  ],
  certificates: [
    {
      title: 'Professional Certification',
      issuer: 'Issuing Organization',
      year: '2023',
    },
  ],
  languages: [
    { name: 'English', progress: 100 },
    { name: 'Spanish', progress: 75 },
  ],
  interests: ['Web Development', 'UI/UX Design', 'Open Source', 'Technology'],
};

// Helper function to merge resume data with placeholder data
export const getResumeDataWithDefaults = (resumeData) => {
  const merged = { ...resumeData };
  
  // Merge profileInfo
  merged.profileInfo = {
    ...PLACEHOLDER_DATA.profileInfo,
    ...resumeData.profileInfo,
  };
  
  // Merge contactInfo
  merged.contactInfo = {
    ...PLACEHOLDER_DATA.contactInfo,
    ...resumeData.contactInfo,
  };
  
  // Use placeholder arrays if empty
  merged.workExperience = (resumeData.workExperience && resumeData.workExperience.length > 0) 
    ? resumeData.workExperience 
    : PLACEHOLDER_DATA.workExperience;
  
  merged.education = (resumeData.education && resumeData.education.length > 0) 
    ? resumeData.education 
    : PLACEHOLDER_DATA.education;
  
  merged.skills = (resumeData.skills && resumeData.skills.length > 0) 
    ? resumeData.skills 
    : PLACEHOLDER_DATA.skills;
  
  merged.projects = (resumeData.projects && resumeData.projects.length > 0) 
    ? resumeData.projects 
    : PLACEHOLDER_DATA.projects;
  
  merged.certificates = (resumeData.certificates && resumeData.certificates.length > 0) 
    ? resumeData.certificates 
    : PLACEHOLDER_DATA.certificates;
  
  merged.languages = (resumeData.languages && resumeData.languages.length > 0) 
    ? resumeData.languages 
    : PLACEHOLDER_DATA.languages;
  
  merged.interests = (resumeData.interests && resumeData.interests.length > 0) 
    ? resumeData.interests 
    : PLACEHOLDER_DATA.interests;
  
  return merged;
};
