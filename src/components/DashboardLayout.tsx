import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Building, Home, FileText, Settings, User } from 'lucide-react';
import logoImage from '../assets/design/Jigo_Tenant_BW_TP.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/projects',
    icon: Home,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Building,
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, headerContent }) => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/projects') {
      return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
    }
    return location.pathname === href;
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src={logoImage}
              alt="Jigo Tenant Logo" 
              className="w-8 h-8"
            />
            <div>
              <span className="text-gray-900 font-bold text-lg">JIGO</span>
              <div className="text-xs text-gray-500 font-medium -mt-1">CRE Platform</div>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
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
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">User Account</p>
              <p className="text-xs text-gray-500 truncate">Manage settings</p>
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
              {location.pathname === '/projects' ? 'Projects' : 
               location.pathname.startsWith('/projects/') ? 'Project Details' : 
               'Dashboard'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {location.pathname === '/projects' ? 'Manage your commercial real estate projects' : 
               location.pathname.startsWith('/projects/') ? 'Track progress and manage project details' : 
               'Overview of your activities'}
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