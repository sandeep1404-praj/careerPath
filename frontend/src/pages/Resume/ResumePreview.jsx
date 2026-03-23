import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI } from '@/api/resumeApi';
import LiveResumePreview from '@/components/Resume/LiveResumePreview';
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
        /* Force hide all layout elements except resume */
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
        /* Preserve all inline styles and gradients */
        [style*="background"] {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        /* Preserve rounded elements */
        .rounded-full,
        .rounded-lg,
        .rounded-xl,
        .rounded {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
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
      // Show loading toast
      toast.info('Generating PDF...');
      
      // Import libraries dynamically
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const element = previewRef.current;
      if (!element) {
        toast.error('Unable to generate PDF');
        return;
      }

      // Temporarily scroll to top to ensure proper positioning
      const originalScrollTop = element.scrollTop;
      element.scrollTop = 0;

      // Wait a bit for any rendering to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Store all links with their positions RELATIVE to the element
      const linkElements = Array.from(element.querySelectorAll('a[href]'));
      const elementRect = element.getBoundingClientRect();
      
      const linkData = linkElements.map((link) => {
        const rect = link.getBoundingClientRect();
        return {
          href: link.getAttribute('href'),
          x: rect.left - elementRect.left,
          y: rect.top - elementRect.top + element.scrollTop,
          width: rect.width,
          height: rect.height,
        };
      });

      // Capture the resume as canvas with high quality and proper color rendering
      const scale = 3;
      const canvas = await html2canvas(element, {
        scale: scale, // Higher quality
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        imageTimeout: 0,
        removeContainer: true,
      });

      // Restore scroll position
      element.scrollTop = originalScrollTop;

      const imgData = canvas.toDataURL('image/jpeg', 0.98); // Use JPEG with high quality
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit A4 properly
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
      
      const scaledWidth = imgWidth * 0.264583 * ratio;
      const scaledHeight = imgHeight * 0.264583 * ratio;

      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = 0;

      // Add the image with proper scaling
      pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight, '', 'FAST');

      // Add clickable links on top of the image (WITHOUT visible underlines)
      linkData.forEach((link) => {
        try {
          // Calculate relative position (percentage of the original element dimensions)
          const relativeX = link.x / element.scrollWidth;
          const relativeY = link.y / element.scrollHeight;
          const relativeWidth = link.width / element.scrollWidth;
          const relativeHeight = link.height / element.scrollHeight;

          // Apply these percentages to the PDF image dimensions
          const linkX = x + (relativeX * scaledWidth);
          const linkY = y + (relativeY * scaledHeight);
          const linkWidth = relativeWidth * scaledWidth;
          const linkHeight = relativeHeight * scaledHeight;

          // Ensure the link is within PDF bounds
          if (linkX >= 0 && linkY >= 0 && linkX + linkWidth <= pdfWidth && linkY + linkHeight <= pdfHeight) {
            // Add invisible clickable link area
            pdf.link(linkX, linkY, linkWidth, linkHeight, { url: link.href });
          }
        } catch (err) {
          console.warn('Failed to add link:', link.href, err);
        }
      });

      // Download the PDF
      const filename = `${resume?.title || 'resume'}.pdf`;
      pdf.save(filename);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
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
      <div className="print:hidden bg-white shadow-sm border-b border-gray-200 top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <button
              onClick={() => navigate('/resumes')}
              className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </button>
            <div className="flex gap-2 sm:gap-3">
              <button onClick={handleEdit} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs sm:text-sm">
                Edit
              </button>
              <button onClick={handlePrint} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs sm:text-sm">
                Print
              </button>
              <button onClick={handleDownload} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm">
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="max-w-5xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8 print:p-0 print:max-w-none print:m-0">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div ref={previewRef} className="bg-white print:p-0" style={{ minHeight: '297mm' }}>
            <LiveResumePreview resumeData={resume} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
