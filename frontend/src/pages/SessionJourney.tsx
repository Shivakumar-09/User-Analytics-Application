import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSessionDetails } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { format } from 'date-fns';
import { ArrowLeft, Clock, MonitorSmartphone, MousePointer2, FileText, CalendarDays, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SessionJourney() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['sessionDetails', sessionId],
    queryFn: () => fetchSessionDetails(sessionId as string),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        <Card className="animate-pulse h-32"></Card>
        <div className="space-y-4 pl-4 border-l-2 border-gray-200 ml-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex space-x-4 items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full -ml-[25px]"></div>
              <div className="h-16 bg-gray-100 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !events || events.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-800">Session not found</h2>
        <p className="text-gray-500 mt-2">The session you are looking for does not exist or has no events.</p>
        <Link to="/sessions" className="mt-4 inline-block text-blue-600 hover:underline">
          &larr; Back to Sessions
        </Link>
      </div>
    );
  }

  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const duration = new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime();
  const metadata = firstEvent.metadata || {};

  // Pre-process events to cluster consecutive identical events (like multiple rapid clicks on the same page)
  const clusteredEvents: any[] = [];
  
  if (events && events.length > 0) {
    let currentCluster = { ...events[0], clusterCount: 1, _originalId: events[0]._id, coords: events[0].coordinates ? [events[0].coordinates] : [] };
    
    for (let i = 1; i < events.length; i++) {
      const event = events[i];
      const isSameType = event.eventType === currentCluster.eventType;
      const isSamePage = event.pageUrl === currentCluster.pageUrl;
      const isClick = event.eventType === 'click';
      
      // We only cluster consecutive clicks on the same page
      if (isSameType && isSamePage && isClick) {
        currentCluster.clusterCount += 1;
        if (event.coordinates) {
          currentCluster.coords.push(event.coordinates);
        }
        currentCluster.timestamp = event.timestamp; // use latest timestamp
      } else {
        clusteredEvents.push(currentCluster);
        currentCluster = { ...event, clusterCount: 1, _originalId: event._id, coords: event.coordinates ? [event.coordinates] : [] };
      }
    }
    clusteredEvents.push(currentCluster);
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <div>
        <Link to="/sessions" className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sessions
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center">
          Session Journey
        </h2>
        <p className="text-gray-500 text-sm mt-1 font-mono">{sessionId}</p>
      </div>

      {/* Summary Card */}
      <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="bg-gray-50/50 border-b border-gray-100/50 px-6 py-4 flex flex-wrap gap-y-4 gap-x-8">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase font-semibold mb-1 flex items-center"><CalendarDays className="w-3 h-3 mr-1"/> Date</div>
            <div className="font-medium text-gray-900 font-mono tracking-tight">{format(new Date(firstEvent.timestamp), 'MMM d, yyyy')}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase font-semibold mb-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> Duration</div>
            <div className="font-medium text-gray-900 font-mono tracking-tight">{Math.round(duration / 1000)}s</div>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase font-semibold mb-1 flex items-center"><FileText className="w-3 h-3 mr-1"/> Total Events</div>
            <div className="font-medium text-gray-900 font-mono tracking-tight">{events.length}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase font-semibold mb-1 flex items-center"><MonitorSmartphone className="w-3 h-3 mr-1"/> Browser / OS</div>
            <div className="font-medium text-gray-900 font-mono tracking-tight capitalize">
              {metadata.browser || 'Unknown'} • {metadata.os || 'Unknown'}
            </div>
          </div>
        </div>
      </Card>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 ml-4">
        {/* The vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-200" />

        <div className="space-y-6">
          {clusteredEvents.map((event: any, index: number) => {
            const isClick = event.eventType === 'click';
            const isClustered = event.clusterCount > 1;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={event._originalId || index} 
                className="relative"
              >
                {/* Timeline dot */}
                <div className={`absolute -left-[30px] sm:-left-[38px] top-1.5 w-4 h-4 rounded-full border-2 border-white ring-1 shadow-sm ${
                  isClick ? 'bg-orange-400 ring-orange-200' : 'bg-indigo-400 ring-indigo-200'
                }`} />
                
                <Card className={`border hover:shadow-md transition-shadow rounded-2xl overflow-hidden ${isClick ? 'border-orange-100 bg-orange-50/10' : 'border-gray-100/80 bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]'}`}>
                  <CardContent className="p-4 flex items-start justify-between">
                    <div className="flex space-x-3 items-start w-full">
                      <div className={`p-2 rounded-xl ${isClick ? 'bg-orange-100 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {isClustered ? <Zap className="w-5 h-5" /> : (isClick ? <MousePointer2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 flex items-center tracking-tight">
                          {isClustered ? `${event.clusterCount} Rapid Clicks` : event.eventType.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5 font-medium">
                          {event.pageUrl}
                        </div>
                        {isClick && event.coords && event.coords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {event.coords.map((coord: any, cIndex: number) => (
                              <div key={cIndex} className="text-[10px] font-mono bg-white border border-orange-100/80 text-orange-600 px-2 py-1 rounded-md inline-block shadow-sm">
                                x: {coord.x}, y: {coord.y}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 whitespace-nowrap font-medium font-mono uppercase tracking-widest pl-4">
                      {format(new Date(event.timestamp), 'HH:mm:ss')}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
