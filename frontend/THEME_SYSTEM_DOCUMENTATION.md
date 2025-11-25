# Resume Theme and Color Palette System

## Overview
The resume builder now includes a comprehensive theming system that allows users to:
- Choose from 3 different resume templates
- Select from 10 pre-designed color palettes
- See live preview updates as they customize their resume

## Templates

### 1. Modern Sidebar (Default)
- **ID**: `modern`
- **Layout**: Two-column layout with left sidebar (35%) and main content area (65%)
- **Best for**: Contemporary professionals, tech industry
- **Features**:
  - Profile photo in sidebar
  - Contact info with icons
  - Education and languages in sidebar
  - Work experience and projects in main area
  - Skill progress bars

### 2. Classic Professional
- **ID**: `classic`
- **Layout**: Single-column traditional layout with header
- **Best for**: Traditional industries, executive positions
- **Features**:
  - Centered header with contact info
  - Clean section dividers
  - Bullet-pointed skills
  - Professional formatting
  - Emphasis on experience and education

### 3. Creative Bold
- **ID**: `creative`
- **Layout**: Header with large photo, two-column content
- **Best for**: Creative industries, designers, artists
- **Features**:
  - Large circular profile photo in colored header
  - Gradient header background
  - Timeline-style experience section
  - Sidebar with skills and languages
  - Modern, eye-catching design

## Color Palettes

Each palette contains 3 colors:
1. **Primary Color**: Main accent color (headings, borders, buttons)
2. **Dark Color**: Darker shade (text accents, icons)
3. **Light Color**: Lighter shade (backgrounds, subtle accents)

### Available Palettes

| Palette ID | Name | Primary | Dark | Light |
|------------|------|---------|------|-------|
| `purple` | Purple Elegance | #7C3AED | #5B21B6 | #A78BFA |
| `blue` | Ocean Blue | #3B82F6 | #1E40AF | #60A5FA |
| `green` | Forest Green | #10B981 | #047857 | #34D399 |
| `orange` | Sunset Orange | #F59E0B | #D97706 | #FBBf24 |
| `red` | Ruby Red | #EF4444 | #B91C1C | #F87171 |
| `teal` | Teal Wave | #14B8A6 | #0F766E | #2DD4BF |
| `indigo` | Indigo Night | #6366F1 | #4338CA | #818CF8 |
| `pink` | Rose Pink | #EC4899 | #BE185D | #F472B6 |
| `slate` | Professional Slate | #475569 | #1E293B | #64748B |
| `emerald` | Emerald Gem | #059669 | #065F46 | #10B981 |

## File Structure

```
frontend/src/
├── config/
│   └── resumeThemes.js          # Theme and palette configurations
├── components/Resume/
│   ├── ThemeSelector.jsx        # Template selection UI
│   ├── ColorPaletteSelector.jsx # Color palette selection UI
│   ├── LiveResumePreview.jsx    # Template switcher component
│   └── templates/
│       ├── ModernTemplate.jsx   # Modern sidebar template
│       ├── ClassicTemplate.jsx  # Classic professional template
│       └── CreativeTemplate.jsx # Creative bold template
└── pages/Resume/
    └── ResumeEditor.jsx         # Main editor with theme controls
```

## Data Structure

### Resume Template Object
```javascript
{
  template: {
    theme: "modern",           // Template ID: 'modern', 'classic', or 'creative'
    colorPalette: "purple",    // Palette ID
    colors: [                  // Actual color values
      "#7C3AED",              // Primary
      "#5B21B6",              // Dark
      "#A78BFA"               // Light
    ]
  }
}
```

## Usage

### In Resume Editor
1. Navigate to the resume editor
2. At the top of the form, you'll see "Customize Appearance"
3. Select your preferred template from 3 options
4. Choose a color palette from 10 options
5. The preview updates in real-time
6. Save your resume - the theme settings are preserved

### Programmatically

```javascript
import { getColorPalette, getTheme } from '@/config/resumeThemes';

// Get a specific palette
const purplePalette = getColorPalette('purple');
// Returns: { id: 'purple', name: 'Purple Elegance', colors: [...] }

// Get a specific theme
const modernTheme = getTheme('modern');
// Returns: { id: 'modern', name: 'Modern Sidebar', description: '...', thumbnail: '📱' }
```

## How It Works

1. **Theme Selection**: User selects a template, updating `resumeData.template.theme`
2. **Color Selection**: User selects a palette, updating `resumeData.template.colorPalette` and `colors[]`
3. **Live Preview**: `LiveResumePreview` component switches between template components based on selected theme
4. **Template Rendering**: Each template component receives `resumeData` and applies colors from the palette
5. **Persistence**: Theme settings are saved to database along with resume data
6. **PDF Export**: When downloading, the selected template and colors are applied to the exported PDF

## Backend Schema

```javascript
// backend/models/resume.js
template: {
  theme: { type: String },           // 'modern', 'classic', 'creative'
  colorPalette: { type: String },    // 'purple', 'blue', etc.
  colors: { type: [String] }         // ['#7C3AED', '#5B21B6', '#A78BFA']
}
```

## Customization

### Adding a New Template

1. Create new template component in `frontend/src/components/Resume/templates/`
2. Add theme config to `resumeThemes.js`:
   ```javascript
   newTheme: {
     id: 'newTheme',
     name: 'New Theme',
     description: 'Description here',
     thumbnail: '🎨',
   }
   ```
3. Update `LiveResumePreview.jsx` switch statement
4. Import and add case for new template

### Adding a New Color Palette

Add to `COLOR_PALETTES` in `resumeThemes.js`:
```javascript
customPalette: {
  id: 'customPalette',
  name: 'Custom Palette',
  colors: ['#PRIMARY', '#DARK', '#LIGHT'],
}
```

## Tips for Users

- **Modern** template works best with all data fields filled
- **Classic** template is ideal for text-heavy resumes
- **Creative** template showcases photos and visual elements
- Darker palettes (slate, indigo) appear more professional
- Brighter palettes (orange, pink) stand out more
- All templates are optimized for printing and PDF export
