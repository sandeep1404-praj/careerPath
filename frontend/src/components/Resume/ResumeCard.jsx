import { useEffect, useState } from 'react';

const ResumeCard = ({ resume, onEdit, onPreview, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imgVisible, setImgVisible] = useState(true);

  // Hide thumbnails from known invalid remote hosts and broken URLs
  useEffect(() => {
    const url = resume?.thumbnail;
    if (!url) {
      setImgVisible(false);
      return;
    }
    try {
      const parsed = new URL(url, window.location.origin);
      // Block loading thumbnails from the demo domain that returns 400
      if (parsed.hostname.endsWith('resumebuilder.app')) {
        setImgVisible(false);
      } else {
        setImgVisible(true);
      }
    } catch {
      // Not a full URL (could be data URL or relative); allow and handle onError
      setImgVisible(true);
    }
  }, [resume?.thumbnail]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      {/* Thumbnail/Preview */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center relative">
        {resume.thumbnail && imgVisible ? (
          <img
            src={resume.thumbnail}
            alt={resume.title}
            className="w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
            onError={() => setImgVisible(false)}
          />
        ) : (
          <div className="text-center p-4">
            <div className="text-6xl mb-2">📄</div>
            <p className="text-sm text-gray-600 font-medium">
              {resume.profileInfo?.fullName || 'Resume Preview'}
            </p>
          </div>
        )}
        
        {/* Menu Button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDuplicate(resume);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(resume._id);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 rounded-b-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {resume.title}
        </h3>
        
        {resume.profileInfo?.designation && (
          <p className="text-sm text-gray-600 mb-2 truncate">
            {resume.profileInfo.designation}
          </p>
        )}

        <div className="text-xs text-gray-500 mb-4">
          <p>Last updated: {formatDate(resume.updatedAt)}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(resume._id)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Preview
          </button>
          <button
            onClick={() => onEdit(resume._id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ResumeCard;
