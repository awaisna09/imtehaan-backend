import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { supabase } from '../utils/supabase/client';
import { pageActivityTracker } from '../utils/supabase/page-activity-tracker';

interface PageSession {
  id: string;
  user_id: string;
  page_name: string;
  page_category: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  activities: any[];
  metadata: any;
}

export default function PageSessionsDebug() {
  const { user } = useApp();
  const [sessions, setSessions] = useState<PageSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchSessions = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSessions(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching page sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
      
      // Refresh every 5 seconds to see real-time updates
      const interval = setInterval(fetchSessions, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString();
  };

  if (!user) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Page Sessions Debug</h3>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
      
      <div className="mb-4">
        <button
          onClick={fetchSessions}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Sessions'}
        </button>
      </div>

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <p className="text-gray-500">No page sessions found</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{session.page_name}</h4>
                  <p className="text-sm text-gray-600">Category: {session.page_category}</p>
                  <p className="text-sm text-gray-600">
                    Start: {formatTime(session.start_time)}
                  </p>
                  {session.end_time && (
                    <p className="text-sm text-gray-600">
                      End: {formatTime(session.end_time)}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Duration: {formatDuration(session.duration)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {session.activities?.length || 0} activities
                  </span>
                </div>
              </div>
              
              {session.activities && session.activities.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Activities:</p>
                  <div className="space-y-1">
                    {session.activities.map((activity, index) => (
                      <div key={index} className="text-xs bg-white p-2 rounded border">
                        <span className="font-medium">{activity.type}</span>
                        {activity.data && Object.keys(activity.data).length > 0 && (
                          <span className="text-gray-600 ml-2">
                            {JSON.stringify(activity.data)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


















