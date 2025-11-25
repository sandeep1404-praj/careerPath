import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import CreativeTemplate from './templates/CreativeTemplate';

const LiveResumePreview = ({ resumeData }) => {
  // Get the selected theme, default to 'modern'
  const selectedTheme = resumeData.template?.theme || 'modern';
  
  // Debug logging
  console.log('LiveResumePreview - Selected Theme:', selectedTheme);
  console.log('LiveResumePreview - Color Palette:', resumeData.template?.colorPalette);
  console.log('LiveResumePreview - Colors:', resumeData.template?.colors);

  // Render the appropriate template based on selection
  const renderTemplate = () => {
    switch (selectedTheme) {
      case 'classic':
        return <ClassicTemplate resumeData={resumeData} />;
      case 'creative':
        return <CreativeTemplate resumeData={resumeData} />;
      case 'modern':
      default:
        return <ModernTemplate resumeData={resumeData} />;
    }
  };

  return renderTemplate();
};

export default LiveResumePreview;
