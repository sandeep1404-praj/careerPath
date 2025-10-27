const ResumeSection = ({ title, icon, children }) => {
  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-7 hover:shadow-xl transition-all duration-300 hover:border-blue-200">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-gradient-to-r from-blue-500 to-purple-500" style={{ borderImage: 'linear-gradient(to right, #3b82f6, #a855f7) 1' }}>
        <span className="text-3xl filter drop-shadow-sm">{icon}</span>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
};

export default ResumeSection;
