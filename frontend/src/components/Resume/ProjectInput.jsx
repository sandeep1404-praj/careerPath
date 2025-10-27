const ProjectInput = ({ project, index, onChange, onRemove }) => {
  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-700">Project {index + 1}</h4>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Title
          </label>
          <input
            type="text"
            value={project.title}
            onChange={(e) =>
              onChange({
                ...project,
                title: e.target.value,
              })
            }
            placeholder="e.g., E-commerce Website"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={project.description}
            onChange={(e) =>
              onChange({
                ...project,
                description: e.target.value,
              })
            }
            placeholder="Describe the project, technologies used, and your role..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Link
            </label>
            <input
              type="url"
              value={project.github}
              onChange={(e) =>
                onChange({
                  ...project,
                  github: e.target.value,
                })
              }
              placeholder="https://github.com/username/project"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Live Demo Link
            </label>
            <input
              type="url"
              value={project.liveDemo}
              onChange={(e) =>
                onChange({
                  ...project,
                  liveDemo: e.target.value,
                })
              }
              placeholder="https://project-demo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInput;
