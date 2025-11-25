import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeAPI, getInitialResumeData } from '@/api/resumeApi';
import ResumeForm from '@/components/Resume/ResumeForm';
import LiveResumePreview from '@/components/Resume/LiveResumePreview';
import ThemeSelector from '@/components/Resume/ThemeSelector';
import ColorPaletteSelector from '@/components/Resume/ColorPaletteSelector';
import { getColorPalette } from '@/config/resumeThemes';
import { toast } from '@/utils/toast';

const ResumeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState(getInitialResumeData());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'preview'
  const [showThemeModal, setShowThemeModal] = useState(false);
  const isEditMode = !!id;
  const previewRef = useRef(null);

  useEffect(() => {
    if (isEditMode) {
      fetchResumeData();
    }
  }, [id]);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResumeById(id);
      setResumeData(response.data);
    } catch (err) {
      console.error('Error fetching resume:', err);
      toast.error('Failed to load resume');
      navigate('/resumes');
    } finally {
      setLoading(false);
    }
  };

  const captureThumbnail = async () => {
    try {
      const node = previewRef.current;
      if (!node) return '';

      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
      });

      // Downscale to a reasonable thumbnail width
      const targetWidth = 480; // px
      const ratio = targetWidth / canvas.width;
      const targetHeight = Math.round(canvas.height * ratio);
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = targetWidth;
      thumbCanvas.height = targetHeight;
      const ctx = thumbCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      return thumbCanvas.toDataURL('image/jpeg', 0.8);
    } catch (e) {
      console.warn('Thumbnail capture failed:', e);
      return '';
    }
  };

  const handleSave = async () => {
    if (!user?._id) {
      toast.error('Please log in to save resumes');
      navigate('/login');
      return;
    }

    try {
      setSaving(true);

      // Validate required fields
      if (!resumeData.title || resumeData.title.trim() === '') {
        toast.error('Please enter a resume title');
        return;
      }

      const dataToSave = {
        ...resumeData,
        userId: user._id,
      };

      // Try to capture a fresh thumbnail from the live preview
      const thumb = await captureThumbnail();
      if (thumb) {
        dataToSave.thumbnail = thumb;
      }

      if (isEditMode) {
        await resumeAPI.updateResume(id, dataToSave);
        toast.success('Resume updated successfully');
      } else {
        const response = await resumeAPI.createResume(dataToSave);
        toast.success('Resume created successfully');
        // Navigate to edit mode with the new resume ID
        const resumeId = response.data?._id;
        if (resumeId) {
          navigate(`/resumes/edit/${resumeId}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Error saving resume:', err);
      toast.error(err.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (isEditMode) {
      navigate(`/resumes/preview/${id}`);
    } else {
      toast.info('Please save the resume first to preview');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/resumes');
    }
  };

  // Handle theme selection
  const handleThemeSelect = (themeId) => {
    setResumeData((prev) => ({
      ...prev,
      template: {
        ...prev.template,
        theme: themeId,
      },
    }));
  };

  // Handle color palette selection
  const handlePaletteSelect = (paletteId) => {
    const palette = getColorPalette(paletteId);
    setResumeData((prev) => ({
      ...prev,
      template: {
        ...prev.template,
        colorPalette: paletteId,
        colors: palette.colors, // Store the actual colors array for backend
      },
    }));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Fixed Header */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-6 py-3 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">
                  {isEditMode ? '✏️' : '📝'}
                </span>
                <span className="truncate">{isEditMode ? 'Edit Resume' : 'Create New Resume'}</span>
              </h1>
              <Link
                to="/resumes"
                className="text-xs sm:text-sm text-blue-600 hover:underline"
              > Move to Dashboard</Link>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowThemeModal(true)}
                className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 border-2 border-purple-300 text-purple-700 bg-purple-50 rounded-xl hover:bg-purple-100 hover:border-purple-400 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="hidden sm:inline">Change Theme</span>
                <span className="sm:hidden">Theme</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-blue-400 disabled:to-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">{isEditMode ? 'Save Changes' : 'Create Resume'}</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden mt-3 flex gap-2 border-t pt-3">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Edit Form
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Split View Container */}
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left Side - Form Editor */}
          <div className={`${
            activeTab === 'form' ? 'block' : 'hidden'
          } lg:block bg-gradient-to-b from-white to-gray-50 lg:border-r border-gray-200 overflow-y-auto shadow-inner`} style={{ maxHeight: 'calc(100vh - 90px)' }}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-3xl mx-auto">
                <ResumeForm
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Live Preview */}
          <div className={`${
            activeTab === 'preview' ? 'block' : 'hidden'
          } lg:block bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 overflow-y-auto lg:sticky lg:top-[90px]`} style={{ maxHeight: 'calc(100vh - 90px)' }}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div ref={previewRef} className="bg-white rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 hover:shadow-3xl transition-shadow duration-300 mx-auto" style={{ maxWidth: '100%', aspectRatio: '8.5/11' }}>
                <LiveResumePreview resumeData={resumeData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Customization Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Customize Resume Theme</h2>
                  <p className="text-sm text-gray-600">Choose your template and color palette</p>
                </div>
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Selectors */}
                <div className="space-y-6">
                  <ThemeSelector
                    selectedTheme={resumeData.template?.theme || 'modern'}
                    onThemeSelect={handleThemeSelect}
                  />
                  
                  <ColorPaletteSelector
                    selectedPalette={resumeData.template?.colorPalette || 'purple'}
                    onPaletteSelect={handlePaletteSelect}
                  />
                </div>

                {/* Right Side - Live Preview */}
                <div className="lg:sticky lg:top-0">
                  <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Live Preview
                    </h3>
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200" style={{ height: '500px' }}>
                      <div className="h-full overflow-auto">
                        <LiveResumePreview resumeData={resumeData} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-600">
                Changes will be applied instantly to your resume
              </p>
              <button
                onClick={() => setShowThemeModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeEditor;
