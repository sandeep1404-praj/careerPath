const SkillInput = ({ skill, index, onChange, onRemove }) => {
  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-700">Skill {index + 1}</h4>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove
        </button>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          value={skill.name}
          onChange={(e) =>
            onChange({
              ...skill,
              name: e.target.value,
            })
          }
          placeholder="Skill name (e.g., JavaScript, Python)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-600">Proficiency Level</label>
            <span className="text-sm font-semibold text-blue-600">
              {skill.progress}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={skill.progress}
            onChange={(e) =>
              onChange({
                ...skill,
                progress: parseInt(e.target.value),
              })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Expert</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillInput;
