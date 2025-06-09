import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { SignInButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

/**
 * Hook that provides authentication guard functionality
 * Returns the sign-in status and a component to render when authentication is required
 */
export function useAuthGuard() {
  const { isSignedIn } = useUser()

  /**
   * Renders the authentication required UI
   * @param message - Custom message to display (optional)
   * @returns JSX element for the auth required screen
   */
  const renderAuthRequired = (message?: string) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
        <img 
          src="/src/assets/design/Jigo_Tenant_BW_TP.png" 
          alt="Jigo Logo" 
          className="w-16 h-16 mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
        <p className="text-gray-600 mb-6">
          {message || "Please sign in to access this content."}
        </p>
        <div className="flex space-x-4 justify-center">
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <Link to="/" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )

  return {
    isSignedIn,
    renderAuthRequired
  }
}