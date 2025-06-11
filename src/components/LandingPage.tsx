import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Building, TrendingUp, Users, FileText, ArrowRight, Star } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f23]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/30 rounded-full text-sm text-[#a1a1aa] mb-6">
            <Star className="w-4 h-4 mr-2 text-[#6366f1]" />
            Trusted by 500+ Real Estate Professionals
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            JIGO <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">Dash</span>
          </h1>
          <p className="text-xl text-[#a1a1aa] mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your commercial real estate leasing process with our intelligent tracking and management platform
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/projects"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#6366f1]/25 transition-all duration-300 hover:-translate-y-1"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="inline-flex items-center px-8 py-4 bg-[#1a1a2e] border border-[#27272a] text-white font-semibold rounded-xl hover:bg-[#16213e] hover:border-[#6366f1] transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="gradient-card p-6 rounded-xl hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center mb-4">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Property Management</h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">Track multiple properties and their leasing status in one centralized platform</p>
          </div>

          <div className="gradient-card p-6 rounded-xl hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Market Analysis</h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">Research and analyze market trends to make informed leasing decisions</p>
          </div>

          <div className="gradient-card p-6 rounded-xl hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Client Management</h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">Manage client requirements and preferences throughout the leasing process</p>
          </div>

          <div className="gradient-card p-6 rounded-xl hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Document Tracking</h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">Keep all lease documents and contracts organized and accessible</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-[#a1a1aa]">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">$2.5B+</div>
            <div className="text-[#a1a1aa]">Deals Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <div className="text-[#a1a1aa]">Client Satisfaction</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="gradient-card p-8 rounded-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
          <p className="text-[#a1a1aa] mb-6 max-w-2xl mx-auto">
            Join thousands of real estate professionals who trust JIGO Dash for their leasing needs
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#6366f1]/25 transition-all duration-300 hover:-translate-y-1"
          >
            Start Tracking Leases
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}