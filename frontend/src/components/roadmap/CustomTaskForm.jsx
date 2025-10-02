import React, { useState } from 'react';
import { useRoadmap } from '../../contexts/RoadmapContext.jsx';

const CustomTaskForm = ({ onClose, className = '' }) => {
  const { createCustomTask } = useRoadmap();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'Beginner',
    category: '',
    estimatedTime: '',
    roadmapTrack: 'Custom',
    resources: []
  });

  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    type: 'article'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    
    if (formData.name.length > 100) {
      newErrors.name = 'Task name must be less than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate resources
    formData.resources.forEach((resource, index) => {
      if (resource.title && !resource.url) {
        newErrors[`resource_${index}`] = 'URL is required for this resource';
      }
      if (resource.url && !isValidUrl(resource.url)) {
        newErrors[`resource_${index}`] = 'Please enter a valid URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;
    
    if (!isValidUrl(newResource.url)) {
      setErrors(prev => ({ ...prev, newResource: 'Please enter a valid URL' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { ...newResource }]
    }));
    
    setNewResource({ title: '', url: '', type: 'article' });
    setErrors(prev => ({ ...prev, newResource: '' }));
  };

  const handleRemoveResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await createCustomTask(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Create Custom Task</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Task Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full bg-gray-700 text-white rounded-lg px-4 py-2 border ${
              errors.name ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:border-blue-500`}
            placeholder="e.g., Learn React Hooks"
            maxLength={100}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full bg-gray-700 text-white rounded-lg px-4 py-2 border ${
              errors.description ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:border-blue-500`}
            placeholder="Describe what this task involves..."
            rows={3}
            maxLength={500}
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Row with Difficulty, Category, Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g., Frontend, Backend"
            />
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estimated Time
            </label>
            <input
              type="text"
              value={formData.estimatedTime}
              onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g., 2 weeks, 3 hours"
            />
          </div>
        </div>

        {/* Track */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Track
          </label>
          <input
            type="text"
            value={formData.roadmapTrack}
            onChange={(e) => handleInputChange('roadmapTrack', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="Custom"
          />
        </div>

        {/* Resources */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Resources
          </label>
          
          {/* Existing resources */}
          {formData.resources.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.resources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <div>
                    <div className="text-white text-sm">{resource.title}</div>
                    <div className="text-gray-400 text-xs">{resource.url}</div>
                    <div className="text-blue-400 text-xs capitalize">{resource.type}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new resource */}
          <div className="bg-gray-700 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-600 text-white rounded px-3 py-2 border border-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Resource title"
              />
              <input
                type="url"
                value={newResource.url}
                onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                className="bg-gray-600 text-white rounded px-3 py-2 border border-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="https://..."
              />
              <select
                value={newResource.type}
                onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                className="bg-gray-600 text-white rounded px-3 py-2 border border-gray-500 focus:outline-none focus:border-blue-500"
              >
                <option value="article">📖 Article</option>
                <option value="video">🎥 Video</option>
                <option value="course">🎓 Course</option>
                <option value="practice">💻 Practice</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddResource}
              disabled={!newResource.title.trim() || !newResource.url.trim()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              Add Resource
            </button>
            {errors.newResource && (
              <p className="text-red-400 text-sm">{errors.newResource}</p>
            )}
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        {errors.submit && (
          <p className="text-red-400 text-sm text-center">{errors.submit}</p>
        )}
      </form>
    </div>
  );
};

export default CustomTaskForm;