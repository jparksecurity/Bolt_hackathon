import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Building, TrendingUp, Users, FileText, ArrowRight, CheckCircle, Star, Shield, Award, Eye, Calendar, FolderOpen, MapPin, Heart } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Animated Background */}
      <section className="hero-section-animated">
        {/* Animated Background Elements */}
        <div className="hero-background">
          <div className="floating-element floating-element-1"></div>
          <div className="floating-element floating-element-2"></div>
          <div className="floating-element floating-element-3"></div>
          <div className="floating-element floating-element-4"></div>
          <div className="floating-element floating-element-5"></div>
          <div className="floating-element floating-element-6"></div>
        </div>
        
        {/* Hero Content */}
        <div className="hero-content">
          <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
            {/* Exclusive Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Invitation Only Platform</span>
            </div>
            
            <h1 className="hero-title">
              Keep Your Clients Informed.
              <span className="text-gradient block hero-subtitle">Every Step of the Way.</span>
            </h1>
            <p className="hero-description">
              JIGO Dash is a private dashboard that helps brokers update clients on leasing projects, tour schedules, documents, and what's next—so clients feel confident and cared for.
            </p>
            <div className="hero-cta">
              <Link
                to="/projects"
                className="btn-primary-hero"
              >
                <span>Access Platform</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {/* What Your Clients Get Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Your Clients Get with JIGO Dash</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card group">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real-Time Project Updates</h3>
              <p className="text-gray-600 leading-relaxed">Keep clients in the loop with daily notes and progress updates throughout the entire leasing process.</p>
            </div>

            <div className="feature-card group">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tour Plans</h3>
              <p className="text-gray-600 leading-relaxed">Let them know where and when they'll be visiting spaces with detailed tour schedules and locations.</p>
            </div>

            <div className="feature-card group">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FolderOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Centralized Docs</h3>
              <p className="text-gray-600 leading-relaxed">Share LOIs, floor plans, comps, and more—no more email digging for important documents.</p>
            </div>

            <div className="feature-card group">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Clear Roadmap</h3>
              <p className="text-gray-600 leading-relaxed">Clients always know what's next in the lease process with transparent project timelines.</p>
            </div>

            <div className="feature-card group">
              <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Peace of Mind</h3>
              <p className="text-gray-600 leading-relaxed">Feel like they're being walked through, not left in the dark during critical decisions.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">From Tour to Lease—Transparent Every Step</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. Broker Creates Project Dashboard</h3>
              <p className="text-gray-600">Set up a dedicated project space with all client requirements and property details.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. Client Receives Private Link</h3>
              <p className="text-gray-600">Secure, personalized access to their project dashboard with read-only permissions.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. Broker Posts Updates + Uploads Docs</h3>
              <p className="text-gray-600">Real-time updates, document sharing, and tour scheduling all in one place.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">4. Client Follows Along with Full Visibility</h3>
              <p className="text-gray-600">Complete transparency throughout the leasing process builds trust and confidence.</p>
            </div>
          </div>
        </section>

        {/* Exclusive Benefits Section */}
        <section className="py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Elite Brokers Choose Our Platform</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Invitation-Only Access</h3>
                    <p className="text-gray-600">Exclusive platform reserved for vetted, top-performing commercial real estate professionals with proven track records.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Premium Client Experience</h3>
                    <p className="text-gray-600">Sophisticated tools and white-glove service capabilities that match the expectations of Fortune 500 clients and high-net-worth individuals.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Confidential & Secure</h3>
                    <p className="text-gray-600">Bank-level security and confidentiality protocols to protect sensitive deal information and client data.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Elevate Your Practice?</h3>
                <p className="text-gray-600 mb-8">Join the most exclusive commercial real estate platform designed for industry leaders.</p>
                <Link
                  to="/projects"
                  className="btn-primary inline-flex items-center space-x-2 px-8 py-3"
                >
                  <span>Access Your Dashboard</span>
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