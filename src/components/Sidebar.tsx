import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Monitor, 
  Settings 
} from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Training', href: '/training', icon: GraduationCap },
  { name: 'Virtual Users', href: '/virtual-users', icon: Users },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Devices', href: '/devices', icon: Monitor },
  { name: 'Admin', href: '/admin', icon: Settings, adminOnly: true },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const userRole = AuthService.getUserRole();

  const isTrainingActive = location.pathname.startsWith('/training');
  const isCoursesActive = location.pathname.startsWith('/courses');
  const isAdminActive = location.pathname.startsWith('/admin');

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly) {
      return AuthService.isAdmin();
    }
    return true;
  });
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <img 
          src="/FullLogo_Transparent_NoBuffer.png" 
          alt="Nova Space" 
          className="h-10 w-auto"
        />
      </div>
      
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            let isActive = location.pathname === item.href;
            
            // Special handling for nested routes
            if (item.href === '/training' && isTrainingActive) {
              isActive = true;
            } else if (item.href === '/courses' && isCoursesActive) {
              isActive = true;
            } else if (item.href === '/admin' && isAdminActive) {
              isActive = true;
            }
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 transition-colors duration-200',
                      isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;