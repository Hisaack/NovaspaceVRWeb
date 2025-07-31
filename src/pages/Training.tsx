import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Download, Clock, User, BookOpen, TrendingUp, Award, Calendar, Search, Filter, ChevronDown } from 'lucide-react';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import { generateCertificate, getCourseNameById } from '../utils/certificateGenerator';

const Training: React.FC = () => {
  const navigate = useNavigate();
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [graduatedUsers, setGraduatedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'active' | 'graduated'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'time' | 'score' | 'course'>('name');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  
  // Pagination states
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [activeItemsPerPage, setActiveItemsPerPage] = useState(9);
  const [graduatedCurrentPage, setGraduatedCurrentPage] = useState(1);
  const [graduatedItemsPerPage, setGraduatedItemsPerPage] = useState(9);

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userId = AuthService.getUserId();
        
        // Load training data for current account
        const trainingResponse = await ApiService.getTrainingData(userId);
        setTrainingData(trainingResponse);
        
        // Load graduated users for current account
        const graduatedResponse = await ApiService.getGraduatedUsers(userId);
        setGraduatedUsers(graduatedResponse);
      } catch (error) {
        console.error('Failed to load training data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get unique courses for filter
  const uniqueCourses = [...new Set(trainingData.map(item => item?.courseCode).filter(Boolean))];

  // Filter and sort training data
  const filteredTrainingData = trainingData
    .filter(item => {
      const matchesSearch = (item?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item?.userCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item?.courseCode || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = filterCourse === 'all' || item?.courseCode === filterCourse;
      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a?.name || '').localeCompare(b?.name || '');
        case 'time':
          return parseFloat(a?.trainedTime || '0') - parseFloat(b?.trainedTime || '0');
        case 'score':
          return (b?.accumulatedSample || 0) - (a?.accumulatedSample || 0);
        case 'course':
          return (a?.courseCode || '').localeCompare(b?.courseCode || '');
        default:
          return 0;
      }
    });

  // Filter and sort graduated users
  const filteredGraduatedUsers = graduatedUsers
    .filter(item => {
      const matchesSearch = (item?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item?.userCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item?.courseId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = filterCourse === 'all' || item?.courseId === filterCourse;
      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a?.name || '').localeCompare(b?.name || '');
        case 'course':
          return (a?.courseId || '').localeCompare(b?.courseId || '');
        default:
          return new Date(b?.dateIssued || 0).getTime() - new Date(a?.dateIssued || 0).getTime();
      }
    });

  // Pagination calculations for active training
  const activeTotalPages = Math.ceil(filteredTrainingData.length / activeItemsPerPage);
  const activeStartIndex = (activeCurrentPage - 1) * activeItemsPerPage;
  const activePaginatedData = filteredTrainingData.slice(activeStartIndex, activeStartIndex + activeItemsPerPage);

  // Pagination calculations for graduated users
  const graduatedTotalPages = Math.ceil(filteredGraduatedUsers.length / graduatedItemsPerPage);
  const graduatedStartIndex = (graduatedCurrentPage - 1) * graduatedItemsPerPage;
  const graduatedPaginatedData = filteredGraduatedUsers.slice(graduatedStartIndex, graduatedStartIndex + graduatedItemsPerPage);

  // Auto-adjust page if current page becomes empty
  React.useEffect(() => {
    if (activeCurrentPage > 1 && activePaginatedData.length === 0 && filteredTrainingData.length > 0) {
      setActiveCurrentPage(Math.max(1, Math.ceil(filteredTrainingData.length / activeItemsPerPage)));
    }
  }, [filteredTrainingData.length, activeCurrentPage, activeItemsPerPage, activePaginatedData.length]);

  React.useEffect(() => {
    if (graduatedCurrentPage > 1 && graduatedPaginatedData.length === 0 && filteredGraduatedUsers.length > 0) {
      setGraduatedCurrentPage(Math.max(1, Math.ceil(filteredGraduatedUsers.length / graduatedItemsPerPage)));
    }
  }, [filteredGraduatedUsers.length, graduatedCurrentPage, graduatedItemsPerPage, graduatedPaginatedData.length]);

  // Reset pagination when switching tabs or changing filters
  React.useEffect(() => {
    setActiveCurrentPage(1);
    setGraduatedCurrentPage(1);
  }, [activeTab, searchTerm, filterCourse, sortBy]);
  const handleTrainingCardClick = (item: any) => {
    navigate(`/training/steps/${item.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Training Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDownloadCertificate = async (user: any) => {
    try {
      const certificateData = {
        name: user.name,
        courseId: user.courseId,
        courseName: getCourseNameById(user.courseId),
        dateIssued: user.dateIssued,
        certificateId: user.certificateId,
        organizationName: 'TechCorp Industries' // This could come from user context
      };
      
      await generateCertificate(certificateData);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      // You could show a toast notification here
      alert('Failed to download certificate. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Training Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor training progress and manage certifications</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Trainees</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{trainingData.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graduated</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{graduatedUsers.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {trainingData.length > 0 ? Math.round(trainingData.reduce((sum, item) => sum + (item?.accumulatedSample || 0), 0) / trainingData.length) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {trainingData.reduce((sum, item) => {
                  const timeStr = item?.trainedTime || '0h';
                  const hours = parseFloat(timeStr.replace('h', '').replace('m', ''));
                  return sum + hours;
                }, 0).toFixed(1)}h
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'active' 
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Active Training ({trainingData.length})
            </button>
            <button
              onClick={() => setActiveTab('graduated')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'graduated' 
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              <Award className="h-4 w-4 mr-2" />
              Graduated ({graduatedUsers.length})
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trainees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full sm:w-64"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="time">Sort by Time</option>
                <option value="score">Sort by Score</option>
                <option value="course">Sort by Course</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="appearance-none pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'active' ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Training Sessions</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Items per page:
                </label>
                <select
                  value={activeItemsPerPage}
                  onChange={(e) => {
                    setActiveItemsPerPage(Number(e.target.value));
                    setActiveCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                </select>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 <strong>Tip:</strong> Click on any card to view detailed training steps
              </p>
            </div>
          </div>
          
          {filteredTrainingData.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <User className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Training Data Found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterCourse !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No active training sessions available.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {activePaginatedData.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleTrainingCardClick(item)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {getInitials(item.name)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Code: {item.userCode}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(item.accumulatedSample)}`}>
                        {item.accumulatedSample}%
                      </span>
                    </div>

                    {/* Course Info */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Course: {item.courseCode}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Trained</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.trainedTime}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Elapsed</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.elapsedTime}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Click to view steps</span>
                      <Eye className="h-4 w-4 text-purple-500 group-hover:text-purple-600 transition-colors duration-200" />
                    </div>
                  </div>
                </div>
                ))}
              </div>

              {/* Pagination for Active Training */}
              {activeTotalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {activeStartIndex + 1} to {Math.min(activeStartIndex + activeItemsPerPage, filteredTrainingData.length)} of {filteredTrainingData.length} training sessions
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveCurrentPage(Math.max(1, activeCurrentPage - 1))}
                      disabled={activeCurrentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {activeCurrentPage} of {activeTotalPages}
                    </span>
                    <button
                      onClick={() => setActiveCurrentPage(Math.min(activeTotalPages, activeCurrentPage + 1))}
                      disabled={activeCurrentPage === activeTotalPages}
                      className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Graduated Users & Certificates</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Items per page:
                </label>
                <select
                  value={graduatedItemsPerPage}
                  onChange={(e) => {
                    setGraduatedItemsPerPage(Number(e.target.value));
                    setGraduatedCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                </select>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                🎓 <strong>Tip:</strong> Click download to get certificates
              </p>
            </div>
          </div>
          
          {filteredGraduatedUsers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <Award className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Graduated Users Found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterCourse !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No graduated users available.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {graduatedPaginatedData.map((user) => (
                <div
                  key={user.certificateId}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white">
                        <Award className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Code: {user.userCode}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Certified
                      </span>
                    </div>

                    {/* Course Info */}
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Course: {user.courseId}</span>
                      </div>
                    </div>

                    {/* Certificate Info */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Issued: {user.dateIssued}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">ID: {user.certificateId}</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button 
                      onClick={() => handleDownloadCertificate(user)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm font-medium">Download Certificate</span>
                    </button>
                  </div>
                </div>
                ))}
              </div>

              {/* Pagination for Graduated Users */}
              {graduatedTotalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {graduatedStartIndex + 1} to {Math.min(graduatedStartIndex + graduatedItemsPerPage, filteredGraduatedUsers.length)} of {filteredGraduatedUsers.length} graduated users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setGraduatedCurrentPage(Math.max(1, graduatedCurrentPage - 1))}
                      disabled={graduatedCurrentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {graduatedCurrentPage} of {graduatedTotalPages}
                    </span>
                    <button
                      onClick={() => setGraduatedCurrentPage(Math.min(graduatedTotalPages, graduatedCurrentPage + 1))}
                      disabled={graduatedCurrentPage === graduatedTotalPages}
                      className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Training;