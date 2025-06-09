import { Link } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  rightContent?: React.ReactNode;
}

export function Header({ showBackButton = false, backTo = "/projects", rightContent }: HeaderProps) {
  const { isSignedIn } = useUser();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link 
            to={showBackButton ? backTo : "/"} 
            className="flex items-center space-x-3 text-gray-600 hover:text-gray-900"
          >
            {showBackButton && <ArrowLeft className="w-5 h-5" />}
            <img 
              src="/src/assets/design/Jigo_Tenant_BW_TP.png" 
              alt="Jigo Tenant Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-bold text-gray-900">Lease Tracker</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {rightContent ? (
            <div className="flex items-center space-x-4">
              {rightContent}
              {isSignedIn && (
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              )}
            </div>
          ) : (
            isSignedIn && (
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            )
          )}
        </div>
      </div>
    </header>
  );
} 