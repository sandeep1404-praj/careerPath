import { getColorPalette, getResumeDataWithDefaults } from '@/config/resumeThemes';

const ClassicTemplate = ({ resumeData }) => {
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
      <div className="p-4 sm:p-6 lg:p-8 text-[10px] sm:text-xs">
        {/* Header */}
        <div className="text-center mb-4 pb-4 border-b-4" style={{ borderColor: primaryColor }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 uppercase tracking-wide">
            {data.profileInfo?.fullName || 'FULL NAME'}
          </h1>
          <p className="text-sm sm:text-base font-semibold mb-3" style={{ color: primaryColor }}>
            {data.profileInfo?.designation || 'Professional Title'}
          </p>
          
          {/* Contact Info in Header */}
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-700">
            {data.contactInfo?.email && (
              <span className="flex items-center gap-1">
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
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a href={`tel:${data.contactInfo.phoneNo}`} className="hover:underline">
                  {data.contactInfo.phoneNo}
                </a>
              </span>
            )}
            {data.contactInfo?.location && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {data.contactInfo.location}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.profileInfo?.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white px-3 py-1.5 mb-2 uppercase tracking-wide" style={{ backgroundColor: primaryColor }}>
              Summary
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed">
              {data.profileInfo.summary}
            </p>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white px-3 py-1.5 mb-2 uppercase tracking-wide" style={{ backgroundColor: primaryColor }}>
              Education
            </h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-3 pl-3 border-l-2" style={{ borderColor: lightColor }}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xs font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                  <span className="text-xs text-gray-600 italic whitespace-nowrap ml-2">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-medium">{edu.institute || 'Institution'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {data.workExperience && data.workExperience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white px-3 py-1.5 mb-2 uppercase tracking-wide" style={{ backgroundColor: primaryColor }}>
              Work Experience
            </h2>
            {data.workExperience.map((exp, index) => (
              <div key={index} className="mb-4 pl-3 border-l-2" style={{ borderColor: lightColor }}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">{exp.role || 'Job Title'}</h3>
                    <p className="text-xs font-semibold" style={{ color: primaryColor }}>{exp.company || 'Company Name'}</p>
                  </div>
                  <span className="text-xs text-gray-600 italic whitespace-nowrap ml-2">
                    {exp.startingDate} - {exp.endDate || 'Present'}
                  </span>
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
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white px-3 py-1.5 mb-2 uppercase tracking-wide" style={{ backgroundColor: primaryColor }}>
              Skills
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {data.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span className="text-xs text-gray-800 font-medium">{skill.name || 'Skill'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white px-3 py-1.5 mb-2 uppercase tracking-wide" style={{ backgroundColor: primaryColor }}>
              Projects
            </h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-3 pl-3 border-l-2" style={{ borderColor: lightColor }}>
                <h3 className="text-xs font-bold text-gray-900 mb-1">{project.title || 'Project Title'}</h3>
                {project.description && (
                  <p className="text-xs text-gray-700 leading-relaxed">{project.description}</p>
                )}
                <div className="flex gap-3 mt-1 text-xs" style={{ color: primaryColor }}>
                  {project.github && (
                    <a 
                      href={project.github.startsWith('http') ? project.github : `https://${project.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: primaryColor }}
                    >
                      • GitHub
                    </a>
                  )}
                  {project.liveDemo && (
                    <a 
                      href={project.liveDemo.startsWith('http') ? project.liveDemo : `https://${project.liveDemo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: primaryColor }}
                    >
                      • Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certificates && data.certificates.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white px-3 py-1.5 mb-2 uppercase tracking-wide" style={{ backgroundColor: primaryColor }}>
              Certifications
            </h2>
            <div className="space-y-2">
              {data.certificates.map((cert, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: lightColor, color: darkColor }}>
                    {cert.year || '2024'}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900">{cert.title || 'Certificate'}</h4>
                    <p className="text-xs text-gray-600">{cert.issuer || 'Issuer'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white px-3 py-1.5 mb-2 uppercase tracking-wide" style={{ backgroundColor: primaryColor }}>
              Languages
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {data.languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span className="text-xs text-gray-800 font-medium">{lang.name || 'Language'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {data.interests && data.interests.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white px-3 py-1.5 mb-2 uppercase tracking-wide" style={{ backgroundColor: primaryColor }}>
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: lightColor, color: darkColor }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Links Footer */}
        {(data.contactInfo?.linkedin || data.contactInfo?.github || data.contactInfo?.website) && (
          <div className="mt-6 pt-4 border-t-2" style={{ borderColor: lightColor }}>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {data.contactInfo?.linkedin && (
                <span className="flex items-center gap-1" style={{ color: primaryColor }}>
                  <span className="font-semibold">LinkedIn:</span>{' '}
                  <a 
                    href={data.contactInfo.linkedin.startsWith('http') ? data.contactInfo.linkedin : `https://${data.contactInfo.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: primaryColor }}
                  >
                    {data.contactInfo.linkedin.replace('https://', '').replace('http://', '')}
                  </a>
                </span>
              )}
              {data.contactInfo?.github && (
                <span className="flex items-center gap-1" style={{ color: primaryColor }}>
                  <span className="font-semibold">GitHub:</span>{' '}
                  <a 
                    href={data.contactInfo.github.startsWith('http') ? data.contactInfo.github : `https://${data.contactInfo.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: primaryColor }}
                  >
                    {data.contactInfo.github.replace('https://', '').replace('http://', '')}
                  </a>
                </span>
              )}
              {data.contactInfo?.website && (
                <span className="flex items-center gap-1" style={{ color: primaryColor }}>
                  <span className="font-semibold">Website:</span>{' '}
                  <a 
                    href={data.contactInfo.website.startsWith('http') ? data.contactInfo.website : `https://${data.contactInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: primaryColor }}
                  >
                    {data.contactInfo.website.replace('https://', '').replace('http://', '')}
                  </a>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicTemplate;
