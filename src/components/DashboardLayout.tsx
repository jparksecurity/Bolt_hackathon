import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Building, LogOut, BarChart3, Bot } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import logoImage from '../assets/design/Jigo_Tenant_BW_TP.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Building,
  },
  {
    name: 'Automated Update',
    href: '/automated-update',
    icon: Bot,
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, headerContent }) => {
  const location = useLocation();
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (href === '/projects') {
      return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
    }
    if (href === '/automated-update') {
      return location.pathname === '/automated-update';
    }
    return location.pathname === href;
  };

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') {
      return 'Dashboard';
    } else if (location.pathname === '/projects') {
      return 'Projects';
    } else if (location.pathname.startsWith('/projects/')) {
      return 'Project Details';
    } else if (location.pathname === '/automated-update') {
      return 'Automated Update';
    }
    return 'Dashboard';
  };

  const getPageDescription = () => {
    if (location.pathname === '/dashboard') {
      return 'Overview of your commercial real estate activities';
    } else if (location.pathname === '/projects') {
      return 'Manage your commercial real estate projects';
    } else if (location.pathname.startsWith('/projects/')) {
      return 'Track progress and manage project details';
    } else if (location.pathname === '/automated-update') {
      return 'Use AI to automatically update project information';
    }
    return 'Overview of your activities';
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img 
              src={logoImage}
              alt="Jigo Tenant Logo" 
              className="w-8 h-8"
            />
            <div>
              <span className="text-gray-900 font-bold text-lg">JIGO Dash</span>
              <div className="text-xs text-gray-500 font-medium -mt-1">CRE Platform</div>
            </div>
          </div>
        </div>
        
        {/* Navigation Section */}
        <nav className="flex-1 p-6">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
              >
                <item.icon />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
        
        {/* User Account Section - Fixed at bottom */}
        <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              )}
            </div>
            
            {/* User Info and Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.primaryEmailAddress?.emailAddress || 'No email'}
                  </p>
                </div>
                
                {/* Sign Out Button */}
                <SignOutButton>
                  <button 
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-200"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {getPageDescription()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {headerContent}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};