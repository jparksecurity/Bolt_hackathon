import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Building, TrendingUp, Users, FileText, ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your commercial real estate leasing process with our intelligent tracking and management platform
          </p>
          <div className="flex items-center justify-center">
            <Link
              to="/projects"
              className="btn-primary flex items-center space-x-2 px-8 py-4 text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="dashboard-card p-6 hover-lift">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Property Management</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Track multiple properties and their leasing status in one centralized platform</p>
          </div>

          <div className="dashboard-card p-6 hover-lift">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Market Analysis</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Research and analyze market trends to make informed leasing decisions</p>
          </div>

          <div className="dashboard-card p-6 hover-lift">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Client Management</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Manage client requirements and preferences throughout the leasing process</p>
          </div>

          <div className="dashboard-card p-6 hover-lift">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Document Tracking</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Keep all lease documents and contracts organized and accessible</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">500+</div>
            <div className="text-slate-600">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">$2.5B+</div>
            <div className="text-slate-600">Deals Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">98%</div>
            <div className="text-slate-600">Client Satisfaction</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="dashboard-card p-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Transform Your Business?</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Join thousands of real estate professionals who trust our platform for their leasing needs
          </p>
          <Link
            to="/projects"
            className="btn-primary flex items-center space-x-2 px-8 py-4 text-lg mx-auto"
          >
            Start Tracking Leases
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}