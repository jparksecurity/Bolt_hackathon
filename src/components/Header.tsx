import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white text-gray-900 px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src="/src/assets/design/Jigo_Tenant_BW_TP.png" 
            alt="Jigo Tenant Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold">Lease Tracker</h1>
        </div>
        <div className="flex items-center space-x-4">
          {children}
          <SignedOut>
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
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