import React from 'react';

const ProjectList = ({ projects, activeProjectId, onProjectSelect, onNewProject }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <button
            onClick={onNewProject}
            className="text-blue-600 hover:text-blue-700 transition-colors"
            title="New Project"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm">No projects yet</p>
            <p className="text-xs mt-1">Create your first project</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onProjectSelect(project.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  activeProjectId === project.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="text-xs text-gray-400">
                        {project.chatCount || 0} chats
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${
                      project.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
