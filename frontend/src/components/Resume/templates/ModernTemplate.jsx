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
    <div className="w-full min-h-full bg-white font-sans" style={{ fontVariantLigatures: 'none' }}>
      <div className="grid grid-cols-[35%_65%] min-h-full">
        {/* Left Sidebar */}
        <div 
          className="p-4 sm:p-6 text-white min-h-screen"
          style={{ background: `linear-gradient(to bottom, ${lightColor}40, ${lightColor}20)` }}
        >
          {/* Profile Image */}
          <div className="mb-6 flex justify-center">
            <div 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg"
              style={{ background: `linear-gradient(to bottom right, ${lightColor}, ${primaryColor}80)` }}
            >
              {(data.profileInfo?.photo || data.profileInfo?.profilePreviewUrl) ? (
                <img 
                  src={data.profileInfo.photo || data.profileInfo.profilePreviewUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-16 h-16" style={{ color: primaryColor + '60' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-2">
            <div className="space-y-2">
              {data.contactInfo?.email && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm"
                  >
                    <svg className="w-4 h-4" style={{ color: darkColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a 
                      href={`mailto:${data.contactInfo.email}`}
                      className="text-xs sm:text-sm text-gray-700 break-words hover:underline block"
                    >
                      {data.contactInfo.email}
                    </a>
                  </div>
                </div>
              )}
              {data.contactInfo?.phoneNo && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm"
                  >
                    <svg className="w-4 h-4" style={{ color: darkColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a 
                      href={`tel:${data.contactInfo.phoneNo}`}
                      className="text-xs sm:text-sm text-gray-700 hover:underline block"
                    >
                      {data.contactInfo.phoneNo}
                    </a>
                  </div>
                </div>
              )}
              {data.contactInfo?.location && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm"
                  >
                    <svg className="w-4 h-4" style={{ color: darkColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-700 break-words">{data.contactInfo.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(data.contactInfo?.linkedin || data.contactInfo?.github || data.contactInfo?.website) && (
            <div className="mb-8">
              <div className="space-y-2">
                {data.contactInfo?.linkedin && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm"
                    >
                      <span className="text-xs font-bold" style={{ color: darkColor }}>in</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a 
                        href={data.contactInfo.linkedin.startsWith('http') ? data.contactInfo.linkedin : `https://${data.contactInfo.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-gray-700 break-all hover:underline block"
                      >
                        {data.contactInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  </div>
                )}
                {data.contactInfo?.github && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm"
                    >
                      <svg className="w-4 h-4" style={{ color: darkColor }} fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a 
                        href={data.contactInfo.github.startsWith('http') ? data.contactInfo.github : `https://${data.contactInfo.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-gray-700 break-all hover:underline block"
                      >
                        {data.contactInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  </div>
                )}
                {data.contactInfo?.website && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm"
                    >
                      <svg className="w-4 h-4" style={{ color: darkColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a 
                        href={data.contactInfo.website.startsWith('http') ? data.contactInfo.website : `https://${data.contactInfo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-gray-700 break-all hover:underline block"
                      >
                        {data.contactInfo.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b-2 border-gray-300 pb-2">EDUCATION</h3>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-sm font-bold text-gray-900">{edu.degree || 'Degree'}</h4>
                  <p className="text-xs sm:text-sm text-gray-700 font-medium">{edu.institute || 'Institution'}</p>
                  <p className="text-xs text-gray-600 mt-1">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b-2 border-gray-300 pb-2">LANGUAGES</h3>
              {data.languages.map((lang, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-800">{lang.name || 'Language'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{ 
                          backgroundColor: i < Math.round((lang.progress || 0) / 20) ? primaryColor : 'white',
                          border: `1px solid ${primaryColor}`
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
        <div className="p-6 sm:p-8 lg:p-10">
          {/* Name and Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {data.profileInfo?.fullName || 'FULL NAME'}
            </h1>
            <p className="text-lg sm:text-xl font-medium" style={{ color: primaryColor }}>
              {data.profileInfo?.designation || 'PROFESSIONAL TITLE'}
            </p>
          </div>

          {/* Professional Summary */}
          {data.profileInfo?.summary && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b-2 pb-2" style={{ borderColor: primaryColor }}>
                ABOUT ME
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed text-justify">
                {data.profileInfo.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {data.workExperience && data.workExperience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b-2 pb-2" style={{ borderColor: primaryColor }}>
                WORK EXPERIENCE
              </h2>
              {data.workExperience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-bold text-gray-900">{exp.company || 'Company Name'}</h3>
                    <span className="text-xs sm:text-sm text-gray-600 italic whitespace-nowrap ml-4">
                      {exp.startingDate} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-2" style={{ color: primaryColor }}>{exp.role || 'Job Title'}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b-2 pb-2" style={{ borderColor: primaryColor }}>
                SKILLS SUMMARY
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {data.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-bold text-gray-800">{skill.name || 'Skill'}</span>
                      <span className="text-xs font-medium text-gray-500">{skill.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
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
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b-2 pb-2" style={{ borderColor: primaryColor }}>
                PROJECTS
              </h2>
              {data.projects.map((project, index) => (
                <div key={index} className="mb-5">
                  <h3 className="text-base font-bold text-gray-900 mb-1">{project.title || 'Project Title'}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-700 leading-relaxed text-justify mb-2">{project.description}</p>
                  )}
                  {(project.github || project.liveDemo) && (
                    <div className="flex gap-4 text-sm">
                      {project.github && (
                        <a 
                          href={project.github.startsWith('http') ? project.github : `https://${project.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline font-medium flex items-center gap-1"
                          style={{ color: primaryColor }}
                        >
                          → GitHub
                        </a>
                      )}
                      {project.liveDemo && (
                        <a 
                          href={project.liveDemo.startsWith('http') ? project.liveDemo : `https://${project.liveDemo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline font-medium flex items-center gap-1"
                          style={{ color: primaryColor }}
                        >
                          → Live Demo
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {data.certificates && data.certificates.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-9 uppercase tracking-wider border-b-2 pb-2" style={{ borderColor: primaryColor }}>
                CERTIFICATIONS
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {data.certificates.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div 
                      className="px-2 py-2 rounded text-xs font-bold mt-0.5 inline-flex items-center justify-center leading-none"
                      style={{ backgroundColor: lightColor, color: darkColor }}
                    >
                      {cert.year || '2024'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">
                        {cert.link ? (
                          <a 
                            href={cert.link.startsWith('http') ? cert.link : `https://${cert.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {cert.title || 'Certificate'}
                          </a>
                        ) : (
                          cert.title || 'Certificate'
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">{cert.issuer || 'Issuer'}</p>
                      {cert.link && (
                        <a 
                          href={cert.link.startsWith('http') ? cert.link : `https://${cert.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm hover:underline break-all mt-0.5 block"
                          style={{ color: primaryColor }}
                        >
                          {cert.link}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b-2 pb-2" style={{ borderColor: primaryColor }}>
                INTERESTS
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center justify-center leading-none"
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
  );
};

export default ModernTemplate;
