import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Building, TrendingUp, Users, FileText, ArrowRight, CheckCircle, Star } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Commercial Real Estate
            <span className="text-gradient block">Management Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform your commercial real estate leasing process with our intelligent tracking and management platform
          </p>
          <div className="flex items-center justify-center">
            <Link
              to="/projects"
              className="btn-primary flex items-center space-x-3 px-10 py-4 text-lg font-semibold"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {/* Features Grid */}
        <section className="feature-grid">
          <div className="feature-card group">
            <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Building className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Property Management</h3>
            <p className="text-gray-600 leading-relaxed">Track multiple properties and their leasing status in one centralized platform with real-time updates and comprehensive analytics.</p>
          </div>

          <div className="feature-card group">
            <div className="w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Market Analysis</h3>
            <p className="text-gray-600 leading-relaxed">Research and analyze market trends to make informed leasing decisions with data-driven insights and competitive intelligence.</p>
          </div>

          <div className="feature-card group">
            <div className="w-14 h-14 bg-gray-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Client Management</h3>
            <p className="text-gray-600 leading-relaxed">Manage client requirements and preferences throughout the leasing process with automated workflows and communication tools.</p>
          </div>

          <div className="feature-card group">
            <div className="w-14 h-14 bg-gray-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Document Tracking</h3>
            <p className="text-gray-600 leading-relaxed">Keep all lease documents and contracts organized and accessible with secure cloud storage and version control.</p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
            <p className="text-gray-600 text-lg">Join thousands of real estate professionals who rely on our platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800 mb-3">500+</div>
              <div className="text-gray-600 text-lg font-medium">Active Projects</div>
              <div className="text-gray-500 text-sm mt-1">Managed monthly</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800 mb-3">$2.5B+</div>
              <div className="text-gray-600 text-lg font-medium">Deals Tracked</div>
              <div className="text-gray-500 text-sm mt-1">Total transaction value</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800 mb-3">98%</div>
              <div className="text-gray-600 text-lg font-medium">Client Satisfaction</div>
              <div className="text-gray-500 text-sm mt-1">Based on user feedback</div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Our Platform?</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Streamlined Workflow</h3>
                    <p className="text-gray-600">Automate repetitive tasks and focus on what matters most - closing deals and building relationships.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Real-time Collaboration</h3>
                    <p className="text-gray-600">Keep your team and clients in sync with instant updates and shared project visibility.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Data-Driven Insights</h3>
                    <p className="text-gray-600">Make informed decisions with comprehensive analytics and market intelligence.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-8">Join the future of commercial real estate management today.</p>
                <Link
                  to="/projects"
                  className="btn-primary inline-flex items-center space-x-2 px-8 py-3"
                >
                  <span>Start Your Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}