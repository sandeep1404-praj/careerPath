import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeAPI } from '@/api/resumeApi';
import ResumeCard from '@/components/Resume/ResumeCard';
import { toast } from '@/utils/toast';

const ResumeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserResumes();
  }, [user]);

  const fetchUserResumes = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await resumeAPI.getUserResumes(user._id);
      setResumes(response.data || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError(err.message || 'Failed to load resumes');
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/resumes/new');
  };

  const handleEdit = (resumeId) => {
    navigate(`/resumes/edit/${resumeId}`);
  };

  const handlePreview = (resumeId) => {
    navigate(`/resumes/preview/${resumeId}`);
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      await resumeAPI.deleteResume(resumeId);
      toast.success('Resume deleted successfully');
      // Remove the deleted resume from state
      setResumes(resumes.filter(resume => resume._id !== resumeId));
    } catch (err) {
      console.error('Error deleting resume:', err);
      toast.error('Failed to delete resume');
    }
  };

  const handleDuplicate = async (resume) => {
    if (!user?._id) {
      toast.error('Please log in to duplicate resumes');
      return;
    }

    try {
      // Create a copy without the _id and timestamps
      const { _id, createdAt, updatedAt, ...resumeData } = resume;
      const duplicatedResume = {
        ...resumeData,
        title: `${resume.title} (Copy)`,
        userId: user._id,
      };

      const response = await resumeAPI.createResume(duplicatedResume);
      toast.success('Resume duplicated successfully');
      const newResume = response.data;
      setResumes([newResume, ...resumes]);
    } catch (err) {
      console.error('Error duplicating resume:', err);
      toast.error('Failed to duplicate resume');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchUserResumes}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="mt-1 text-gray-600">
              Manage and organize all your resumes in one place
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Resume
          </button>
        </div>

        {/* Resume Grid */}
        {resumes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No resumes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first resume
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                onEdit={handleEdit}
                onPreview={handlePreview}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {resumes.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            <p>
              Total Resumes: <span className="font-semibold">{resumes.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDashboard;
