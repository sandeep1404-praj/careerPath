import { getColorPalette, getResumeDataWithDefaults } from '@/config/resumeThemes';

const CreativeTemplate = ({ resumeData }) => {
  // Merge with placeholder data
  const data = getResumeDataWithDefaults(resumeData);
  
  // Support both new and old data structures
  let primaryColor = '#7C3AED', darkColor = '#5B21B6', lightColor = '#A78BFA';
  if (Array.isArray(data.template?.colors) && data.template.colors.length === 3) {
    [primaryColor, darkColor, lightColor] = data.template.colors;
  } else if (typeof data.template?.colorPalette === 'string') {
    const palette = getColorPalette(data.template.colorPalette);
    [primaryColor, darkColor, lightColor] = palette.colors;
  }

  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="text-[10px] sm:text-xs">
        {/* Header with Photo and Name */}
        <div 
          className="relative p-6 sm:p-8 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${darkColor} 0%, ${primaryColor} 100%)` 
          }}
        >
          <div className="flex items-center gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl">
                {(data.profileInfo?.photo || data.profileInfo?.profilePreviewUrl) ? (
                  <img 
                    src={data.profileInfo.photo || data.profileInfo.profilePreviewUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Name and Title */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 uppercase tracking-wide">
                {data.profileInfo?.fullName || 'FULL NAME'}
              </h1>
              <p className="text-base sm:text-lg font-medium opacity-90 mb-3">
                {data.profileInfo?.designation || 'Professional Title'}
              </p>
              
              {/* Contact Icons */}
              <div className="flex flex-wrap gap-3 text-xs">
                {data.contactInfo?.email && (
                  <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <a href={`mailto:${data.contactInfo.email}`} className="hover:underline">
                      {data.contactInfo.email}
                    </a>
                  </span>
                )}
                {data.contactInfo?.phoneNo && (
                  <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <a href={`tel:${data.contactInfo.phoneNo}`} className="hover:underline">
                      {data.contactInfo.phoneNo}
                    </a>
                  </span>
                )}
                {data.contactInfo?.location && (
                  <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {data.contactInfo.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Sidebar Info */}
            <div className="md:col-span-1 space-y-5">
              {/* Summary */}
              {data.profileInfo?.summary && (
                <div>
                  <h2 
                    className="text-sm font-bold mb-2 pb-1 border-b-2 uppercase tracking-wide"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Summary
                  </h2>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {data.profileInfo.summary}
                  </p>
                </div>
              )}

              {/* Professional Skills */}
              {data.skills && data.skills.length > 0 && (
                <div>
                  <h2 
                    className="text-sm font-bold mb-3 pb-1 border-b-2 uppercase tracking-wide"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Professional Skills
                  </h2>
                  <div className="space-y-2">
                    {data.skills.slice(0, 6).map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <span className="text-xs font-medium text-gray-800">{skill.name || 'Skill'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills (remaining skills) */}
              {data.skills && data.skills.length > 6 && (
                <div>
                  <h2 
                    className="text-sm font-bold mb-3 pb-1 border-b-2 uppercase tracking-wide"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Technical Skills
                  </h2>
                  <div className="space-y-2">
                    {data.skills.slice(6).map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <span className="text-xs font-medium text-gray-800">{skill.name || 'Skill'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {data.languages && data.languages.length > 0 && (
                <div>
                  <h2 
                    className="text-sm font-bold mb-3 pb-1 border-b-2 uppercase tracking-wide"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Languages
                  </h2>
                  <div className="space-y-2">
                    {data.languages.map((lang, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-800">{lang.name || 'Language'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Main Content */}
            <div className="md:col-span-2 space-y-5">
              {/* Professional Experience */}
              {data.workExperience && data.workExperience.length > 0 && (
                <div>
                  <h2 
                    className="text-sm font-bold mb-3 pb-1 border-b-2 uppercase tracking-wide"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Professional Experience
                  </h2>
                  {data.workExperience.map((exp, index) => (
                    <div key={index} className="mb-4 relative pl-4 border-l-2" style={{ borderColor: lightColor }}>
                      {/* Timeline Dot */}
                      <div 
                        className="absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: primaryColor }}
                      />
                      
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-xs font-bold text-gray-900">{exp.role || 'Job Title'}</h3>
                          <p className="text-xs font-semibold" style={{ color: primaryColor }}>
                            {exp.company || 'Company Name'}
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: lightColor, color: darkColor }}>
                          {exp.startingDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-gray-700 leading-relaxed mt-2">
                          • {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {data.education && data.education.length > 0 && (
                <div>
                  <h2 
                    className="text-sm font-bold mb-3 pb-1 border-b-2 uppercase tracking-wide"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Education
                  </h2>
                  {data.education.map((edu, index) => (
                    <div key={index} className="mb-3 relative pl-4 border-l-2" style={{ borderColor: lightColor }}>
                      <div 
                        className="absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xs font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                          <p className="text-xs text-gray-700">{edu.institute || 'Institution'}</p>
                        </div>
                        <span className="text-xs text-gray-600 italic whitespace-nowrap ml-2">
                          {edu.startDate} - {edu.endDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {data.projects && data.projects.length > 0 && (
                <div>
                  <h2 
                    className="text-sm font-bold mb-3 pb-1 border-b-2 uppercase tracking-wide"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Projects
                  </h2>
                  {data.projects.map((project, index) => (
                    <div key={index} className="mb-3">
                      <h3 className="text-xs font-bold text-gray-900 mb-1">{project.title || 'Project Title'}</h3>
                      {project.description && (
                        <p className="text-xs text-gray-700 leading-relaxed">• {project.description}</p>
                      )}
                      <div className="flex gap-3 mt-1">
                        {project.github && (
                          <a 
                            href={project.github.startsWith('http') ? project.github : `https://${project.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-0.5 rounded hover:opacity-80"
                            style={{ backgroundColor: lightColor, color: darkColor }}
                          >
                            GitHub
                          </a>
                        )}
                        {project.liveDemo && (
                          <a 
                            href={project.liveDemo.startsWith('http') ? project.liveDemo : `https://${project.liveDemo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-0.5 rounded hover:opacity-80"
                            style={{ backgroundColor: lightColor, color: darkColor }}
                          >
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {data.certificates && data.certificates.length > 0 && (
                <div>
                  <h2 
                    className="text-sm font-bold mb-3 pb-1 border-b-2 uppercase tracking-wide"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Certifications
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.certificates.map((cert, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div 
                          className="text-xs font-bold px-2 py-1 rounded"
                          style={{ backgroundColor: primaryColor, color: 'white' }}
                        >
                          {cert.year || '2024'}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-gray-900">{cert.title || 'Certificate'}</h4>
                          <p className="text-xs text-gray-600">{cert.issuer || 'Issuer'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {data.interests && data.interests.length > 0 && (
                <div>
                  <h2 
                    className="text-sm font-bold mb-3 pb-1 border-b-2 uppercase tracking-wide"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Interests
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {data.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: lightColor, color: darkColor }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* References Section */}
          {(data.contactInfo?.linkedin || data.contactInfo?.github || data.contactInfo?.website) && (
            <div className="mt-6 pt-4 border-t-2" style={{ borderColor: lightColor }}>
              <h2 
                className="text-sm font-bold mb-3 uppercase tracking-wide"
                style={{ color: primaryColor }}
              >
                References
              </h2>
              <div className="flex flex-wrap gap-4 text-xs">
                {data.contactInfo?.linkedin && (
                  <div>
                    <span className="font-semibold text-gray-900">LinkedIn: </span>
                    <a 
                      href={data.contactInfo.linkedin.startsWith('http') ? data.contactInfo.linkedin : `https://${data.contactInfo.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:underline"
                    >
                      {data.contactInfo.linkedin.replace('https://', '').replace('http://', '')}
                    </a>
                  </div>
                )}
                {data.contactInfo?.github && (
                  <div>
                    <span className="font-semibold text-gray-900">GitHub: </span>
                    <a 
                      href={data.contactInfo.github.startsWith('http') ? data.contactInfo.github : `https://${data.contactInfo.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:underline"
                    >
                      {data.contactInfo.github.replace('https://', '').replace('http://', '')}
                    </a>
                  </div>
                )}
                {data.contactInfo?.website && (
                  <div>
                    <span className="font-semibold text-gray-900">Website: </span>
                    <a 
                      href={data.contactInfo.website.startsWith('http') ? data.contactInfo.website : `https://${data.contactInfo.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:underline"
                    >
                      {data.contactInfo.website.replace('https://', '').replace('http://', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeTemplate;
