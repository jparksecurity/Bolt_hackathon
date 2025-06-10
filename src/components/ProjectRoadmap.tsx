import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Circle, Clock, Plus, Edit3 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';

interface ProjectRoadmapProps {
  projectId: string;
}

interface RoadmapStep {
  id: string;
  title: string;
  description?: string | null;
  status: 'completed' | 'in-progress' | 'pending';
  expected_date?: string | null;
  completed_date?: string | null;
  order_index?: number | null;
}

export const ProjectRoadmap: React.FC<ProjectRoadmapProps> = ({ projectId }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('project_roadmap')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setRoadmapSteps(data || []);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, projectId]);

  useEffect(() => {
    if (user && projectId) {
      fetchRoadmap();
    }
  }, [user, projectId, fetchRoadmap]);

  if (loading) {
    return (
      <div className="bg-white p-6">
        <div className="text-center text-gray-500">Loading roadmap...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Project Roadmap</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Step</span>
        </button>
      </div>
      
      {roadmapSteps.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No roadmap steps yet</h4>
          <p className="text-gray-600 mb-6">Create a roadmap to track your project's progress</p>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto">
            <Plus className="w-4 h-4" />
            <span>Add First Step</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {roadmapSteps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.status === 'completed' 
                  ? 'bg-green-100 text-green-600' 
                  : step.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.status === 'in-progress' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              {index < roadmapSteps.length - 1 && (
                <div className="w-px h-16 bg-gray-200 mt-2" />
              )}
            </div>
            
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{step.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    step.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : step.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {step.status === 'completed' ? 'Completed' : step.status === 'in-progress' ? 'In Progress' : 'Pending'}
                  </span>
                  <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{step.description}</p>
              <div className="text-xs text-gray-500">
                {step.completed_date ? (
                  <span>Completed: {new Date(step.completed_date).toLocaleDateString()}</span>
                ) : step.expected_date ? (
                  <span>Expected: {new Date(step.expected_date).toLocaleDateString()}</span>
                ) : (
                  <span>No date set</span>
                )}
              </div>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};