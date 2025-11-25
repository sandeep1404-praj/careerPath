import { getAllColorPalettes } from '@/config/resumeThemes';

const ColorPaletteSelector = ({ selectedPalette, onPaletteSelect }) => {
  const palettes = getAllColorPalettes();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Color Palette</h3>
        <span className="text-sm text-gray-500">Pick your colors</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {palettes.map((palette) => (
          <button
            key={palette.id}
            onClick={() => onPaletteSelect(palette.id)}
            className={`group relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
              selectedPalette === palette.id
                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Selection Indicator */}
            {selectedPalette === palette.id && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Color Swatches */}
            <div className="flex gap-1 mb-2">
              {palette.colors.map((color, index) => (
                <div
                  key={index}
                  className="flex-1 h-12 rounded-lg shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {/* Palette Name */}
            <p className={`text-xs font-medium text-center truncate ${
              selectedPalette === palette.id ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {palette.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPaletteSelector;
