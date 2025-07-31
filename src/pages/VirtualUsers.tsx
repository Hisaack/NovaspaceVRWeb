import React, { useState } from 'react';
import { Plus, Upload, Trash2, AlertCircle, Eye, User, Mail, Calendar, Award } from 'lucide-react';
import * as XLSX from 'xlsx';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

interface FormData {
  firstName: string;
  lastName: string;
  stage: string;
  email: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  stage?: string;
  email?: string;
  file?: string;
}

const VirtualUsers: React.FC = () => {
  const [virtualUsers, setVirtualUsers] = useState<any[]>([]);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({ firstName: '', lastName: '', stage: '', email: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successful: any[];
    failed: any[];
    total: number;
  } | null>(null);
  const [showUploadResults, setShowUploadResults] = useState(false);

  // Get capacity from current account
  const capacityUsed = virtualUsers?.length || 0;
  const capacityTotal = currentAccount?.capacityPool || 0;
  const isAccountActive = currentAccount?.isActive === true;

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userId = AuthService.getUserId();
        
        // Load virtual users for current account
        const usersData = await ApiService.getVirtualUsers(userId);
        setVirtualUsers(usersData);
        
        // Load current account info
        const accountData = await ApiService.getAccountById(userId);
        console.log('Account data received:', accountData);
        setCurrentAccount(accountData);
      } catch (error) {
        console.error('Failed to load virtual users data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const columns = [
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
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => {
              setSelectedUser(row);
              setShowDetailsModal(true);
            }}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 whitespace-nowrap"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
          <button
            onClick={() => {
              setSelectedUser(row);
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 whitespace-nowrap"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      )
    }
  ];

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Check if account is active
    if (!isAccountActive) {
      newErrors.firstName = 'Cannot add user. Account is disabled. Please contact administrator.';
      setErrors(newErrors);
      return false;
    }

    // Check capacity before validating other fields
    if (capacityUsed >= capacityTotal) {
      newErrors.firstName = `Cannot add user. Capacity limit reached (${capacityTotal} users maximum)`;
      setErrors(newErrors);
      return false;
    }

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters long';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters long';
    }

    // Stage validation (should be a number)
    if (!formData.stage) {
      newErrors.stage = 'Stage is required';
    } else {
      const stageNum = parseInt(formData.stage);
      if (isNaN(stageNum) || stageNum < 1 || stageNum > 10) {
        newErrors.stage = 'Stage must be a number between 1 and 10';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate bulk upload file
  const validateBulkFile = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedFile) {
      newErrors.file = 'Please select an Excel file';
    } else {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        newErrors.file = 'Please select a valid Excel file (.xlsx, .xls, or .csv)';
      } else if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.file = 'File size must be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const createUserDto = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        stage: formData.stage
      };
      
      await ApiService.createVirtualUser(createUserDto);
      
      // Reload virtual users
      const userId = AuthService.getUserId();
      const usersData = await ApiService.getVirtualUsers(userId);
      setVirtualUsers(usersData);
      
      // Reset form and close modal
      setFormData({ firstName: '', lastName: '', stage: '', email: '' });
      setErrors({});
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding user:', error);
      setErrors({ general: 'Failed to add virtual user. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!validateBulkFile()) {
      return;
    }

    // Check if account is active
    if (!isAccountActive) {
      setErrors({ file: 'Cannot upload users. Account is disabled. Please contact administrator.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const fileData = await readExcelFile(selectedFile!);
      const results = await processExcelData(fileData);
      
      // Send successful users to API
      if (results.successful.length > 0) {
        const bulkCreateData = results.successful.map(user => ({
          name: user.name,
          email: user.email,
          stage: user.stage
        }));
        
        await ApiService.createBulkVirtualUsers(bulkCreateData);
      }
      
      setUploadResults(results);
      setShowUploadResults(true);
      
      // Refresh virtual users list
      const userId = AuthService.getUserId();
      const usersData = await ApiService.getVirtualUsers(userId);
      setVirtualUsers(usersData);
      
      // Close upload modal
      setSelectedFile(null);
      setErrors({});
      setShowBulkModal(false);
    } catch (error) {
      setErrors({ file: 'Error processing file. Please check the format and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const processExcelData = async (data: any[]): Promise<{
    successful: any[];
    failed: any[];
    total: number;
  }> => {
    const successful: any[] = [];
    const failed: any[] = [];
    
    // Skip header row and process data
    const rows = data.slice(1);
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because we skipped header and arrays are 0-indexed
      
      // Skip empty rows
      if (!row || row.length === 0 || !row.some(cell => cell && cell.toString().trim())) {
        continue;
      }
      
      const [firstName, lastName, stage, email] = row;
      
      // Validate row data
      const validationErrors: string[] = [];
      
      if (!firstName || !firstName.toString().trim()) {
        validationErrors.push('First name is required');
      } else if (firstName.toString().trim().length < 2) {
        validationErrors.push('First name must be at least 2 characters');
      }
      
      if (!lastName || !lastName.toString().trim()) {
        validationErrors.push('Last name is required');
      } else if (lastName.toString().trim().length < 2) {
        validationErrors.push('Last name must be at least 2 characters');
      }
      
      if (!stage) {
        validationErrors.push('Stage is required');
      } else {
        const stageNum = parseInt(stage.toString());
        if (isNaN(stageNum) || stageNum < 1 || stageNum > 10) {
          validationErrors.push('Stage must be a number between 1 and 10');
        }
      }
      
      if (!email || !email.toString().trim()) {
        validationErrors.push('Email is required');
      } else if (!isValidEmail(email.toString().trim())) {
        validationErrors.push('Invalid email format');
      }
      
      // Check capacity
      const currentCapacityUsed = virtualUsers.length + successful.length;
      if (currentCapacityUsed >= capacityTotal) {
        validationErrors.push(`Capacity limit reached (${capacityTotal} users maximum)`);
      }
      
      // Check for duplicate emails in existing users
      const emailExists = virtualUsers.some(user => 
        user.email.toLowerCase() === email.toString().trim().toLowerCase()
      );
      if (emailExists) {
        validationErrors.push('Email already exists in system');
      }
      
      // Check for duplicate emails in current batch
      const emailInBatch = successful.some(user => 
        user.email.toLowerCase() === email.toString().trim().toLowerCase()
      );
      if (emailInBatch) {
        validationErrors.push('Duplicate email in upload file');
      }
      
      if (validationErrors.length > 0) {
        failed.push({
          row: rowNumber,
          firstName: firstName?.toString() || '',
          lastName: lastName?.toString() || '',
          stage: stage?.toString() || '',
          email: email?.toString() || '',
          errors: validationErrors
        });
      } else {
        const newUser = {
          name: `${firstName.toString().trim()} ${lastName.toString().trim()}`,
          userCode: `U${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          dateAdded: new Date().toISOString().split('T')[0],
          stage: stage.toString(),
          email: email.toString().trim(),
          lastLogin: 'Never',
          coursesCompleted: 0,
          totalTrainingTime: '0h 0m',
          averageScore: 0,
          status: 'Active',
          accountId: dataService.getCurrentAccountId()
        };
        
        // Add to data service
        // This would be handled by bulk API endpoint
        successful.push(newUser);
      }
    }
    
    return {
      successful,
      failed,
      total: rows.filter(row => row && row.length > 0 && row.some(cell => cell && cell.toString().trim())).length
    };
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      ApiService.deleteVirtualUser(selectedUser.id)
        .then(() => {
          // Reload virtual users
          const userId = AuthService.getUserId();
          return ApiService.getVirtualUsers(userId);
        })
        .then(usersData => {
          setVirtualUsers(usersData);
          setShowDeleteModal(false);
          setSelectedUser(null);
        })
        .catch(error => {
          console.error('Failed to delete virtual user:', error);
          // Show error message to user
          alert('Failed to delete virtual user. Please try again.');
        });
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({ firstName: '', lastName: '', stage: '', email: '' });
    setErrors({});
  };

  const handleCloseBulkModal = () => {
    setShowBulkModal(false);
    setSelectedFile(null);
    setErrors({});
    setUploadResults(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    // Clear file error when a new file is selected
    if (errors.file) {
      setErrors({ ...errors, file: undefined });
    }
  };

  const handleRowDoubleClick = (user: any) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Virtual Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Virtual Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage VR training users</p>
          {!isAccountActive && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-400">
                ⚠️ Account is disabled. Virtual user management is not available.
              </p>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkModal(true)}
            disabled={!isAccountActive}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Bulk Users
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!isAccountActive}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Virtual User
          </button>
        </div>
      </div>

      {/* Capacity Pool */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capacity Pool</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(capacityUsed / capacityTotal) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {capacityUsed} / {capacityTotal} users
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Contact administrator to increase capacity beyond {capacityTotal} users.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Tip:</strong> Double-click on any row to view detailed user information
          </p>
        </div>
          <DataTable 
            columns={columns} 
            data={virtualUsers} 
            pageSize={10}
            onRowDoubleClick={handleRowDoubleClick}
            disableHover={false}
          />
      </div>

      {/* Add User Modal - Prevent auto-close */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        title="Add Virtual User"
        preventClose={true}
        footer={
          <>
            <button
              onClick={handleCloseAddModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                    errors.firstName 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter first name"
                />
                <ErrorMessage error={errors.firstName} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                    if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                    errors.lastName 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter last name"
                />
                <ErrorMessage error={errors.lastName} />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stage <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.stage}
              onChange={(e) => {
                setFormData({ ...formData, stage: e.target.value });
                if (errors.stage) setErrors({ ...errors, stage: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                errors.stage 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter stage number (1-10)"
            />
            <ErrorMessage error={errors.stage} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stage should be a number between 1 and 10
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                errors.email 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter email address"
            />
            <ErrorMessage error={errors.email} />
          </div>
        </div>
      </Modal>

      {/* Bulk Upload Modal - Prevent auto-close */}
      <Modal
        isOpen={showBulkModal}
        onClose={handleCloseBulkModal}
        title="Add Bulk Virtual Users"
        preventClose={true}
        footer={
          <>
            <button
              onClick={handleCloseBulkModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpload}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excel File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                errors.file 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <ErrorMessage error={errors.file} />
            {selectedFile && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              File Requirements:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Excel file format (.xlsx, .xls, or .csv)</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Required columns in order: <strong>First Name, Last Name, Stage, Email Address</strong></li>
              <li>• Stage must be a number between 1-10</li>
              <li>• First row should contain column headers</li>
              <li>• Email addresses must be unique</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-2">
              Example Excel Format:
            </h4>
            <div className="text-xs font-mono text-yellow-800 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
              <div className="grid grid-cols-4 gap-4 border-b border-yellow-300 dark:border-yellow-700 pb-1 mb-1">
                <span className="font-bold">First Name</span>
                <span className="font-bold">Last Name</span>
                <span className="font-bold">Stage</span>
                <span className="font-bold">Email Address</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <span>John</span>
                <span>Doe</span>
                <span>3</span>
                <span>john@example.com</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <span>Jane</span>
                <span>Smith</span>
                <span>5</span>
                <span>jane@example.com</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* User Details Modal - Allow auto-close */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {getInitials(selectedUser.name)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  User Code: {selectedUser.userCode}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedUser.status === 'Active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Date Added</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.dateAdded}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Award className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Stage</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.stage}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Last Login</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.lastLogin}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Award className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Courses Completed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.coursesCompleted}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Total Training Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.totalTrainingTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Performance</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedUser.averageScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedUser.averageScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal - Allow auto-close for confirmation dialogs */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Virtual User"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Delete
            </button>
          </>
        }
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the virtual user <strong>"{selectedUser?.name}"</strong>? 
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This action cannot be undone and will permanently remove all associated training data.
            </p>
          </div>
        </div>
      </Modal>

      {/* Upload Results Modal */}
      <Modal
        isOpen={showUploadResults}
        onClose={() => setShowUploadResults(false)}
        title="Bulk Upload Results"
        size="lg"
      >
        {uploadResults && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {uploadResults.successful.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {uploadResults.failed.length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {uploadResults.total}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Processed</div>
              </div>
            </div>

            {/* Successful Users */}
            {uploadResults.successful.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
                  ✅ Successfully Added Users ({uploadResults.successful.length})
                </h4>
                <div className="max-h-40 overflow-y-auto bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  {uploadResults.successful.map((user, index) => (
                    <div key={index} className="flex justify-between items-center py-1 text-sm">
                      <span className="text-gray-900 dark:text-white">{user.name}</span>
                      <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-mono">{user.userCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Users */}
            {uploadResults.failed.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
                  ❌ Failed to Add Users ({uploadResults.failed.length})
                </h4>
                <div className="max-h-60 overflow-y-auto bg-red-50 dark:bg-red-900/20 rounded-lg p-3 space-y-2">
                  {uploadResults.failed.map((user, index) => (
                    <div key={index} className="border-b border-red-200 dark:border-red-800 pb-2 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Row {user.row}: {user.firstName || 'Unknown'} {user.lastName || ''}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {user.errors.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions for fixing errors */}
            {uploadResults.failed.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h5 className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-2">
                  💡 To fix the failed entries:
                </h5>
                <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
                  <li>• Correct the errors in your Excel file</li>
                  <li>• Remove or fix duplicate email addresses</li>
                  <li>• Ensure stage numbers are between 1-10</li>
                  <li>• Make sure both first name and last name are provided</li>
                  <li>• Check that all required fields are filled</li>
                  <li>• Upload the corrected file again</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VirtualUsers;