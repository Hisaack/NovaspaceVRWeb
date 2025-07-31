import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, BookOpen, GraduationCap, Activity, Clock, Award, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generateCertificate, getCourseNameById } from '../utils/certificateGenerator';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

const VirtualDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [virtualUser, setVirtualUser] = useState<any>(null);
  const [userTrainingData, setUserTrainingData] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);

  // Load virtual user data from localStorage and populate dashboard
  React.useEffect(() => {
    // First, check if virtual user is authenticated
    if (!AuthService.isVirtualUserAuthenticated()) {
      console.log('Virtual user not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    const loadUserData = async () => {
      const storedUserData = localStorage.getItem('virtualUserData');
      let userData = null;
      
      // If we have stored data, try to parse it
      if (storedUserData) {
        try {
          userData = JSON.parse(storedUserData);
          console.log('Found stored virtual user data:', userData);
        } catch (error) {
          console.error('Error parsing virtual user data:', error);
          userData = null;
        }
      } else {
        console.log('No stored user data found, showing dashboard with empty data');
      }

      try {
        // If we have user data, try to fetch specific user data from API
        let virtualUserData = null;
        if (userData?.userCode && userData?.organizationName) {
          console.log(`Looking for virtual user: ${userData.userCode} from ${userData.organizationName}`);
          virtualUserData = await ApiService.getVirtualUserByCode(userData.organizationName, userData.userCode);
        }
        
        if (!virtualUserData) {
          console.log('No specific virtual user found in API, using default data');
          console.log('Available organizations: TechCorp Industries, Global Manufacturing Inc, Innovation Labs, Beta Testing Corp, Future Tech Solutions');
          console.log('Example user codes: A123 (TechCorp Industries), TC001 (TechCorp Industries)');
          // Set default virtual user data
          setVirtualUser({
            name: userData?.name || 'Virtual User',
            userCode: userData?.userCode || 'Guest',
            email: userData?.email || 'guest@example.com',
            organization: userData?.organizationName || 'Demo Organization',
            stage: userData?.stage || 'Beginner',
            joinDate: userData?.dateAdded || new Date().toISOString().split('T')[0],
            lastLogin: '2024-01-22 14:30',
            totalTrainingTime: '0h 0m',
            averageScore: 0,
            coursesCompleted: 0,
            coursesInProgress: 0
          });
        } else {
          // Set virtual user data from API
          console.log('Found virtual user data from API:', virtualUserData);
          const apiUser = virtualUserData as any; // Type assertion for API response
          setVirtualUser({
            name: apiUser.name || 'Virtual User',
            userCode: apiUser.userCode,
            email: apiUser.email,
            organization: apiUser.account?.organizationName || userData?.organizationName || 'Demo Organization',
            stage: apiUser.stage || 'Beginner',
            joinDate: apiUser.dateAdded ? new Date(apiUser.dateAdded).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            lastLogin: apiUser.lastLogin || '2024-01-22 14:30',
            totalTrainingTime: '0h 0m', // Will be calculated from training data
            averageScore: 0, // Will be calculated from training data
            coursesCompleted: 0, // Will be calculated from completed courses
            coursesInProgress: 0 // Will be calculated from enrollments
          });
        }

        // Initialize data arrays
        let userSpecificTraining: any[] = [];
        let userEnrollments: any[] = [];
        let userCompletedCourses: any[] = [];

        // Fetch training data for this specific user (or all if no specific user)
        try {
          const trainingData = await ApiService.getTrainingData();
          userSpecificTraining = Array.isArray(trainingData) ? trainingData : [];
          setUserTrainingData(userSpecificTraining);
        } catch (error) {
          console.log('Could not fetch training data for virtual user, using empty data:', error);
          setUserTrainingData([]);
        }

        // Fetch enrollments - for virtual users, use my-enrollments endpoint
        try {
          const enrollmentResponse = await ApiService.getMyEnrollments();
          userEnrollments = Array.isArray(enrollmentResponse) ? enrollmentResponse : [];
          setEnrollments(userEnrollments);
        } catch (error) {
          console.log('Could not fetch enrollments for virtual user, using empty data:', error);
          setEnrollments([]);
        }

        // Fetch graduated users (completed courses) for this user or empty array
        try {
          const graduatedUsers = await ApiService.getGraduatedUsers();
          userCompletedCourses = Array.isArray(graduatedUsers) ? graduatedUsers : [];
          setCompletedCourses(userCompletedCourses);
        } catch (error) {
          console.log('Could not fetch completed courses for virtual user, using empty data:', error);
          setCompletedCourses([]);
        }

        // Calculate metrics from actual data
        const totalTrainingHours = userSpecificTraining.reduce((total: number, training: any) => {
          // Parse training time (assuming format like "2h 45m" or just numbers)
          const timeStr = training.trainedTime || "0h 0m";
          const hours = parseFloat(timeStr.split('h')[0] || '0');
          const minutes = parseFloat((timeStr.split('h')[1] || '0m').replace('m', '') || '0');
          return total + hours + (minutes / 60);
        }, 0);

        const averageScore = userSpecificTraining.length > 0 ? 
          userSpecificTraining.reduce((total: number, training: any) => total + (training.accumulatedSample || 0), 0) / userSpecificTraining.length : 0;

        // Update virtual user with calculated metrics
        if (virtualUserData) {
          setVirtualUser((prev: any) => ({
            ...prev,
            totalTrainingTime: `${Math.floor(totalTrainingHours)}h ${Math.floor((totalTrainingHours % 1) * 60)}m`,
            averageScore: Math.round(averageScore),
            coursesCompleted: userCompletedCourses.length,
            coursesInProgress: userEnrollments.filter((e: any) => e.status !== 'Completed').length
          }));
        }

      } catch (error) {
        console.error('Error fetching user data from API:', error);
        // Use fallback data - work even without userData
        setVirtualUser({
          name: userData?.name || 'Virtual User',
          userCode: userData?.userCode || 'Guest',
          email: userData?.email || 'guest@example.com',
          organization: userData?.organizationName || 'Demo Organization',
          stage: userData?.stage || 'Beginner',
          joinDate: userData?.dateAdded || new Date().toISOString().split('T')[0],
          lastLogin: '2024-01-22 14:30',
          totalTrainingTime: '0h 0m',
          averageScore: 0,
          coursesCompleted: 0,
          coursesInProgress: 0
        });
        setUserTrainingData([]);
        setEnrollments([]);
        setCompletedCourses([]);
      }
    };

    loadUserData();
  }, []);

  // Return loading state if virtual user data is not loaded yet
  if (!virtualUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock training steps data for selected training
  const getTrainingStepsData = (trainingId: string) => {
    const stepsData = {
      'T001': {
        stepsData: [
          { step: 1, errorRate: 25, successRate: 75 },
          { step: 2, errorRate: 20, successRate: 80 },
          { step: 3, errorRate: 15, successRate: 85 },
          { step: 4, errorRate: 10, successRate: 90 },
          { step: 5, errorRate: 8, successRate: 92 },
        ],
        timeData: [
          { step: 1, elapsedTime: 15, expectedTime: 12 },
          { step: 2, elapsedTime: 18, expectedTime: 15 },
          { step: 3, elapsedTime: 22, expectedTime: 20 },
          { step: 4, elapsedTime: 25, expectedTime: 22 },
          { step: 5, elapsedTime: 28, expectedTime: 25 },
        ],
        summaryData: [
          {
            stepNumber: 1,
            elapsedTime: '15 min',
            expectedTime: '12 min',
            errorSum: 5,
            errorRate: '25%',
            errorSummary: 'Navigation errors',
            successRate: '75%'
          },
          {
            stepNumber: 2,
            elapsedTime: '18 min',
            expectedTime: '15 min',
            errorSum: 3,
            errorRate: '20%',
            errorSummary: 'Interaction delays',
            successRate: '80%'
          },
          {
            stepNumber: 3,
            elapsedTime: '22 min',
            expectedTime: '20 min',
            errorSum: 2,
            errorRate: '15%',
            errorSummary: 'Minor hesitations',
            successRate: '85%'
          },
          {
            stepNumber: 4,
            elapsedTime: '25 min',
            expectedTime: '22 min',
            errorSum: 1,
            errorRate: '10%',
            errorSummary: 'Timing adjustment',
            successRate: '90%'
          },
          {
            stepNumber: 5,
            elapsedTime: '28 min',
            expectedTime: '25 min',
            errorSum: 1,
            errorRate: '8%',
            errorSummary: 'Final optimization',
            successRate: '92%'
          }
        ]
      },
      'T002': {
        stepsData: [
          { step: 1, errorRate: 30, successRate: 70 },
          { step: 2, errorRate: 22, successRate: 78 },
          { step: 3, errorRate: 18, successRate: 82 },
          { step: 4, errorRate: 12, successRate: 88 },
        ],
        timeData: [
          { step: 1, elapsedTime: 20, expectedTime: 15 },
          { step: 2, elapsedTime: 25, expectedTime: 20 },
          { step: 3, elapsedTime: 30, expectedTime: 25 },
          { step: 4, elapsedTime: 35, expectedTime: 30 },
        ],
        summaryData: [
          {
            stepNumber: 1,
            elapsedTime: '20 min',
            expectedTime: '15 min',
            errorSum: 6,
            errorRate: '30%',
            errorSummary: 'Initial learning curve',
            successRate: '70%'
          },
          {
            stepNumber: 2,
            elapsedTime: '25 min',
            expectedTime: '20 min',
            errorSum: 4,
            errorRate: '22%',
            errorSummary: 'Procedure familiarization',
            successRate: '78%'
          },
          {
            stepNumber: 3,
            elapsedTime: '30 min',
            expectedTime: '25 min',
            errorSum: 3,
            errorRate: '18%',
            errorSummary: 'Skill development',
            successRate: '82%'
          },
          {
            stepNumber: 4,
            elapsedTime: '35 min',
            expectedTime: '30 min',
            errorSum: 2,
            errorRate: '12%',
            errorSummary: 'Competency achieved',
            successRate: '88%'
          }
        ]
      }
    };
    return stepsData[trainingId as keyof typeof stepsData] || null;
  };

  // Mock training data
  const trainingProgress = [
    { month: 'Jan', hours: 2.5, score: 78 },
    { month: 'Feb', hours: 4.2, score: 82 },
    { month: 'Mar', hours: 3.8, score: 85 },
    { month: 'Apr', hours: 2.0, score: 88 }
  ];

  const courseData = [
    { name: 'Completed', value: 3, color: '#10b981' },
    { name: 'In Progress', value: 2, color: '#f59e0b' },
    { name: 'Not Started', value: 1, color: '#6b7280' }
  ];

  const handleSignOut = () => {
    // Use the secure virtual user logout method
    AuthService.logoutVirtualUser();
    navigate('/login');
  };

  const handleViewSteps = (training: any) => {
    setSelectedTraining(training);
    setShowStepsModal(true);
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'VU';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleDownloadCertificate = async (course: any) => {
    try {
      const certificateData = {
        name: virtualUser.name,
        courseId: course.courseId,
        courseName: getCourseNameById(course.courseId),
        dateIssued: course.completionDate,
        certificateId: course.certificateId,
        organizationName: virtualUser.organization
      };
      
      await generateCertificate(certificateData);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/FullLogo_Transparent_NoBuffer.png" 
                alt="Nova Space" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Virtual User Portal</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{virtualUser.organization}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(virtualUser?.name || '')}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{virtualUser?.name || 'Virtual User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{virtualUser?.userCode || ''}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {virtualUser?.name?.split(' ')[0] || 'User'}!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your training progress and achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Training Hours</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{virtualUser.totalTrainingTime}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses Completed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{virtualUser.coursesCompleted}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{virtualUser.averageScore}%</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Stage</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{virtualUser.stage}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'enrollments', label: 'My Enrollments', icon: BookOpen },
                { id: 'completed', label: 'Completed Courses', icon: GraduationCap },
                { id: 'training', label: 'My Training Data', icon: User }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Training Progress</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trainingProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} name="Hours" />
                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} name="Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={courseData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {courseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Completed Safety Training course</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">2 days ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Started Electrical Engineering module 3</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">5 days ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Achieved 85% average score milestone</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'enrollments' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Course Enrollments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Enrolled</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {enrollments.map((enrollment, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{enrollment.courseName}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{enrollment.enrollmentDate}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              enrollment.status === 'Completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}>
                              {enrollment.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                  style={{ width: `${enrollment.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{enrollment.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'completed' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Completed Courses & Certificates</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Completed</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Certificate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {completedCourses.map((course, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{course.courseName}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{course.completionDate}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              {course.grade}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button 
                              onClick={() => handleDownloadCertificate(course)}
                              className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                            >
                              Download {course.certificateId}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'training' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Training Data</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trained Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Elapsed Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sample</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {userTrainingData.map((training, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{training.courseName}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{training.trainedTime}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{training.elapsedTime}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{training.accumulatedSample}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              training.status === 'Completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}>
                              {training.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleViewSteps(training)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
                            >
                              <Activity className="h-3 w-3 mr-1" />
                              View Steps
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Training Steps Modal */}
      {showStepsModal && selectedTraining && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Training Steps Analysis</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Course: {selectedTraining.courseName} | Training ID: {selectedTraining.id}
                  </p>
                </div>
                <button
                  onClick={() => setShowStepsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {(() => {
                const stepsData = getTrainingStepsData(selectedTraining.id);
                if (!stepsData) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No training steps data available for this training.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-8">
                    {/* Performance Chart */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Analysis</h3>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={stepsData.stepsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="step" label={{ value: 'Step Number', position: 'insideBottom', offset: -10 }} />
                            <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} name="Error Rate" />
                            <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} name="Success Rate" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Time Analysis Chart */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Analysis</h3>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={stepsData.timeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="step" label={{ value: 'Step Number', position: 'insideBottom', offset: -10 }} />
                            <YAxis label={{ value: 'Time (minutes)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="elapsedTime" stroke="#8b5cf6" strokeWidth={2} name="Elapsed Time" />
                            <Line type="monotone" dataKey="expectedTime" stroke="#06b6d4" strokeWidth={2} name="Expected Time" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Summary Table */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Step-by-Step Summary</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Step</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Elapsed</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expected</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Errors</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Error %</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Summary</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Success %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {stepsData.summaryData.map((step, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{step.stepNumber}</td>
                                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{step.elapsedTime}</td>
                                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{step.expectedTime}</td>
                                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{step.errorSum}</td>
                                <td className="px-4 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    parseInt(step.errorRate) > 20 
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                      : parseInt(step.errorRate) > 10
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  }`}>
                                    {step.errorRate}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="block truncate max-w-[120px]" title={step.errorSummary}>
                                    {step.errorSummary}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                    {step.successRate}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualDashboard;