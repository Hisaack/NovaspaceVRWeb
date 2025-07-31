import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, BookOpen, Search, Upload, BarChart3, GraduationCap, Activity, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import { uploadImage, deleteImage, getImageUrl } from '../utils/imageUpload';

interface Course {
  id: string;
  guid: string;
  code: string;
  title: string;
  description: string;
  image: string;
  targetSample: number;
  targetTime: string;
  numberOfModules: number;
  isPublic: boolean;
  organizationId?: string;
}

interface Account {
  id: string;
  guid: string;
  accountStatus: boolean; // true = Active, false = Disabled
  twoFactorEnabled: boolean;
  organizationName: string;
  email: string;
  createdDate: string;
  userName: string;
  isEmailConfirmed: boolean; // true = Yes, false = No
  deviceId: string;
  isAccountGeneralPublic: boolean; // true = Yes, false = No
  capacityPool: number;
}

interface FormErrors {
  title?: string;
  description?: string;
  image?: string;
  courseType?: string;
  organization?: string;
  moduleTitle?: string;
  moduleDescription?: string;
  sampleSize?: string;
}

// Helper function to generate GUID
const generateGUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'accounts' | 'training' | 'graduated' | 'virtual-users' | 'dashboard'>('dashboard');
  const [dashboardYear, setDashboardYear] = useState<string>('2024');
  const [dashboardMonth, setDashboardMonth] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  // State for all data
  const [courses, setCourses] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [graduatedUsers, setGraduatedUsers] = useState<any[]>([]);
  const [virtualUsers, setVirtualUsers] = useState<any[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [
          coursesData,
          accountsData,
          trainingResponse,
          graduatedResponse,
          metricsData
        ] = await Promise.all([
          ApiService.getCourses(), // Admin can see all courses
          ApiService.getAccounts(), // Admin can see all accounts
          ApiService.getTrainingData(), // Admin can see all training data
          ApiService.getGraduatedUsers(), // Admin can see all graduated users
          ApiService.getDashboardMetrics() // Admin can see all metrics
        ]);
        
        setCourses(coursesData);
        setAccounts(accountsData);
        setTrainingData(trainingResponse);
        setGraduatedUsers(graduatedResponse);
        setDashboardMetrics(metricsData);
        
        // Select first specific organization
        const firstAccount = accountsData.find((account: any) => account.id);
        if (firstAccount) {
          setSelectedOrganization(firstAccount.id);
        }
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const getAccountById = (id: string) => {
    return accounts?.find((account: any) => account.id === id);
  };

  // Load filtered data when organization changes
  useEffect(() => {
    const loadFilteredData = async () => {
      if (selectedOrganization === 'all') return;
      
      try {
        const [
          trainingResponse,
          graduatedResponse,
          virtualUsersResponse,
          metricsData
        ] = await Promise.all([
          ApiService.getTrainingData(selectedOrganization),
          ApiService.getGraduatedUsers(selectedOrganization),
          ApiService.getVirtualUsers(selectedOrganization),
          ApiService.getDashboardMetrics(selectedOrganization)
        ]);
        
        setTrainingData(trainingResponse);
        setGraduatedUsers(graduatedResponse);
        setVirtualUsers(virtualUsersResponse);
        setDashboardMetrics(metricsData);
      } catch (error) {
        console.error('Failed to load filtered data:', error);
      }
    };

    if (selectedOrganization !== 'all') {
      loadFilteredData();
    }
  }, [selectedOrganization]);

  const getFilteredData = () => {
    return {
      trainingData,
      graduatedUsers,
      virtualUsers
    };
  };

  const filteredData = getFilteredData();

  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState(false);
  const [selectedAccountForDetails, setSelectedAccountForDetails] = useState<Account | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: 'course' | 'account'; id: string } | null>(null);
  const [accountChanges, setAccountChanges] = useState<{ [accountId: string]: any }>({});
  const [coursesPageSize, setCoursesPageSize] = useState(5);
  const [accountsPageSize, setAccountsPageSize] = useState(5);
  const [trainingPageSize, setTrainingPageSize] = useState(10);
  const [graduatedPageSize, setGraduatedPageSize] = useState(10);
  const [virtualUsersPageSize, setVirtualUsersPageSize] = useState(10);

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    image: null as File | null,
    youtubeUrl: '',
    targetSample: 0,
    targetTime: 0,
    numberOfModules: 0, // Will be calculated automatically
    isPublic: true,
    organizationId: ''
  });

  const [accountForm, setAccountForm] = useState({
    accountStatus: true, // true = Active, false = Disabled
    twoFactorEnabled: false,
    isAccountGeneralPublic: false, // true = Yes, false = No
    capacityPool: 0
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard metrics
  const getDashboardMetrics = () => {
    if (!dashboardMetrics) {
      return {
        totalTrainings: 0,
        totalTrainingHours: 0,
        totalGraduated: 0,
        totalVirtualUsers: 0
      };
    }
    
    return {
      totalTrainings: dashboardMetrics.trainedStudents,
      totalTrainingHours: Math.round(trainingData.length * 2.5), // Mock calculation
      totalGraduated: dashboardMetrics.graduatedStudents,
      totalVirtualUsers: dashboardMetrics.virtualUsersTelemetry
    };
  };

  // Mock growth data for charts
  const getGrowthData = () => {
    // This would come from ApiService.getGrowthData() in a real implementation
    return [
      { month: 'Jan', virtualUsers: 10, accounts: 2 },
      { month: 'Feb', virtualUsers: 15, accounts: 3 },
      { month: 'Mar', virtualUsers: 25, accounts: 4 },
      { month: 'Apr', virtualUsers: 35, accounts: 5 },
      { month: 'May', virtualUsers: 45, accounts: 5 },
      { month: 'Jun', virtualUsers: 55, accounts: 5 }
    ];
  };

  const generateCourseCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists
    const existingCodes = courses.map(course => course.code);
    if (existingCodes.includes(result)) {
      return generateCourseCode(); // Regenerate if duplicate
    }
    
    return result;
  };

  const handleViewAccountDetails = (account: Account) => {
    setSelectedAccountForDetails(account);
    setShowAccountDetailsModal(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear previous errors
      setUploadError(null);
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setUploadError('File size too large. Please upload an image smaller than 5MB.');
        return;
      }
      
      setCourseForm({ ...courseForm, image: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      image: null,
      youtubeUrl: '',
      targetSample: 0, // Will be calculated automatically
      targetTime: 0, // Will be calculated automatically
      numberOfModules: 0, // Will be calculated automatically
      isPublic: true,
      organizationId: ''
    });
    setImagePreview(null);
    setUploadError(null);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    resetCourseForm();
    setShowCourseModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      image: null,
      youtubeUrl: course.youtubeUrl || '',
      targetSample: course.targetSample, // Display current calculated value
      targetTime: course.targetTime,
      numberOfModules: course.numberOfModules,
      isPublic: course.isPublic,
      organizationId: course.organizationId || ''
    });
    setImagePreview(getImageUrl(course.image));
    setUploadError(null);
    setShowCourseModal(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setDeletingItem({ type: 'course', id: course.id });
    setShowDeleteModal(true);
  };

  const handleSaveCourse = async () => {
    // Validate form before proceeding
    if (!courseForm.title.trim()) {
      setUploadError('Course title is required.');
      return;
    }
    
    if (!courseForm.description.trim()) {
      setUploadError('Course description is required.');
      return;
    }
    
    if (!courseForm.isPublic && !courseForm.organizationId) {
      setUploadError('Organization is required for private courses.');
      return;
    }
    
    // Check if there's an upload error
    if (uploadError) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = imagePreview || '/MobiusBackGround.jpg';
      
      // Upload new image if file is selected
      if (courseForm.image) {
        const uploadResult = await uploadImage(courseForm.image, 'courses');
        if (uploadResult.success && uploadResult.url) {
          // Delete old image if updating and had previous image
          if (editingCourse?.image && editingCourse.image !== imageUrl) {
            await deleteImage(editingCourse.image);
          }
          imageUrl = uploadResult.url;
        } else {
          setUploadError(uploadResult.error || 'Failed to upload image');
          setIsSubmitting(false);
          return;
        }
      }
      
      if (editingCourse) {
        const updateDto = {
          title: courseForm.title,
          description: courseForm.description,
          image: imageUrl,
          youtubeUrl: courseForm.youtubeUrl || null,
          isPublic: courseForm.isPublic,
          organizationId: courseForm.isPublic ? null : courseForm.organizationId
        };
        
        await ApiService.updateCourse(editingCourse.id, updateDto);
      } else {
        const createDto = {
          title: courseForm.title,
          description: courseForm.description,
          image: imageUrl,
          youtubeUrl: courseForm.youtubeUrl || null,
          isPublic: courseForm.isPublic,
          organizationId: courseForm.isPublic ? null : courseForm.organizationId
        };
        
        await ApiService.createCourse(createDto);
      }
      
      // Reload courses
      const coursesData = await ApiService.getCourses();
      setCourses(coursesData);
      setShowCourseModal(false);
      resetCourseForm();
    } catch (error) {
      console.error('Failed to save course:', error);
      setUploadError('Failed to save course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourseConfirm = async () => {
    if (deletingItem && deletingItem.type === 'course') {
      try {
        // Delete course image if it exists
        const courseToDelete = courses.find(c => c.id === deletingItem.id);
        if (courseToDelete?.image) {
          await deleteImage(courseToDelete.image);
        }
        
        await ApiService.deleteCourse(deletingItem.id);
        const coursesData = await ApiService.getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
    setShowDeleteModal(false);
    setDeletingItem(null);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setAccountForm({
      accountStatus: account.accountStatus,
      twoFactorEnabled: account.twoFactorEnabled || false,
      isAccountGeneralPublic: account.isAccountGeneralPublic,
      capacityPool: account.capacityPool
    });
    setShowAccountModal(true);
  };

  const handleSaveAccount = () => {
    const saveAccount = async () => {
      if (editingAccount) {
        setUploadError(null); // Clear any previous errors
        let imageUrl = imagePreview;
        
        // Upload new image if file is selected
        if (courseForm.image) {
          const uploadResult = await uploadImage(courseForm.image, 'courses');
          if (uploadResult.success && uploadResult.url) {
            // Delete old image if updating and had previous image
            if (editingCourse?.image && editingCourse.image !== imageUrl) {
              await deleteImage(editingCourse.image);
            }
            imageUrl = uploadResult.url;
          } else {
            setUploadError(uploadResult.error || 'Failed to upload image');
            return; // Stop execution if upload fails
          }
        }
        
        try {
          const updateDto = {
            isActive: accountForm.accountStatus,
            image: imageUrl || '/MobiusBackGround.jpg',
            isAccountGeneralPublic: accountForm.isAccountGeneralPublic,
            capacityPool: accountForm.capacityPool
          };
          
          await ApiService.updateAccount(editingAccount.id, updateDto);
          
          // Reload accounts
          const accountsData = await ApiService.getAccounts();
          setAccounts(accountsData);
          setShowAccountModal(false);
        } catch (error) {
          console.error('Failed to save account:', error);
        }
        setUploadError('Failed to save course. Please try again.');
      }
    };

    saveAccount();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading admin data...</p>
        </div>
      </div>
    );
  }

  const trainingColumns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (value: string) => (
        <span className="block truncate max-w-[120px]" title={value}>{value}</span>
      )
    },
    { key: 'userCode', label: 'Code' },
    { key: 'trainedTime', label: 'Trained' },
    { key: 'elapsedTime', label: 'Elapsed' },
    { key: 'accumulatedSample', label: 'Sample' },
    { key: 'courseCode', label: 'Course' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link
          to={`/training/steps/${row.id}`}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 whitespace-nowrap"
        >
          <Eye className="h-4 w-4 mr-1" />
          Steps
        </Link>
      )
    }
  ];

  const graduatedColumns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (value: string) => (
        <span className="block truncate max-w-[120px]" title={value}>{value}</span>
      )
    },
    { key: 'userCode', label: 'Code' },
    { key: 'courseId', label: 'Course' },
    { key: 'dateIssued', label: 'Date Issued' },
    { key: 'certificateId', label: 'Certificate ID' }
  ];

  const virtualUsersColumns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (value: string) => (
        <span className="block truncate max-w-[120px]" title={value}>{value}</span>
      )
    },
    { key: 'userCode', label: 'Code' },
    { key: 'dateAdded', label: 'Date Added' },
    { key: 'stage', label: 'Stage' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
          value === 'Active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const courseColumns = [
    { key: 'title', label: 'Title' },
    { key: 'code', label: 'Course Code' },
    { key: 'targetSample', label: 'Target Sample' },
    { key: 'targetTime', label: 'Target Time (Min)' },
    { key: 'numberOfModules', label: 'Modules' },
   {
     key: 'isPublic',
     label: 'Visibility',
     render: (value: boolean) => (
       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
         value 
           ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
           : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
       }`}>
         {value ? 'Public' : 'Private'}
       </span>
     )
   },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditCourse(row)}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            title="Edit Course"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteCourse(row)}
            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Delete Course"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    },
    {
      key: 'viewModule',
      label: 'View Module',
      render: (_, row) => (
        <Link
          to={`/admin/modules/${row.id}`}
          className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 whitespace-nowrap"
        >
          Modules
        </Link>
      )
    }
  ];

  const accountColumns = [
    { 
      key: 'accountStatus', 
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
          value === true 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          {value ? 'Active' : 'Disabled'}
        </span>
      )
    },
    { 
      key: 'organizationName', 
      label: 'Organization',
      render: (value: string) => (
        <span className="block max-w-[150px] truncate" title={value}>{value}</span>
      )
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (value: string) => (
        <span className="block max-w-[120px] truncate" title={value}>{value}</span>
      )
    },
    { 
      key: 'userName', 
      label: 'Username',
      render: (value: string) => (
        <span className="block max-w-[100px] truncate" title={value}>{value}</span>
      )
    },
    { 
      key: 'twoFactorEnabled', 
      label: '2FA',
      render: (value: boolean) => (
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }`}>
          {value ? 'Enabled' : 'Disabled'}
        </span>
      )
    },
    { key: 'capacityPool', label: 'Capacity' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditAccount(row)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => handleViewAccountDetails(row)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Organization:
            </label>
            <select
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[200px]"
            >
              <option value="all">All Organizations</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.organizationName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BookOpen className="inline-block w-4 h-4 mr-2" />
            Course Management
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accounts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Users className="inline-block w-4 h-4 mr-2" />
            Account Management
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'training'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Activity className="inline-block w-4 h-4 mr-2" />
            Training Data ({filteredData.trainingData.length})
          </button>
          <button
            onClick={() => setActiveTab('graduated')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'graduated'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <GraduationCap className="inline-block w-4 h-4 mr-2" />
            Graduated Users ({filteredData.graduatedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('virtual-users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'virtual-users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Users className="inline-block w-4 h-4 mr-2" />
            Virtual Users ({filteredData.virtualUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BarChart3 className="inline-block w-4 h-4 mr-2" />
            Dashboard
          </button>
        </nav>
      </div>

      {/* Course Management Tab */}
      {activeTab === 'courses' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Management</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rows per page:
                  </label>
                  <select
                    value={coursesPageSize}
                    onChange={(e) => setCoursesPageSize(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
                <button
                  onClick={handleAddCourse}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Course</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <DataTable columns={courseColumns} data={courses} pageSize={coursesPageSize} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Management Tab */}
      {activeTab === 'accounts' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Management</h3>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rows per page:
                </label>
                <select
                  value={accountsPageSize}
                  onChange={(e) => setAccountsPageSize(Number(e.target.value))}
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
              <div className="min-w-[700px]">
                <DataTable columns={accountColumns} data={accounts} pageSize={accountsPageSize} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Data Tab */}
      {activeTab === 'training' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Training Data</h3>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rows per page:
                </label>
                <select
                  value={trainingPageSize}
                  onChange={(e) => setTrainingPageSize(Number(e.target.value))}
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
              <div className="min-w-[700px]">
                <DataTable columns={trainingColumns} data={filteredData.trainingData} pageSize={trainingPageSize} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graduated Users Tab */}
      {activeTab === 'graduated' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Graduated Users</h3>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rows per page:
                </label>
                <select
                  value={graduatedPageSize}
                  onChange={(e) => setGraduatedPageSize(Number(e.target.value))}
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
              <div className="min-w-[600px]">
                <DataTable columns={graduatedColumns} data={filteredData.graduatedUsers} pageSize={graduatedPageSize} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Users Tab */}
      {activeTab === 'virtual-users' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Virtual Users</h3>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rows per page:
                </label>
                <select
                  value={virtualUsersPageSize}
                  onChange={(e) => setVirtualUsersPageSize(Number(e.target.value))}
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
              <div className="min-w-[700px]">
                <DataTable columns={virtualUsersColumns} data={filteredData.virtualUsers} pageSize={virtualUsersPageSize} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Dashboard Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard Filters</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</label>
                  <select
                    value={dashboardYear}
                    onChange={(e) => setDashboardYear(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Month:</label>
                  <select
                    value={dashboardMonth}
                    onChange={(e) => setDashboardMonth(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Months</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(() => {
              const metrics = getDashboardMetrics();
              return (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trainings</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.totalTrainings}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Training Hours</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.totalTrainingHours}h</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graduated Users</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.totalGraduated}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Virtual Users</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.totalVirtualUsers}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Virtual Users Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={getGrowthData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="virtualUsers" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accounts Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getGrowthData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="accounts" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
        preventClose={true}
        footer={
          <>
            <button
              onClick={() => setShowCourseModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCourse}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                `${editingCourse ? 'Update' : 'Add'} Course`
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Upload Error Alert */}
          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-400">{uploadError}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setUploadError(null)}
                  className="inline-flex text-red-400 hover:text-red-600 dark:hover:text-red-300"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={courseForm.title}
              onChange={(e) => {
                setCourseForm({ ...courseForm, title: e.target.value });
                if (uploadError && uploadError.includes('title')) setUploadError(null);
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={courseForm.description}
              onChange={(e) => {
                setCourseForm({ ...courseForm, description: e.target.value });
                if (uploadError && uploadError.includes('description')) setUploadError(null);
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter course description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Visibility <span className="text-red-500">*</span>
            </label>
            <select
              value={courseForm.isPublic ? 'public' : 'private'}
              onChange={(e) => {
                setCourseForm({ ...courseForm, isPublic: e.target.value === 'public' });
                if (uploadError && uploadError.includes('Organization')) setUploadError(null);
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {!courseForm.isPublic && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization ID <span className="text-red-500">*</span>
              </label>
              <select
                value={courseForm.organizationId}
                onChange={(e) => {
                  setCourseForm({ ...courseForm, organizationId: e.target.value });
                  if (uploadError && uploadError.includes('Organization')) setUploadError(null);
                }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an organization</option>
                {accounts.filter(account => account.accountStatus === true).map(account => (
                  <option key={account.id} value={account.id}>
                    {account.organizationName}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select the organization that will have access to this private course
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              YouTube Video URL
            </label>
            <input
              type="url"
              value={courseForm.youtubeUrl}
              onChange={(e) => setCourseForm({ ...courseForm, youtubeUrl: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Optional: Add a YouTube video URL for this course. If not provided, a default video will be used.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thumbnail Image
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supported formats: JPEG, PNG, GIF, WebP. Maximum size: 5MB.
              </p>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Account Edit Modal */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Edit Account"
        preventClose={true}
        footer={
          <>
            <button
              onClick={() => setShowAccountModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAccount}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Status <span className="text-red-500">*</span>
            </label>
            <select
              value={accountForm.accountStatus ? 'active' : 'disabled'}
              onChange={(e) => setAccountForm({ ...accountForm, accountStatus: e.target.value === 'active' })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Two Factor Authentication <span className="text-red-500">*</span>
            </label>
            <select
              value={accountForm.twoFactorEnabled ? 'enabled' : 'disabled'}
              onChange={(e) => setAccountForm({ ...accountForm, twoFactorEnabled: e.target.value === 'enabled' })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="disabled">Disabled</option>
              <option value="enabled">Enabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              General Public <span className="text-red-500">*</span>
            </label>
            <select
              value={accountForm.isAccountGeneralPublic ? 'yes' : 'no'}
              onChange={(e) => setAccountForm({ ...accountForm, isAccountGeneralPublic: e.target.value === 'yes' })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Capacity Pool <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={accountForm.capacityPool}
              onChange={(e) => setAccountForm({ ...accountForm, capacityPool: Number(e.target.value) })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter capacity pool number"
              min="0"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Number of user seats allocated to this account
            </p>
          </div>
        </div>
      </Modal>

      {/* Account Details Modal */}
      <Modal
        isOpen={showAccountDetailsModal}
        onClose={() => setShowAccountDetailsModal(false)}
        title="Account Details"
        size="lg"
      >
        {selectedAccountForDetails && (
          <div className="space-y-6">
            {/* Account Header */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedAccountForDetails.organizationName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedAccountForDetails.organizationName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedAccountForDetails.email}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedAccountForDetails.accountStatus === true 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {selectedAccountForDetails.accountStatus ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Account Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Account GUID</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{selectedAccountForDetails.guid}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">User Name</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAccountForDetails.userName}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Created Date</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAccountForDetails.createdDate}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Device ID</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAccountForDetails.deviceId}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email Confirmed</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedAccountForDetails.isEmailConfirmed === true 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {selectedAccountForDetails.isEmailConfirmed ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">General Public</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedAccountForDetails.isAccountGeneralPublic === true 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {selectedAccountForDetails.isAccountGeneralPublic ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Capacity Pool</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAccountForDetails.capacityPool} users</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Two Factor Authentication</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedAccountForDetails.twoFactorEnabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {selectedAccountForDetails.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCourseConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this course? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Admin;