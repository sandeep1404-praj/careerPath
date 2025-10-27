const LiveResumePreview = ({ resumeData }) => {
  const primaryColor = resumeData.template?.colorPalette?.[0] || '#7C3AED';
  const lightColor = '#F3F4F6';

  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="p-8 text-sm">
        <div className="grid grid-cols-[35%_65%] gap-0 min-h-full">
        {/* Left Sidebar - Purple/Lavender Background */}
        <div className="bg-gradient-to-b from-purple-100 to-purple-50 p-6 -ml-8 -mt-8 -mb-8">
          {/* Profile Image */}
          <div className="mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {(resumeData.profileInfo?.photo || resumeData.profileInfo?.profilePreviewUrl) ? (
                <img 
                  src={resumeData.profileInfo.photo || resumeData.profileInfo.profilePreviewUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-12 h-12 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <div className="space-y-3">
              {resumeData.contactInfo?.email && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs text-gray-700 break-all">{resumeData.contactInfo.email}</p>
                  </div>
                </div>
              )}
              {resumeData.contactInfo?.phoneNo && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs text-gray-700">{resumeData.contactInfo.phoneNo}</p>
                  </div>
                </div>
              )}
              {resumeData.contactInfo?.location && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs text-gray-700">{resumeData.contactInfo.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(resumeData.contactInfo?.linkedin || resumeData.contactInfo?.github || resumeData.contactInfo?.website) && (
            <div className="mb-6">
              <div className="space-y-2">
                {resumeData.contactInfo?.linkedin && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-purple-700">in</span>
                    </div>
                    <p className="text-xs text-gray-700 truncate">{resumeData.contactInfo.linkedin.replace('https://', '')}</p>
                  </div>
                )}
                {resumeData.contactInfo?.github && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-purple-700" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-700 truncate">{resumeData.contactInfo.github.replace('https://', '')}</p>
                  </div>
                )}
                {resumeData.contactInfo?.website && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-700 truncate">{resumeData.contactInfo.website.replace('https://', '')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education && resumeData.education.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Education</h3>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-900">{edu.degree || 'Degree'}</h4>
                  <p className="text-xs text-gray-700 italic">{edu.institute || 'Institution'}</p>
                  <p className="text-xs text-gray-600 mt-1">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {resumeData.languages && resumeData.languages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Languages</h3>
              {resumeData.languages.map((lang, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-800">{lang.name || 'Language'}</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          i < Math.round((lang.progress || 0) / 20) ? 'bg-purple-600' : 'bg-purple-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="p-6 pl-8">
          {/* Name and Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {resumeData.profileInfo?.fullName || 'John Doe'}
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              {resumeData.profileInfo?.designation || 'UI UX Designer'}
            </p>
          </div>

          {/* Professional Summary */}
          {resumeData.profileInfo?.summary && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-2 pb-1 border-b-2 border-gray-200">
                Professional Summary
              </h2>
              <p className="text-xs text-gray-700 leading-relaxed">
                {resumeData.profileInfo.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {resumeData.workExperience && resumeData.workExperience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">
                Work Experience
              </h2>
              {resumeData.workExperience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">{exp.company || 'Company Name'}</h3>
                      <p className="text-xs text-gray-700 font-medium">{exp.role || 'Job Title'}</p>
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

          {/* Projects */}
          {resumeData.projects && resumeData.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">
                Projects
              </h2>
              {resumeData.projects.map((project, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-xs font-bold text-gray-900">{project.title || 'Project Title'}</h3>
                  {project.description && (
                    <p className="text-xs text-gray-700 leading-relaxed mt-1">{project.description}</p>
                  )}
                  <div className="flex gap-4 mt-2">
                    {project.github && (
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-purple-700" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600">{project.github.split('/').pop()}</span>
                      </div>
                    )}
                    {project.liveDemo && (
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600">Live Demo</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {resumeData.skills && resumeData.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">
                Skills
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {resumeData.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-800">{skill.name || 'Skill'}</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-full rounded-full ${
                            i < Math.round((skill.progress || 0) / 20) ? 'bg-purple-600' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {resumeData.certificates && resumeData.certificates.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">
                Certifications
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {resumeData.certificates.map((cert, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
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
          {resumeData.interests && resumeData.interests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
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

export default LiveResumePreview;
