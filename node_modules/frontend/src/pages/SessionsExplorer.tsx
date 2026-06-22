import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSessions } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Activity, CalendarDays, MousePointerClick, Clock, MonitorSmartphone } from 'lucide-react';

export default function SessionsExplorer() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('lastSeen');
  const [order, setOrder] = useState('desc');
  const limit = 10;

  // Debounced search logic could be added here, but for simplicity we'll just trigger on enter or blur
  const { data, isLoading } = useQuery({
    queryKey: ['sessions', page, sort, order, search],
    queryFn: () => fetchSessions({ page, limit, sort, order, search }),
    keepPreviousData: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
  };

  const sessions = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sessions Explorer</h2>
          <p className="text-gray-500 mt-1">Analyze individual user journeys and behaviors.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Session ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={`${sort}-${order}`} 
            onChange={(e) => {
              const [s, o] = e.target.value.split('-');
              setSort(s);
              setOrder(o);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="lastSeen-desc">Newest First</option>
            <option value="lastSeen-asc">Oldest First</option>
            <option value="totalEvents-desc">Most Events</option>
            <option value="duration-desc">Longest Duration</option>
          </select>
        </form>
      </div>

      <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        {isLoading && sessions.length === 0 ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 flex items-center justify-between animate-pulse">
                <div className="space-y-3 w-1/3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Activity size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No sessions found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-1">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white">
            {sessions.map((session: any) => (
              <Link 
                key={session.sessionId} 
                to={`/sessions/${session.sessionId}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      {session.sessionId}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest uppercase font-medium bg-gray-100 text-gray-600 flex items-center border border-gray-200/50">
                      <MonitorSmartphone className="w-3 h-3 mr-1" />
                      {session.browser || 'Unknown'} • {session.os || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span className="flex items-center"><CalendarDays className="w-4 h-4 mr-1.5 text-gray-400"/> {format(new Date(session.lastSeen), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-8 sm:text-right">
                  <div>
                    <div className="text-lg font-bold font-mono text-gray-900 tracking-tighter flex items-center justify-end"><MousePointerClick className="w-4 h-4 mr-1 text-indigo-400"/> {session.totalEvents}</div>
                    <div className="text-[10px] font-mono tracking-widest text-gray-400 mt-0.5 uppercase font-medium">Events</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold font-mono text-gray-900 tracking-tighter flex items-center justify-end"><Clock className="w-4 h-4 mr-1 text-orange-400"/> {Math.round(session.duration / 1000)}s</div>
                    <div className="text-[10px] font-mono tracking-widest text-gray-400 mt-0.5 uppercase font-medium">Duration</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && sessions.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * limit, pagination.total)}</span> of <span className="font-medium text-gray-900">{pagination.total}</span> sessions
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-gray-300 bg-white rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-medium text-gray-700 px-2">Page {page} of {pagination.totalPages}</div>
              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-1.5 border border-gray-300 bg-white rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
