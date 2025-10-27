import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI } from '@/api/resumeApi';
import { toast } from '@/utils/toast';

const ResumePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const previewRef = useRef(null);

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        /* Force hide all layout elements */
        nav, header, footer, 
        [class*="navbar"], [class*="Navbar"],
        [class*="footer"], [class*="Footer"],
        [class*="header"], [class*="Header"],
        .sidebar, [class*="sidebar"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        /* Only show the resume preview container */
        body * {
          visibility: hidden;
        }
        .resume-preview-container,
        .resume-preview-container * {
          visibility: visible;
        }
        .resume-preview-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
        }
        /* Remove any black backgrounds */
        * {
          background-color: transparent !important;
        }
        .resume-preview-container {
          background: white !important;
        }
        .bg-gradient-to-b {
          background: linear-gradient(to bottom, #f3e8ff, #faf5ff) !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResumeById(id);
      setResume(response.data);
    } catch (err) {
      console.error('Error fetching resume:', err);
      toast.error('Failed to load resume');
      navigate('/resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/resumes/edit/${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const node = previewRef.current;
      if (!node) {
        toast.error('Preview not ready to download');
        return;
      }

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      } else {
        let remainingHeight = imgHeight;
        let y = 0;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'JPEG', 0, y, imgWidth, imgHeight, undefined, 'FAST');
          remainingHeight -= pageHeight;
          if (remainingHeight > 0) {
            pdf.addPage();
            y = -remainingHeight;
          }
        }
      }

      pdf.save(`${resume?.title || 'resume'}.pdf`);
      toast.success('Downloaded PDF');
    } catch (e) {
      console.error('PDF download failed:', e);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Resume not found</p>
          <button
            onClick={() => navigate('/resumes')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white resume-preview-container">
      {/* Action Bar (hidden when printing) */}
      <div className="print:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/resumes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <div className="flex gap-3">
              <button onClick={handleEdit} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Edit
              </button>
              <button onClick={handlePrint} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Print
              </button>
              <button onClick={handleDownload} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:max-w-none print:m-0">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div ref={previewRef} className="bg-white p-8 text-sm print:p-0" style={{ minHeight: '297mm' }}>
            <div className="grid grid-cols-[35%_65%] gap-0 min-h-full">
              {/* Left Sidebar */}
              <div className="bg-gradient-to-b from-purple-100 to-purple-50 p-6 -ml-8 -mt-8 -mb-8 print:m-0 print:p-6">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {(resume.profileInfo?.photo || resume.profileInfo?.profilePreviewUrl) ? (
                      <img src={resume.profileInfo.photo || resume.profileInfo.profilePreviewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="space-y-3">
                    {resume.contactInfo?.email && (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 pt-1"><p className="text-xs text-gray-700 break-all">{resume.contactInfo.email}</p></div>
                      </div>
                    )}
                    {resume.contactInfo?.phoneNo && (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1 pt-1"><p className="text-xs text-gray-700">{resume.contactInfo.phoneNo}</p></div>
                      </div>
                    )}
                    {resume.contactInfo?.location && (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 pt-1"><p className="text-xs text-gray-700">{resume.contactInfo.location}</p></div>
                      </div>
                    )}
                  </div>
                </div>

                {(resume.contactInfo?.linkedin || resume.contactInfo?.github || resume.contactInfo?.website) && (
                  <div className="mb-6">
                    <div className="space-y-2">
                      {resume.contactInfo?.linkedin && (
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-purple-700 font-bold">in</span>
                          </div>
                          <div className="flex-1 pt-0.5"><p className="text-xs text-gray-700 break-all leading-tight">{resume.contactInfo.linkedin.replace('https://', '').replace('http://', '')}</p></div>
                        </div>
                      )}
                      {resume.contactInfo?.github && (
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-purple-700" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 pt-0.5"><p className="text-xs text-gray-700 break-all leading-tight">{resume.contactInfo.github.replace('https://', '').replace('http://', '')}</p></div>
                        </div>
                      )}
                      {resume.contactInfo?.website && (
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          </div>
                          <div className="flex-1 pt-0.5"><p className="text-xs text-gray-700 break-all leading-tight">{resume.contactInfo.website.replace('https://', '').replace('http://', '')}</p></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {resume.education && resume.education.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Education</h3>
                    {resume.education.map((edu, index) => (
                      <div key={index} className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-900">{edu.degree || 'Degree'}</h4>
                        <p className="text-xs text-gray-700 italic">{edu.institute || 'Institution'}</p>
                        <p className="text-xs text-gray-600 mt-1">{edu.startDate} - {edu.endDate}</p>
                      </div>
                    ))}
                  </div>
                )}

                {resume.languages && resume.languages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Languages</h3>
                    {resume.languages.map((lang, index) => (
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

              {/* Right Content */}
              <div className="p-6 pl-8 print:p-6 print:pl-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{resume.profileInfo?.fullName || 'John Doe'}</h1>
                  <p className="text-lg text-gray-600 font-medium">{resume.profileInfo?.designation || 'UI UX Designer'}</p>
                </div>

                {resume.profileInfo?.summary && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-2 pb-1 border-b-2 border-gray-200">Professional Summary</h2>
                    <p className="text-xs text-gray-700 leading-relaxed">{resume.profileInfo.summary}</p>
                  </div>
                )}

                {resume.workExperience && resume.workExperience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">Work Experience</h2>
                    {resume.workExperience.map((exp, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">{exp.company || 'Company'}</h3>
                            <p className="text-xs text-gray-700 font-medium">{exp.role || 'Role'}</p>
                          </div>
                          <p className="text-xs text-gray-600 italic whitespace-nowrap ml-2">{exp.startingDate} - {exp.endDate || 'Present'}</p>
                        </div>
                        {exp.description && <p className="text-xs text-gray-700 leading-relaxed mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {resume.projects && resume.projects.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">Projects</h2>
                    {resume.projects.map((project, index) => (
                      <div key={index} className="mb-4">
                        <h3 className="text-xs font-bold text-gray-900">{project.title || 'Project'}</h3>
                        {project.description && <p className="text-xs text-gray-700 leading-relaxed mt-1">{project.description}</p>}
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

                {resume.skills && resume.skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">Skills</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {resume.skills.map((skill, index) => (
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

                {resume.certificates && resume.certificates.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">Certifications</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {resume.certificates.map((cert, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">{cert.year || '2024'}</div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-900">{cert.title || 'Certificate'}</h4>
                            <p className="text-xs text-gray-600">{cert.issuer || 'Issuer'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resume.interests && resume.interests.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b-2 border-gray-200">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                      {resume.interests.map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
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
      </div>
    </div>
  );
};

export default ResumePreview;
