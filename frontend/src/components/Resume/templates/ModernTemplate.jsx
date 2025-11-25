import { getColorPalette, getResumeDataWithDefaults } from '@/config/resumeThemes';

const ModernTemplate = ({ resumeData }) => {
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
      <div className="p-2 sm:p-4 lg:p-6 text-[10px] sm:text-xs">
        <div className="grid grid-cols-[35%_65%] gap-0 min-h-full">
          {/* Left Sidebar */}
          <div 
            className="p-3 sm:p-4 -ml-2 -mt-2 sm:-ml-4 sm:-mt-4 -mb-2 sm:-mb-4 lg:-mb-6"
            style={{ background: `linear-gradient(to bottom, ${lightColor}40, ${lightColor}20)` }}
          >
            {/* Profile Image */}
            <div className="mb-3 sm:mb-4">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden border-2 border-white shadow-lg"
                style={{ background: `linear-gradient(to bottom right, ${lightColor}, ${primaryColor}80)` }}
              >
                {(data.profileInfo?.photo || data.profileInfo?.profilePreviewUrl) ? (
                  <img 
                    src={data.profileInfo.photo || data.profileInfo.profilePreviewUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12" style={{ color: primaryColor + '60' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-3 sm:mb-4">
              <div className="space-y-1.5 sm:space-y-2">
                {data.contactInfo?.email && (
                  <div className="flex items-start gap-1.5">
                    <div 
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: lightColor }}
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: darkColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 pt-1">
                      <a 
                        href={`mailto:${data.contactInfo.email}`}
                        className="text-xs text-gray-700 break-all hover:underline"
                      >
                        {data.contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}
                {data.contactInfo?.phoneNo && (
                  <div className="flex items-start gap-1.5">
                    <div 
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: lightColor }}
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: darkColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 pt-1">
                      <a 
                        href={`tel:${data.contactInfo.phoneNo}`}
                        className="text-xs text-gray-700 hover:underline"
                      >
                        {data.contactInfo.phoneNo}
                      </a>
                    </div>
                  </div>
                )}
                {data.contactInfo?.location && (
                  <div className="flex items-start gap-1.5">
                    <div 
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: lightColor }}
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: darkColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-xs text-gray-700">{data.contactInfo.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(data.contactInfo?.linkedin || data.contactInfo?.github || data.contactInfo?.website) && (
              <div className="mb-6">
                <div className="space-y-2">
                  {data.contactInfo?.linkedin && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: lightColor }}
                      >
                        <span className="text-xs font-semibold" style={{ color: darkColor }}>in</span>
                      </div>
                      <a 
                        href={data.contactInfo.linkedin.startsWith('http') ? data.contactInfo.linkedin : `https://${data.contactInfo.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-700 truncate hover:underline"
                      >
                        {data.contactInfo.linkedin.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                  {data.contactInfo?.github && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: lightColor }}
                      >
                        <svg className="w-3 h-3" style={{ color: darkColor }} fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <a 
                        href={data.contactInfo.github.startsWith('http') ? data.contactInfo.github : `https://${data.contactInfo.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-700 truncate hover:underline"
                      >
                        {data.contactInfo.github.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                  {data.contactInfo?.website && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: lightColor }}
                      >
                        <svg className="w-3 h-3" style={{ color: darkColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <a 
                        href={data.contactInfo.website.startsWith('http') ? data.contactInfo.website : `https://${data.contactInfo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-700 truncate hover:underline"
                      >
                        {data.contactInfo.website.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">EDUCATION</h3>
                {data.education.map((edu, index) => (
                  <div key={index} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-900">{edu.degree || 'Degree'}</h4>
                    <p className="text-xs text-gray-700 italic">{edu.institute || 'Institution'}</p>
                    <p className="text-xs text-gray-600 mt-1">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">LANGUAGES</h3>
                {data.languages.map((lang, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-800">{lang.name || 'Language'}</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ 
                            backgroundColor: i < Math.round((lang.progress || 0) / 20) ? primaryColor : lightColor 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="p-3 sm:p-4 md:pl-4 lg:pl-6">
            {/* Name and Title */}
            <div className="mb-3 sm:mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">
                {data.profileInfo?.fullName || 'FULL NAME'}
              </h1>
              <p className="text-sm sm:text-base font-medium" style={{ color: primaryColor }}>
                {data.profileInfo?.designation || 'PROFESSIONAL TITLE'}
              </p>
            </div>

            {/* Professional Summary */}
            {data.profileInfo?.summary && (
              <div className="mb-3 sm:mb-4">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 pb-0.5 border-b-2" style={{ borderColor: primaryColor }}>
                  ABOUT ME
                </h2>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {data.profileInfo.summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {data.workExperience && data.workExperience.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 pb-0.5 border-b-2" style={{ borderColor: primaryColor }}>
                  WORK EXPERIENCE
                </h2>
                {data.workExperience.map((exp, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-xs mb-1 font-bold text-gray-900">{exp.company || 'Company Name'}</h3>
                        <p className="text-xs font-medium" style={{ color: primaryColor }}>{exp.role || 'Job Title'}</p>
                      </div>
                      <p className="text-xs text-gray-600 italic whitespace-nowrap ml-2">
                        {exp.startingDate} - {exp.endDate || 'Present'}
                      </p>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-gray-700 leading-relaxed mt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 pb-0.5 border-b-2" style={{ borderColor: primaryColor }}>
                  SKILLS SUMMARY
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2">
                  {data.skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-800">{skill.name || 'Skill'}</span>
                        <span className="text-xs text-gray-600">{skill.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${skill.progress || 0}%`,
                            backgroundColor: primaryColor 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 pb-0.5 border-b-2" style={{ borderColor: primaryColor }}>
                  PROJECTS
                </h2>
                {data.projects.map((project, index) => (
                  <div key={index} className="mb-4">
                    <h3 className="text-xs font-bold text-gray-900">{project.title || 'Project Title'}</h3>
                    {project.description && (
                      <p className="text-xs text-gray-700 leading-relaxed mt-1">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {data.certificates && data.certificates.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 pb-0.5 border-b-2" style={{ borderColor: primaryColor }}>
                  CERTIFICATIONS
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {data.certificates.map((cert, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div 
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ backgroundColor: lightColor, color: darkColor }}
                      >
                        {cert.year || '2024'}
                      </div>
                      <div>
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
              <div className="mb-6">
                <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2" style={{ borderColor: primaryColor }}>
                  INTERESTS
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
      </div>
    </div>
  );
};

export default ModernTemplate;
