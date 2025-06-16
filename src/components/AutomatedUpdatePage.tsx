import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';
import { DashboardLayout } from './DashboardLayout';
import { Bot, Send, CheckCircle, XCircle, Calendar, Building, User, DollarSign, MapPin, FileText, Loader2, AlertCircle } from 'lucide-react';
import { BaseProjectData } from '../types/project';

interface Project extends BaseProjectData {
  deleted_at?: string | null;
}

interface Property {
  id: string;
  project_id: string;
  name: string;
  address?: string | null;
  sf?: string | null;
  people_capacity?: string | null;
  price_per_sf?: string | null;
  monthly_cost?: string | null;
  expected_monthly_cost?: string | null;
  contract_term?: string | null;
  availability?: string | null;
  lease_type?: string | null;
  lease_structure?: string | null;
  current_state?: string | null;
  condition?: string | null;
  misc_notes?: string | null;
  virtual_tour_url?: string | null;
  suggestion?: string | null;
  flier_url?: string | null;
  tour_datetime?: string | null;
  tour_location?: string | null;
  tour_status?: string | null;
  status: string;
  decline_reason?: string | null;
}

interface UpdateSuggestion {
  id: string;
  type: 'project' | 'property' | 'roadmap' | 'update';
  action: 'create' | 'update';
  entityId?: string;
  entityName: string;
  field: string;
  currentValue: string | null;
  suggestedValue: string;
  confidence: number;
  reasoning: string;
}

export function AutomatedUpdatePage() {
  const { user, isLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [instructions, setInstructions] = useState('');
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState<UpdateSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [approvedSuggestions, setApprovedSuggestions] = useState<Set<string>>(new Set());
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const processWithAI = async () => {
    if (!instructions.trim() || !context.trim()) {
      alert('Please provide both instructions and context.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Simulate AI processing - In a real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock suggestions based on the context
      const mockSuggestions = generateMockSuggestions(instructions, context);
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
      setApprovedSuggestions(new Set());
      setRejectedSuggestions(new Set());

    } catch (err) {
      setError('Failed to process with AI. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const generateMockSuggestions = (instructions: string, context: string): UpdateSuggestion[] => {
    const suggestions: UpdateSuggestion[] = [];
    
    // Parse context for common patterns and generate suggestions
    const lines = context.toLowerCase().split('\n');
    
    lines.forEach((line, index) => {
      // Look for date patterns
      const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)/);
      if (dateMatch && projects.length > 0) {
        suggestions.push({
          id: `date-${index}`,
          type: 'project',
          action: 'update',
          entityId: projects[0].id,
          entityName: projects[0].title,
          field: 'desired_move_in_date',
          currentValue: projects[0].desired_move_in_date,
          suggestedValue: '2024-03-15',
          confidence: 85,
          reasoning: `Found date reference "${dateMatch[0]}" in context that appears to be a move-in date.`
        });
      }

      // Look for square footage
      const sfMatch = line.match(/(\d{1,3}(?:,\d{3})*)\s*(?:sq|square)\s*(?:ft|feet)/);
      if (sfMatch && properties.length > 0) {
        suggestions.push({
          id: `sf-${index}`,
          type: 'property',
          action: 'update',
          entityId: properties[0].id,
          entityName: properties[0].name,
          field: 'sf',
          currentValue: properties[0].sf,
          suggestedValue: `${sfMatch[1]} sq ft`,
          confidence: 90,
          reasoning: `Found square footage "${sfMatch[0]}" in context.`
        });
      }

      // Look for rent/cost information
      const rentMatch = line.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      if (rentMatch && properties.length > 0) {
        suggestions.push({
          id: `rent-${index}`,
          type: 'property',
          action: 'update',
          entityId: properties[0].id,
          entityName: properties[0].name,
          field: 'monthly_cost',
          currentValue: properties[0].monthly_cost,
          suggestedValue: `$${rentMatch[1]}/month`,
          confidence: 80,
          reasoning: `Found monetary amount "$${rentMatch[1]}" in context that appears to be rent.`
        });
      }

      // Look for company names (capitalized words)
      const companyMatch = line.match(/\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/);
      if (companyMatch && projects.length > 0 && !projects[0].company_name) {
        suggestions.push({
          id: `company-${index}`,
          type: 'project',
          action: 'update',
          entityId: projects[0].id,
          entityName: projects[0].title,
          field: 'company_name',
          currentValue: projects[0].company_name,
          suggestedValue: companyMatch[1],
          confidence: 75,
          reasoning: `Found potential company name "${companyMatch[1]}" in context.`
        });
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const toggleSuggestion = (suggestionId: string, approve: boolean) => {
    if (approve) {
      setApprovedSuggestions(prev => new Set([...prev, suggestionId]));
      setRejectedSuggestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestionId);
        return newSet;
      });
    } else {
      setRejectedSuggestions(prev => new Set([...prev, suggestionId]));
      setApprovedSuggestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestionId);
        return newSet;
      });
    }
  };

  const applyApprovedSuggestions = async () => {
    const approvedSuggestionsList = suggestions.filter(s => approvedSuggestions.has(s.id));
    
    if (approvedSuggestionsList.length === 0) {
      alert('No suggestions approved for application.');
      return;
    }

    setProcessing(true);
    try {
      for (const suggestion of approvedSuggestionsList) {
        if (suggestion.type === 'project') {
          await supabase
            .from('projects')
            .update({ [suggestion.field]: suggestion.suggestedValue })
            .eq('id', suggestion.entityId);
        } else if (suggestion.type === 'property') {
          await supabase
            .from('properties')
            .update({ [suggestion.field]: suggestion.suggestedValue })
            .eq('id', suggestion.entityId);
        }
      }

      alert(`Successfully applied ${approvedSuggestionsList.length} updates!`);
      setShowSuggestions(false);
      setSuggestions([]);
      setInstructions('');
      setContext('');
      await fetchData(); // Refresh data

    } catch (err) {
      setError('Failed to apply some updates. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'desired_move_in_date':
      case 'start_date':
        return Calendar;
      case 'company_name':
        return Building;
      case 'contact_name':
        return User;
      case 'broker_commission':
      case 'expected_fee':
      case 'monthly_cost':
      case 'expected_monthly_cost':
        return DollarSign;
      case 'sf':
      case 'address':
        return MapPin;
      default:
        return FileText;
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      'desired_move_in_date': 'Desired Move-in Date',
      'start_date': 'Start Date',
      'company_name': 'Company Name',
      'contact_name': 'Contact Name',
      'broker_commission': 'Broker Commission',
      'expected_fee': 'Expected Fee',
      'monthly_cost': 'Monthly Cost',
      'expected_monthly_cost': 'Expected Monthly Cost',
      'sf': 'Square Feet',
      'address': 'Address',
    };
    return labels[field] || field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to use automated updates</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Introduction Card */}
        <div className="dashboard-card p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Data Updates</h2>
              <p className="text-gray-600">Automatically extract and update project information using AI</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">How it works:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Provide instructions on what information to extract</li>
                  <li>2. Paste relevant context (emails, documents, notes)</li>
                  <li>3. Review AI-generated suggestions</li>
                  <li>4. Approve or reject each suggestion</li>
                  <li>5. Apply approved updates to your projects</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {!showSuggestions ? (
            <div className="space-y-6">
              {/* Instructions Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instructions for AI
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Example: Extract move-in dates, square footage, rental costs, and company names from the provided context..."
                  rows={3}
                  className="form-input w-full px-4 py-3 rounded-lg"
                />
              </div>

              {/* Context Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Context (Paste relevant information)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Paste emails, documents, notes, or any relevant information here..."
                  rows={8}
                  className="form-input w-full px-4 py-3 rounded-lg"
                />
              </div>

              {/* Process Button */}
              <div className="flex justify-end">
                <button
                  onClick={processWithAI}
                  disabled={processing || !instructions.trim() || !context.trim()}
                  className="btn-primary flex items-center space-x-2 px-6 py-3 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Process with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Suggestions Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Suggestions ({suggestions.length})
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {approvedSuggestions.size} approved, {rejectedSuggestions.size} rejected
                  </span>
                  <button
                    onClick={() => {
                      setShowSuggestions(false);
                      setSuggestions([]);
                      setApprovedSuggestions(new Set());
                      setRejectedSuggestions(new Set());
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    Start Over
                  </button>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="space-y-4">
                {suggestions.map((suggestion) => {
                  const IconComponent = getFieldIcon(suggestion.field);
                  const isApproved = approvedSuggestions.has(suggestion.id);
                  const isRejected = rejectedSuggestions.has(suggestion.id);
                  
                  return (
                    <div
                      key={suggestion.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isApproved
                          ? 'border-green-300 bg-green-50'
                          : isRejected
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {suggestion.entityName} - {getFieldLabel(suggestion.field)}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span className="capitalize">{suggestion.type}</span>
                                <span>•</span>
                                <span className="capitalize">{suggestion.action}</span>
                                <span>•</span>
                                <span>{suggestion.confidence}% confidence</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Current Value</p>
                              <p className="text-sm text-gray-900">
                                {suggestion.currentValue || <em className="text-gray-400">Not set</em>}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Suggested Value</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {suggestion.suggestedValue}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                            <strong>Reasoning:</strong> {suggestion.reasoning}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleSuggestion(suggestion.id, false)}
                            className={`p-2 rounded-lg transition-colors ${
                              isRejected
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                            }`}
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => toggleSuggestion(suggestion.id, true)}
                            className={`p-2 rounded-lg transition-colors ${
                              isApproved
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                            }`}
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Apply Button */}
              {approvedSuggestions.size > 0 && (
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={applyApprovedSuggestions}
                    disabled={processing}
                    className="btn-primary flex items-center space-x-2 px-6 py-3"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Applying Updates...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Apply {approvedSuggestions.size} Approved Updates</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Data Summary */}
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Data Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Projects ({projects.length})</h4>
              <div className="space-y-2">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="text-sm text-gray-600">
                    <span className="font-medium">{project.title}</span>
                    <span className="text-gray-400"> • {project.status}</span>
                  </div>
                ))}
                {projects.length > 3 && (
                  <div className="text-sm text-gray-400">
                    +{projects.length - 3} more projects
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Properties ({properties.length})</h4>
              <div className="space-y-2">
                {properties.slice(0, 3).map((property) => (
                  <div key={property.id} className="text-sm text-gray-600">
                    <span className="font-medium">{property.name}</span>
                    <span className="text-gray-400"> • {property.status}</span>
                  </div>
                ))}
                {properties.length > 3 && (
                  <div className="text-sm text-gray-400">
                    +{properties.length - 3} more properties
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}