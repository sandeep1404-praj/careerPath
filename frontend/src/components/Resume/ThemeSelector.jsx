import { getAllThemes } from '@/config/resumeThemes';

const ThemeSelector = ({ selectedTheme, onThemeSelect }) => {
  const themes = getAllThemes();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Resume Template</h3>
        <span className="text-sm text-gray-500">Choose a layout</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeSelect(theme.id)}
            className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
              selectedTheme === theme.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Selection Indicator */}
            {selectedTheme === theme.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Theme Icon */}
            <div className="text-4xl mb-3 text-center">{theme.thumbnail}</div>

            {/* Theme Info */}
            <div className="text-center">
              <h4 className={`font-semibold mb-1 ${
                selectedTheme === theme.id ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {theme.name}
              </h4>
              <p className="text-xs text-gray-600">{theme.description}</p>
            </div>

            {/* Hover Effect */}
            <div className={`absolute inset-0 rounded-xl transition-opacity ${
              selectedTheme === theme.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
