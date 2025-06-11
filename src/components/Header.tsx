import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import logoImage from '../assets/design/Jigo_Tenant_BW_TP.png';

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 glass-effect">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={logoImage}
            alt="Jigo Tenant Logo" 
            className="w-8 h-8"
          />
        </div>
        <div className="flex items-center space-x-4">
          {children}
          <SignedOut>
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-indigo-500 transition-all duration-300">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};