import React from 'react';

const RoadmapPreview = ({ roadmap, provider, fromCache, onAccept, accepting }) => {
	if (!roadmap) return null;

	return (
		<div className="bg-gray-800/70 border border-gray-700 rounded-xl p-5 mt-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
				<div>
					<h3 className="text-xl font-bold text-white">{roadmap.name}</h3>
					<p className="text-sm text-gray-300">{roadmap.track}</p>
					<p className="text-sm text-gray-400 mt-1">{roadmap.description}</p>
				</div>
				<div className="text-xs text-gray-400">
					<p>Provider: <span className="text-gray-200">{provider || 'unknown'}</span></p>
					<p>Cache: <span className="text-gray-200">{fromCache ? 'yes' : 'no'}</span></p>
					<p>Total Time: <span className="text-gray-200">{roadmap.totalEstimatedTime || 'N/A'}</span></p>
				</div>
			</div>

			<div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
				{(roadmap.tasks || []).map((task) => (
					<div key={task.id} className="bg-gray-900/70 border border-gray-700 rounded-lg p-4">
						<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
							<h4 className="text-white font-semibold">{task.order}. {task.name}</h4>
							<span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">{task.difficulty}</span>
						</div>
						<p className="text-sm text-gray-300 mb-2">{task.description}</p>
						<div className="text-xs text-gray-400 flex flex-wrap gap-3 mb-2">
							<span>⏱ {task.estimatedTime}</span>
							<span>📁 {task.category}</span>
							<span>🔗 {(task.resources || []).length} resources</span>
						</div>
						{(task.resources || []).length > 0 && (
							<div className="flex flex-wrap gap-2">
								{task.resources.map((resource, index) => (
									<a
										key={`${resource.url}-${index}`}
										href={resource.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
									>
										{resource.type}: {resource.title}
									</a>
								))}
							</div>
						)}
					</div>
				))}
			</div>

			<div className="mt-5 flex justify-end">
				<button
					onClick={onAccept}
					disabled={accepting}
					className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-60 text-white rounded-lg transition-colors"
				>
					{accepting ? 'Saving...' : 'Accept Roadmap'}
				</button>
			</div>
		</div>
	);
};

export default RoadmapPreview;
