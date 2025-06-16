import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import logoImage from '../../assets/design/Jigo_Tenant_BW_TP.png';

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={logoImage}
            alt="Jigo Tenant Logo" 
            className="w-10 h-10"
          />
          <div>
            <span className="text-2xl font-bold text-gray-900">JIGO Dash</span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {children}
          <SignedOut>
            <div className="flex items-center space-x-3">
              <SignInButton mode="modal">
                <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            {/* Account management is now only available in the dashboard sidebar */}
          </SignedIn>
          {/* Bolt logo in top right */}
          <div className="flex items-center">
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                src="/black_circle_360x360.png"
                alt="Powered by Bolt" 
                className="w-12 h-12 opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                title="Powered by Bolt"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};