import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { TrendingUp, Users, FileText } from 'lucide-react';
import { Header } from './Header';

export function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        rightContent={
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <Link
                to="/projects"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                My Projects
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        }
      />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Commercial Lease Tracking
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your commercial real estate leasing process with our comprehensive tracking and management platform
          </p>
          {isSignedIn ? (
            <Link
              to="/projects"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Projects
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Get Started Free
              </button>
            </SignUpButton>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <img 
                src="/src/assets/design/Jigo_Tenant_BW_TP.png" 
                alt="Jigo Logo" 
                className="w-6 h-6"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Management</h3>
            <p className="text-gray-600">Track multiple properties and their leasing status in one centralized platform</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Analysis</h3>
            <p className="text-gray-600">Research and analyze market trends to make informed leasing decisions</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Management</h3>
            <p className="text-gray-600">Manage client requirements and preferences throughout the leasing process</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Tracking</h3>
            <p className="text-gray-600">Keep all lease documents and contracts organized and accessible</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of real estate professionals who trust Lease Tracker for their leasing needs
          </p>
          {isSignedIn ? (
            <Link
              to="/projects"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to My Projects
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Start Tracking Leases
              </button>
            </SignUpButton>
          )}
        </div>
      </div>
    </div>
  );
}