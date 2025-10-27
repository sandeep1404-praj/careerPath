const EducationInput = ({ education, index, onChange, onRemove }) => {
  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-700">Education {index + 1}</h4>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Degree
          </label>
          <input
            type="text"
            value={education.degree}
            onChange={(e) =>
              onChange({
                ...education,
                degree: e.target.value,
              })
            }
            placeholder="e.g., B.Sc. Computer Science"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institution
          </label>
          <input
            type="text"
            value={education.institute}
            onChange={(e) =>
              onChange({
                ...education,
                institute: e.target.value,
              })
            }
            placeholder="e.g., XYZ University"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="text"
            value={education.startDate}
            onChange={(e) =>
              onChange({
                ...education,
                startDate: e.target.value,
              })
            }
            placeholder="e.g., Aug 2018"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="text"
            value={education.endDate}
            onChange={(e) =>
              onChange({
                ...education,
                endDate: e.target.value,
              })
            }
            placeholder="e.g., May 2022"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default EducationInput;
