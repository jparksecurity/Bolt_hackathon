import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Building, TrendingUp, Users, FileText, ArrowRight, CheckCircle, Star, Shield, Award } from 'lucide-react';

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
              Elite Commercial Real Estate
              <span className="text-gradient block hero-subtitle">Management Platform</span>
            </h1>
            <p className="hero-description">
              An exclusive platform designed for top-tier commercial real estate brokers to manage high-value leasing projects with sophisticated tools and premium client experiences
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
        {/* Exclusive Features Grid */}
        <section className="feature-grid">
          <div className="feature-card group">
            <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Premium Client Management</h3>
            <p className="text-gray-600 leading-relaxed">Sophisticated tools designed for managing high-value commercial leasing projects with enterprise-level clients and complex requirements.</p>
          </div>

          <div className="feature-card group">
            <div className="w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Market Intelligence</h3>
            <p className="text-gray-600 leading-relaxed">Access exclusive market data and analytics to provide clients with strategic insights and competitive advantages in their leasing decisions.</p>
          </div>

          <div className="feature-card group">
            <div className="w-14 h-14 bg-gray-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Elite Broker Network</h3>
            <p className="text-gray-600 leading-relaxed">Connect with a curated network of top-performing commercial real estate professionals handling premium properties and Fortune 500 clients.</p>
          </div>

          <div className="feature-card group">
            <div className="w-14 h-14 bg-gray-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confidential Deal Management</h3>
            <p className="text-gray-600 leading-relaxed">Secure, encrypted platform for managing sensitive lease negotiations and confidential client information with enterprise-grade security.</p>
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