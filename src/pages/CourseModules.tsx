import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Play, CheckCircle, Clock4, X, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';
import ApiService from '../services/ApiService';
import { getImageUrl } from '../utils/imageUpload';

const CourseModules: React.FC = () => {
  const { courseId } = useParams();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load course and modules from API
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load course info and modules in parallel
        const [courseData, modulesData] = await Promise.all([
          ApiService.getCourseById(courseId),
          ApiService.getCourseModules(courseId)
        ]);
        
        setCourseInfo(courseData);
        setModules(modulesData);
      } catch (error) {
        console.error('Failed to load course data:', error);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  const columns = [
    {
      key: 'thumbnail',
      label: 'Preview',
      render: (value: string) => (
        <img src={value} alt="Module" className="w-12 h-8 object-cover rounded" />
      )
    },
    { 
      key: 'title', 
      label: 'Title',
      render: (value: string) => (
        <span className="block truncate max-w-[150px]" title={value}>{value}</span>
      )
    },
    { 
      key: 'description', 
      label: 'Description',
      render: (value: string) => {
        const truncated = value && value.length > 50 ? value.substring(0, 50) + '...' : value || '';
        return <span title={value} className="block truncate max-w-[200px]">{truncated}</span>;
      }
    },
    { key: 'sampleSize', label: 'Samples' },
    { key: 'estimatedTime', label: 'Time' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <div className="flex items-center">
          {value === 'available' ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-green-600 dark:text-green-400 font-medium text-xs whitespace-nowrap">Available</span>
            </>
          ) : (
            <>
              <Clock4 className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-orange-600 dark:text-orange-400 font-medium text-xs whitespace-nowrap">Coming Soon</span>
            </>
          )}
        </div>
      )
    }
  ];

  const handleModuleDoubleClick = (module: any) => {
    setSelectedModule(module);
    setShowModuleModal(true);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    // If no URL provided, use default video
    if (!url) {
      return 'https://www.youtube.com/embed/BJZ17ijM4xw?autoplay=1&mute=1';
    }
    
    // Handle different YouTube URL formats
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    } else {
      // If URL format is not recognized, use default
      return 'https://www.youtube.com/embed/BJZ17ijM4xw?autoplay=1&mute=1';
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Modules</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Modules</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Course ID: {courseId}</p>
        </div>
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-red-500 mb-4">
            <X className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Course</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!courseInfo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Course ID: {courseId}</p>
        </div>
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <X className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Course Not Found</h3>
          <p className="text-gray-500 dark:text-gray-400">The requested course could not be found or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Modules</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Course ID: {courseId}</p>
      </div>

      {/* Course Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {courseInfo.title}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Play className="h-4 w-4 mr-1" />
              {courseInfo.numberOfModules || modules.length} modules
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {courseInfo.targetTime} total
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {courseInfo.description}
        </p>
      </div>

      {/* Modules Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Modules</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Tip:</strong> Double-click on available modules to view detailed information and video content
            </p>
          </div>
          
          {modules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <BookOpen className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Modules Available</h3>
              <p className="text-gray-500 dark:text-gray-400">This course doesn't have any modules yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {modules.map((module, index) => (
                    <tr 
                      key={module.id || index}
                      className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onDoubleClick={() => handleModuleDoubleClick(module)}
                    >
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {column.render ? column.render(module[column.key], module) : module[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Module Details Modal */}
      <Modal
        isOpen={showModuleModal}
        onClose={() => setShowModuleModal(false)}
        title="Module Details"
        size="xl"
      >
        {selectedModule && (
          <div className="space-y-6">
            {/* Video Section */}
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <iframe
                src={getYouTubeEmbedUrl(selectedModule.youtubeUrl)}
                title={selectedModule.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Module Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedModule.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedModule.description}
              </p>
              
              {/* Long Description */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detailed Description</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {selectedModule.longDescription || 'No detailed description available.'}
                </p>
              </div>

              {/* Module Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Play className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sample Size</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedModule.sampleSize || 0} samples</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Clock className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Estimated Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedModule.estimatedTime || 0} minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseModules;