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
    <header className="bg-[#1a1a2e] border-b border-[#27272a] px-6 py-4 glass-effect">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={logoImage}
            alt="Jigo Tenant Logo" 
            className="w-8 h-8 filter brightness-0 invert"
          />
          <h1 className="text-xl font-bold text-white">JIGO Dash</h1>
        </div>
        <div className="flex items-center space-x-4">
          {children}
          <SignedOut>
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-[#a1a1aa] bg-[#1a1a2e] border border-[#27272a] rounded-lg hover:bg-[#16213e] hover:border-[#6366f1] transition-all duration-300">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg hover:shadow-lg hover:shadow-[#6366f1]/25 transition-all duration-300">
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