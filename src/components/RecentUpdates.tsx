import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Edit3, Plus } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '../lib/supabase';

interface RecentUpdatesProps {
  projectId: string;
}

interface Update {
  id: string;
  content: string;
  update_date: string;
  created_at: string;
}

export const RecentUpdates: React.FC<RecentUpdatesProps> = ({ projectId }) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpdates = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('update_date', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (err) {
      console.error('Error fetching updates:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, projectId]);

  useEffect(() => {
    if (user && projectId) {
      fetchUpdates();
    }
  }, [user, projectId, fetchUpdates]);

  if (loading) {
    return (
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">Loading updates...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Updates</h3>
        <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
      </div>
      
      {updates.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No updates yet</p>
          <p className="text-gray-400 text-xs mt-1">Project updates will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="border-l-4 border-blue-200 pl-4 group">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-700 leading-relaxed">{update.content}</p>
                <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 ml-2 mt-0.5 flex-shrink-0" />
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {new Date(update.update_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};