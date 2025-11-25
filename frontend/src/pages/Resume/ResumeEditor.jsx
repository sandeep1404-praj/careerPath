import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeAPI, getInitialResumeData } from '@/api/resumeApi';
import ResumeForm from '@/components/Resume/ResumeForm';
import LiveResumePreview from '@/components/Resume/LiveResumePreview';
import { toast } from '@/utils/toast';

const ResumeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState(getInitialResumeData());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'preview'
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
    </div>
  );
};

export default ResumeEditor;
