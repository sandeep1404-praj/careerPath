import { useState } from 'react';
import ResumeSection from './ResumeSection';
import SkillInput from './SkillInput';
import ProjectInput from './ProjectInput';
import EducationInput from './EducationInput';

const ResumeForm = ({ resumeData, setResumeData }) => {
  const [interestText, setInterestText] = useState('');
  const handleInputChange = (section, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleArrayAdd = (arrayName, newItem) => {
    setResumeData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], newItem],
    }));
  };

  const handleArrayUpdate = (arrayName, index, updatedItem) => {
    setResumeData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => (i === index ? updatedItem : item)),
    }));
  };

  const handleArrayRemove = (arrayName, index) => {
    setResumeData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleInterestAdd = (interest) => {
    if (interest.trim()) {
      setResumeData((prev) => ({
        ...prev,
        interests: [...prev.interests, interest.trim()],
      }));
    }
  };

  const handleInterestRemove = (index) => {
    setResumeData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Resume Title */}
      <ResumeSection title="Resume Title" icon="📝">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Title <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={resumeData.title}
            onChange={(e) =>
              setResumeData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g., Software Engineer Resume"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:border-gray-400 hover:bg-gray-100"
            required
          />
        </div>
      </ResumeSection>

      {/* Profile Information */}
      <ResumeSection title="Profile Information" icon="👤">
        {/* Profile Photo Upload */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Profile Photo
          </label>
          <div className="flex items-center gap-5 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all">
            {resumeData.profileInfo.photo && (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg ring-2 ring-purple-200">
                <img
                  src={resumeData.profileInfo.photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('profileInfo', 'photo', '')}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all shadow-md hover:scale-110"
                  title="Remove photo"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Check file size (max 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                      alert('Image size should be less than 2MB');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleInputChange('profileInfo', 'photo', reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer transition-all file:shadow-md hover:file:shadow-lg" style={{backgroundColor:'white', borderRadius:'13px'}}
              />
              <p className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Upload a professional photo (Max 2MB, JPG/PNG)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              Full Name
            </label>
            <input
              type="text"
              value={resumeData.profileInfo.fullName}
              onChange={(e) =>
                handleInputChange('profileInfo', 'fullName', e.target.value)
              }
              placeholder="John Doe"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:border-gray-400 hover:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              Designation
            </label>
            <input
              type="text"
              value={resumeData.profileInfo.designation}
              onChange={(e) =>
                handleInputChange('profileInfo', 'designation', e.target.value)
              }
              placeholder="Software Engineer"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:border-gray-400 hover:bg-gray-100"
            />
          </div>
        </div>
        <div className="mt-5">
          <label className="block text-sm font-semibold text-gray-800 mb-2.5">
            Professional Summary
          </label>
          <textarea
            value={resumeData.profileInfo.summary}
            onChange={(e) =>
              handleInputChange('profileInfo', 'summary', e.target.value)
            }
            placeholder="A brief summary about yourself and your career objectives..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:border-gray-400 hover:bg-gray-100 resize-none"
          />
        </div>
      </ResumeSection>

      {/* Contact Information */}
      <ResumeSection title="Contact Information" icon="📞">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </label>
            <input
              type="email"
              value={resumeData.contactInfo.email}
              onChange={(e) =>
                handleInputChange('contactInfo', 'email', e.target.value)
              }
              placeholder="john@example.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={resumeData.contactInfo.phoneNo}
              onChange={(e) =>
                handleInputChange('contactInfo', 'phoneNo', e.target.value)
              }
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              Location
            </label>
            <input
              type="text"
              value={resumeData.contactInfo.location}
              onChange={(e) =>
                handleInputChange('contactInfo', 'location', e.target.value)
              }
              placeholder="New York, NY"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              LinkedIn
            </label>
            <input
              type="url"
              value={resumeData.contactInfo.linkedin}
              onChange={(e) =>
                handleInputChange('contactInfo', 'linkedin', e.target.value)
              }
              placeholder="https://linkedin.com/in/johndoe"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              GitHub
            </label>
            <input
              type="url"
              value={resumeData.contactInfo.github}
              onChange={(e) =>
                handleInputChange('contactInfo', 'github', e.target.value)
              }
              placeholder="https://github.com/johndoe"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              Website
            </label>
            <input
              type="url"
              value={resumeData.contactInfo.website}
              onChange={(e) =>
                handleInputChange('contactInfo', 'website', e.target.value)
              }
              placeholder="https://johndoe.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
            />
          </div>
        </div>
      </ResumeSection>

      {/* Work Experience */}
      <ResumeSection title="Work Experience" icon="💼">
        {resumeData.workExperience.map((exp, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-700">Experience {index + 1}</h4>
              <button
                onClick={() => handleArrayRemove('workExperience', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={exp.company}
                onChange={(e) =>
                  handleArrayUpdate('workExperience', index, {
                    ...exp,
                    company: e.target.value,
                  })
                }
                placeholder="Company Name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
              />
              <input
                type="text"
                value={exp.role}
                onChange={(e) =>
                  handleArrayUpdate('workExperience', index, {
                    ...exp,
                    role: e.target.value,
                  })
                }
                placeholder="Job Title"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
              />
              <input
                type="text"
                value={exp.startingDate}
                onChange={(e) =>
                  handleArrayUpdate('workExperience', index, {
                    ...exp,
                    startingDate: e.target.value,
                  })
                }
                placeholder="Start Date (e.g., Jan 2020)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
              />
              <input
                type="text"
                value={exp.endDate}
                onChange={(e) =>
                  handleArrayUpdate('workExperience', index, {
                    ...exp,
                    endDate: e.target.value,
                  })
                }
                placeholder="End Date (or 'Present')"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
              />
            </div>
            <textarea
              value={exp.description}
              onChange={(e) =>
                handleArrayUpdate('workExperience', index, {
                  ...exp,
                  description: e.target.value,
                })
              }
              placeholder="Job responsibilities and achievements..."
              rows={3}
              className="w-full mt-4 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-white resize-none"
            />
          </div>
        ))}
        <button
          onClick={() =>
            handleArrayAdd('workExperience', {
              company: '',
              role: '',
              startingDate: '',
              endDate: '',
              description: '',
            })
          }
          className="mt-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 w-full"
        >
          + Add Work Experience
        </button>
      </ResumeSection>

      {/* Education */}
      <ResumeSection title="Education" icon="🎓">
        {resumeData.education.map((edu, index) => (
          <EducationInput
            key={index}
            education={edu}
            index={index}
            onChange={(updatedEdu) =>
              handleArrayUpdate('education', index, updatedEdu)
            }
            onRemove={() => handleArrayRemove('education', index)}
          />
        ))}
        <button
          onClick={() =>
            handleArrayAdd('education', {
              degree: '',
              institute: '',
              startDate: '',
              endDate: '',
            })
          }
          className="mt-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 w-full"
        >
          + Add Education
        </button>
      </ResumeSection>

      {/* Skills */}
      <ResumeSection title="Skills" icon="⚡">
        {resumeData.skills.map((skill, index) => (
          <SkillInput
            key={index}
            skill={skill}
            index={index}
            onChange={(updatedSkill) =>
              handleArrayUpdate('skills', index, updatedSkill)
            }
            onRemove={() => handleArrayRemove('skills', index)}
          />
        ))}
        <button
          onClick={() =>
            handleArrayAdd('skills', { name: '', progress: 50 })
          }
          className="mt-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 w-full"
        >
          + Add Skill
        </button>
      </ResumeSection>

      {/* Projects */}
      <ResumeSection title="Projects" icon="🚀">
        {resumeData.projects.map((project, index) => (
          <ProjectInput
            key={index}
            project={project}
            index={index}
            onChange={(updatedProject) =>
              handleArrayUpdate('projects', index, updatedProject)
            }
            onRemove={() => handleArrayRemove('projects', index)}
          />
        ))}
        <button
          onClick={() =>
            handleArrayAdd('projects', {
              title: '',
              description: '',
              github: '',
              liveDemo: '',
            })
          }
          className="mt-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 w-full"
        >
          + Add Project
        </button>
      </ResumeSection>

      {/* Certificates */}
      <ResumeSection title="Certificates" icon="🏆">
        {resumeData.certificates.map((cert, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-700">Certificate {index + 1}</h4>
              <button
                onClick={() => handleArrayRemove('certificates', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={cert.title}
                onChange={(e) =>
                  handleArrayUpdate('certificates', index, {
                    ...cert,
                    title: e.target.value,
                  })
                }
                placeholder="Certificate Title"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
              />
              <input
                type="text"
                value={cert.issuer}
                onChange={(e) =>
                  handleArrayUpdate('certificates', index, {
                    ...cert,
                    issuer: e.target.value,
                  })
                }
                placeholder="Issuing Organization"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
              />
              <input
                type="text"
                value={cert.year}
                onChange={(e) =>
                  handleArrayUpdate('certificates', index, {
                    ...cert,
                    year: e.target.value,
                  })
                }
                placeholder="Year (e.g., 2023)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
              />
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            handleArrayAdd('certificates', {
              title: '',
              issuer: '',
              year: '',
            })
          }
          className="mt-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 w-full"
        >
          + Add Certificate
        </button>
      </ResumeSection>

      {/* Languages */}
      <ResumeSection title="Languages" icon="🌍">
        {resumeData.languages.map((lang, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-700">Language {index + 1}</h4>
              <button
                onClick={() => handleArrayRemove('languages', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <input
                type="text"
                value={lang.name}
                onChange={(e) =>
                  handleArrayUpdate('languages', index, {
                    ...lang,
                    name: e.target.value,
                  })
                }
                placeholder="Language Name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 hover:border-gray-400 hover:bg-gray-100"
              />
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Proficiency: {lang.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lang.progress}
                  onChange={(e) =>
                    handleArrayUpdate('languages', index, {
                      ...lang,
                      progress: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            handleArrayAdd('languages', { name: '', progress: 50 })
          }
          className="mt-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 w-full"
        >
          + Add Language
        </button>
      </ResumeSection>

      {/* Interests */}
      <ResumeSection title="Interests" icon="🎯">
        <div className="flex flex-wrap gap-2 mb-4">
          {resumeData.interests.map((interest, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full"
            >
              <span>{interest}</span>
              <button
                onClick={() => handleInterestRemove(index)}
                className="text-purple-700 hover:text-purple-900"
                aria-label={`Remove ${interest}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={interestText}
            onChange={(e) => setInterestText(e.target.value)}
            placeholder="Add an interest (e.g., Photography, Reading)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleInterestAdd(interestText);
                setInterestText('');
              }
            }}
          />
          <button
            onClick={() => {
              handleInterestAdd(interestText);
              setInterestText('');
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Add
          </button>
        </div>
      </ResumeSection>
    </div>
  );
};

export default ResumeForm;






