import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRecentActivity } from '../../services/api';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Activity, MousePointer2, FileText } from 'lucide-react';

export default function RecentActivityFeed() {
  const [events, setEvents] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => fetchRecentActivity(10),
    refetchInterval: 10000, // Auto refresh every 10 seconds
  });

  useEffect(() => {
    if (data) {
      setEvents(data);
    }
  }, [data]);

  if (isLoading && !events.length) {
    return (
      <Card className="h-full border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-sm font-medium flex items-center text-gray-700">
            <Activity className="w-4 h-4 mr-2 text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-gray-200 shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
        <CardTitle className="text-sm font-medium flex items-center text-gray-700">
          <Activity className="w-4 h-4 mr-2 text-blue-500" />
          Recent Activity
          <span className="ml-auto relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
        {events.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No recent activity
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.map((event, index) => (
              <div key={`${event.sessionId}-${index}`} className="p-4 hover:bg-gray-50 transition-colors flex space-x-3">
                <div className="mt-0.5">
                  {event.eventType === 'click' ? (
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <MousePointer2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">
                    {event.eventType === 'click' ? 'User Clicked' : 'Visited Page'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {event.pageUrl}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(event.timestamp), 'HH:mm:ss')} • {event.sessionId.slice(0, 8)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
