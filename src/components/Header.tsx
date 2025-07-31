import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, User, Bell, Shield, Edit, FileText, LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';
import AuthService from '../services/AuthService';
import ApiService from '../services/ApiService';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState(false);
  const [accountName, setAccountName] = useState(AuthService.getOrganizationName());
  const [tempAccountName, setTempAccountName] = useState(AuthService.getOrganizationName());
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [alertPage, setAlertPage] = useState(1);
  const alertPageSize = 5;
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tempTwoFactorEnabled, setTempTwoFactorEnabled] = useState(false);

  // Sample account data
  const accountData = currentUser || {
    email: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    role: 'User'
  };

  // Load alerts data and set up refresh
  const refreshAlerts = () => {
    const userId = AuthService.getUserId();
    ApiService.getAlerts(userId)
      .then(alertsData => setAlerts(alertsData))
      .catch(console.error);
    
    ApiService.getUnreadAlertCount(userId)
      .then(count => setUnreadCount(count))
      .catch(console.error);
  };

  // Initial load and periodic refresh
  React.useEffect(() => {
    refreshAlerts();
    const interval = setInterval(refreshAlerts, 1000); // Refresh every second
    return () => clearInterval(interval);
  }, []);

  const totalAlertPages = Math.ceil(alerts.length / alertPageSize);
  const startAlertIndex = (alertPage - 1) * alertPageSize;
  const paginatedAlerts = alerts.slice(startAlertIndex, startAlertIndex + alertPageSize);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showAlertsDropdown && !target.closest('.alerts-container')) {
        setShowAlertsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showAlertsDropdown]);

  const handleSaveAccountName = () => {
    setAccountName(tempAccountName);
    // In a real app, you would update the account name via API
    // ApiService.updateAccount(currentUser.id, { organizationName: tempAccountName });
    setShowEditNameModal(false);
  };

  const handleEditAccountName = () => {
    setTempAccountName(accountName);
    setShowEditNameModal(true);
    setShowUserMenu(false);
  };

  const handleOpen2FAModal = () => {
    if (currentUser) {
      setTempTwoFactorEnabled(false); // Default to false, would come from API
    }
    setShow2FAModal(true);
    setShowUserMenu(false);
  };

  const handleSave2FA = () => {
    if (currentUser) {
      // Update 2FA setting via API
      // ApiService.updateAccount(currentUser.id, { twoFactorEnabled: tempTwoFactorEnabled });
    }
    setShow2FAModal(false);
  };

  const handleCancel2FA = () => {
    setShow2FAModal(false);
  };
  const handleClearAlert = (alertId: string) => {
    ApiService.deleteAlert(alertId)
      .then(() => {
        refreshAlerts();
        // If current page becomes empty, go to previous page
        const newTotalPages = Math.ceil((alerts.length - 1) / alertPageSize);
        if (alertPage > newTotalPages && newTotalPages > 0) {
          setAlertPage(alertPage - 1);
        }
      })
      .catch(console.error);
  };

  const handleClearAllAlerts = () => {
    ApiService.deleteAllAlerts()
      .then(() => {
        refreshAlerts();
        setAlertPage(1);
      })
      .catch(console.error);
  };

  const handleMarkAsRead = (alertId: string) => {
    ApiService.markAlertAsRead(alertId)
      .then(() => refreshAlerts())
      .catch(console.error);
  };

  const handleSignOut = () => {
    AuthService.logout();
    navigate('/login');
    setShowUserMenu(false);
  };
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'training': return '🎓';
      case 'course': return '📚';
      case 'module': return '📖';
      case 'user': return '👤';
      case 'enrollment': return '✅';
      case 'graduation': return '🎓';
      default: return '🔔';
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-64 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex-1" />
        
        <div className="flex items-center space-x-4">
          {/* Alerts Dropdown */}
          <div className="relative alerts-container">
            <button 
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts</h3>
                    {alerts.length > 0 && (
                      <button
                        onClick={handleClearAllAlerts}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {paginatedAlerts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No alerts
                    </div>
                  ) : (
                    paginatedAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                          !alert.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getAlertIcon(alert.type)}</span>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {alert.title}
                              </h4>
                              {!alert.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {alert.timestamp}
                            </p>
                          </div>
                          <button
                            onClick={() => handleClearAlert(alert.id)}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Alert Pagination */}
                {totalAlertPages > 1 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Page {alertPage} of {totalAlertPages}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setAlertPage(Math.max(1, alertPage - 1))}
                        disabled={alertPage === 1}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setAlertPage(Math.min(totalAlertPages, alertPage + 1))}
                        disabled={alertPage === totalAlertPages}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="relative user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {getInitials(accountData.firstName, accountData.lastName)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{accountName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Organization</p>
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => {
                      handleOpen2FAModal();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Two Factor Authentication
                  </button>
                  <button
                    onClick={() => {
                      handleEditAccountName();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4 mr-3" />
                    Edit Account Name
                  </button>
                  <button
                    onClick={() => {
                      setShowAccountDetailsModal(true);
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Account Details
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

      {/* Two Factor Authentication Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={handleCancel2FA}
        title="Two Factor Authentication"
        preventClose={true}
        footer={
          <>
            <button
              onClick={handleCancel2FA}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave2FA}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Two Factor Authentication Status
            </label>
            <select
              value={tempTwoFactorEnabled ? 'enabled' : 'disabled'}
              onChange={(e) => setTempTwoFactorEnabled(e.target.value === 'enabled')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="disabled">Disabled</option>
              <option value="enabled">Enabled</option>
            </select>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
          </div>
        </div>
      </Modal>

      {/* Edit Account Name Modal */}
      <Modal
        isOpen={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
        title="Edit Account Name"
        preventClose={true}
        footer={
          <>
            <button
              onClick={() => {
                setShowEditNameModal(false);
                setTempAccountName(accountName); // Reset on cancel
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveAccountName}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={tempAccountName}
              onChange={(e) => setTempAccountName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter account name"
            />
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              This is the organization name that will be displayed in the header and throughout the application.
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
        <div className="space-y-6">
          {/* Account Header */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getInitials(accountData.firstName, accountData.lastName)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {accountData.firstName} {accountData.lastName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {accountName}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{accountData.email}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">First Name</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{accountData.firstName}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Last Name</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{accountData.lastName}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">User Name</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{accountData.userName}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Account Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {accountData.accountStatus ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Capacity Pool</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{accountData.capacityPool} users</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">General Public Access</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                accountData.isGeneralPublic 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
              }`}>
                {accountData.isGeneralPublic ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;