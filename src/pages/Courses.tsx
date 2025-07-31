import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, Play, Search } from 'lucide-react';
import Modal from '../components/Modal';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import { getImageUrl } from '../utils/imageUpload';

const Courses: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'public' | 'organization' | 'enrollment'>('public');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [enrollmentPage, setEnrollmentPage] = useState(1);
  const [enrollmentPageSize, setEnrollmentPageSize] = useState(10);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [publicCourses, setPublicCourses] = useState<any[]>([]);
  const [organizationCourses, setOrganizationCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  // Load courses from API
  React.useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        const userId = AuthService.getUserId();
        
        // Load public courses
        const fetchedPublicCourses = await ApiService.getPublicCourses();
        setPublicCourses(fetchedPublicCourses);
        
        // Load organization-specific courses
        const fetchedOrgCourses = await ApiService.getOrganizationCourses(userId);
        setOrganizationCourses(fetchedOrgCourses);
      } catch (error) {
        console.error('Failed to load courses:', error);
        setPublicCourses([]);
        setOrganizationCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  // Load enrollments from API
  React.useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoadingEnrollments(true);
        const userId = AuthService.getUserId();
        const fetchedEnrollments = await ApiService.getEnrollmentsByAccount(userId);
        setEnrollments(fetchedEnrollments);
      } catch (error) {
        console.error('Failed to load enrollments:', error);
        setEnrollments([]);
      } finally {
        setLoadingEnrollments(false);
      }
    };
    loadEnrollments();
  }, []);

  const filteredPublicCourses = publicCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrganizationCourses = organizationCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(enrollment =>
    (enrollment.courseTitle || enrollment.CourseTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (enrollment.virtualUserName || enrollment.VirtualUserName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (enrollment.enrollmentDate || enrollment.EnrollmentDate || '').includes(searchTerm)
  );

  // Pagination for enrollments
  const totalEnrollmentPages = Math.ceil(filteredEnrollments.length / enrollmentPageSize);
  const startEnrollmentIndex = (enrollmentPage - 1) * enrollmentPageSize;
  const paginatedEnrollments = filteredEnrollments.slice(startEnrollmentIndex, startEnrollmentIndex + enrollmentPageSize);

  // Auto-adjust page if current page becomes empty
  React.useEffect(() => {
    if (enrollmentPage > 1 && paginatedEnrollments.length === 0 && filteredEnrollments.length > 0) {
      setEnrollmentPage(Math.max(1, Math.ceil(filteredEnrollments.length / enrollmentPageSize)));
    }
  }, [filteredEnrollments.length, enrollmentPage, enrollmentPageSize, paginatedEnrollments.length]);

  const getEnrollmentCount = (courseId: string) => {
    return enrollments.filter(enrollment => enrollment.CourseId === courseId).length;
  };

  const CourseCard = ({ course }: { course: any }) => (
    <Link
      to={`/courses/${course.id}/modules`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 group"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={getImageUrl(course.image)}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
          {course.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <BookOpen className="h-4 w-4 mr-1" />
            {course.numberOfModules || 0} modules
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            {course.targetTime || 'TBD'}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Play className="h-4 w-4 mr-1" />
            {course.targetSample || 0} samples
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            {course.enrolled || 0} enrolled
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
            {course.code}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
            View Modules →
          </span>
        </div>
      </div>
    </Link>
  );

  const enrollmentColumns = [
    { key: 'courseTitle', label: 'Course' },
    { key: 'enrollmentDate', label: 'Enrollment Date' },
    { 
      key: 'virtualUserName', 
      label: 'User',
      render: (value: string) => (
        <span className="block truncate max-w-[120px]" title={value}>{value}</span>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value: number) => (
        <span className="text-sm font-medium">{value}%</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => {
            setSelectedEnrollment(row);
            setShowEnrollmentModal(true);
          }}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 whitespace-nowrap"
        >
          View
        </button>
      )
    }
  ];

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <div className="text-gray-400 dark:text-gray-500 mb-4">
        <BookOpen className="mx-auto h-16 w-16" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{message}</h3>
      <p className="text-gray-500 dark:text-gray-400">
        {searchTerm ? `No results found for "${searchTerm}"` : 'Check back later for updates.'}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Explore available VR training courses</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('public')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'public'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              General Public ({publicCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('organization')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'organization'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Organization Specific ({organizationCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('enrollment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'enrollment'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Enrollment ({enrollments.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loadingCourses && activeTab !== 'enrollment' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading courses...</p>
            </div>
          )}

          {/* Search Box */}
          {!loadingCourses && (
            <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
            </div>
          </div>
          )}

          {!loadingCourses && activeTab === 'public' && (
            filteredPublicCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublicCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No courses found matching "{searchTerm}"</p>
              </div>
            ) : (
              <EmptyState message="No Public Courses Available" />
            )
          )}
          
          {!loadingCourses && activeTab === 'organization' && (
            filteredOrganizationCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizationCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <EmptyState message="No Organization Courses Available" />
            )
          )}
          
          {activeTab === 'enrollment' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Enrollments</h3>
              {loadingEnrollments ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading enrollments...</p>
                </div>
              ) : filteredEnrollments.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Enrollment Records</h4>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rows per page:
                    </label>
                    <select
                      value={enrollmentPageSize}
                      onChange={(e) => {
                        setEnrollmentPageSize(Number(e.target.value));
                        setEnrollmentPage(1); // Reset to first page
                      }}
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {enrollmentColumns.map((column) => (
                          <th
                            key={column.key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedEnrollments.map((row, index) => (
                        <tr 
                          key={index} 
                          className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {enrollmentColumns.map((column) => (
                            <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Custom Pagination for Enrollments */}
                {totalEnrollmentPages > 1 && (
                  <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {startEnrollmentIndex + 1} to {Math.min(startEnrollmentIndex + enrollmentPageSize, filteredEnrollments.length)} of {filteredEnrollments.length} enrollments
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEnrollmentPage(Math.max(1, enrollmentPage - 1))}
                        disabled={enrollmentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {enrollmentPage} of {totalEnrollmentPages}
                      </span>
                      <button
                        onClick={() => setEnrollmentPage(Math.min(totalEnrollmentPages, enrollmentPage + 1))}
                        disabled={enrollmentPage === totalEnrollmentPages}
                        className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <BookOpen className="mx-auto h-16 w-16" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Enrollments Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">{searchTerm ? `No enrollments found matching "${searchTerm}"` : 'No enrollments available for your account.'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Details Modal */}
      <Modal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        title="Enrollment Details"
        size="md"
      >
        {selectedEnrollment && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Course ID</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEnrollment.courseId || selectedEnrollment.CourseId}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">User Name</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEnrollment.virtualUserName || selectedEnrollment.VirtualUserName}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Enrollment Date</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEnrollment.enrollmentDate || selectedEnrollment.EnrollmentDate}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Virtual User ID</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{selectedEnrollment.virtualUserId || selectedEnrollment.VirtualUserId}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Progress</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedEnrollment.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedEnrollment.progress || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Courses;