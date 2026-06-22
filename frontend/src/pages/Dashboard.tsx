import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOverview, fetchTopPages, fetchInsights } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, MousePointerClick, Clock, Activity, ArrowUpRight, ArrowDownRight, LayoutDashboard, Monitor, Sparkles, Lightbulb } from 'lucide-react';
import RecentActivityFeed from '../components/ui/RecentActivityFeed';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

export default function Dashboard() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: fetchOverview,
    refetchInterval: 30000,
  });

  const { data: topPages } = useQuery({
    queryKey: ['topPages'],
    queryFn: () => fetchTopPages(5),
  });

  const { data: insights } = useQuery({
    queryKey: ['insights'],
    queryFn: fetchInsights,
  });

  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    socket.on('active_users', (count: number) => {
      setActiveUsers(count);
    });
    return () => {
      socket.off('active_users');
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200/50 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse border border-gray-100 rounded-2xl bg-white shadow-sm">
              <CardHeader className="h-10 bg-gray-50/50 rounded-t-2xl"></CardHeader>
              <CardContent className="h-20"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasData = overview && overview.totalEvents > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <Activity size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No analytics data available yet.</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Visit the demo site and interact with the application to generate events. The dashboard will automatically update once data is received.
        </p>
        <a 
          href="http://localhost:5173/demo.html" 
          target="_blank"
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
        >
          Open Demo Site <ArrowUpRight className="ml-2 w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Platform Overview</h2>
          <p className="text-gray-500 mt-1">Real-time metrics and historical trends.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 tracking-tight">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 font-mono tracking-tighter">{overview?.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1"><ArrowUpRight className="w-3 h-3 mr-0.5"/> 12%</span> vs last week
            </p>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 tracking-tight">Total Events</CardTitle>
            <MousePointerClick className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 font-mono tracking-tighter">{overview?.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1"><ArrowUpRight className="w-3 h-3 mr-0.5"/> 8%</span> vs last week
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 tracking-tight">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 font-mono tracking-tighter">{Math.round(overview?.avgSessionDuration / 1000)}s</div>
            <p className="text-xs text-gray-400 mt-1 font-medium">Per session average</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 tracking-tight">Bounce Rate</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 font-mono tracking-tighter">{overview?.bounceRate}%</div>
            <p className="text-xs text-gray-400 mt-1 flex items-center font-medium">
              <span className="text-red-500 flex items-center mr-1"><ArrowDownRight className="w-3 h-3 mr-0.5"/> 2%</span> vs last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 tracking-tight">Events Trend</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview?.trendData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 11, fill: '#9ca3af', fontFamily: 'monospace'}} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis tick={{fontSize: 11, fill: '#9ca3af', fontFamily: 'monospace'}} axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontFamily: 'monospace', fontWeight: 600, color: '#111827' }}
                  labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="events" stroke="#111827" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" activeDot={{r: 6, strokeWidth: 0}} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sidebar Activity Feed */}
        <div className="col-span-1 h-[400px]">
          <RecentActivityFeed />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Insights */}
        <Card className="col-span-1 border border-indigo-100/80 bg-indigo-50/30 shadow-[0_2px_10px_-3px_rgba(99,102,241,0.05)] rounded-2xl">
          <CardHeader className="border-b border-indigo-100/50 pb-4">
            <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center tracking-tight">
              <Lightbulb className="w-5 h-5 mr-2 text-indigo-500" />
              Analytics Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {insights?.map((insight: string, idx: number) => (
              <div key={idx} className="flex gap-3 bg-white p-4 rounded-xl border border-indigo-100/60 shadow-sm transition-transform hover:-translate-y-0.5">
                <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-gray-700 leading-relaxed">{insight}</p>
              </div>
            ))}
            {!insights?.length && <p className="text-sm text-gray-500 text-center font-medium">Gathering data...</p>}
          </CardContent>
        </Card>

        {/* Why This Matters (WOW Factor) */}
        <Card className="col-span-1 lg:col-span-2 border border-gray-800 shadow-xl bg-[#0a0a0a] text-white rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <CardHeader className="border-b border-gray-800/80 pb-4 relative z-10">
            <CardTitle className="text-lg font-semibold flex items-center tracking-tight text-gray-100">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
              Engineering Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-indigo-400 text-[10px] uppercase tracking-widest font-bold mb-2 font-mono">Business Value</p>
                <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Identify Revenue Leaks</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  By tracking the exact drop-off points in your funnel, you can optimize the checkout flow. A 5% increase in retention at the cart stage yields a compounding increase in total revenue.
                </p>
              </div>
              <div>
                <p className="text-teal-400 text-[10px] uppercase tracking-widest font-bold mb-2 font-mono">UX Optimization</p>
                <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Data-Driven Design</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Heatmaps reveal that users often click non-interactive elements. With InsightFlow, you can promote these areas to CTAs, instantly resolving user friction.
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-mono tracking-tight">InsightFlow V3.0</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono tracking-widest text-gray-300 uppercase">React 19</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono tracking-widest text-gray-300 uppercase">MongoDB</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono tracking-widest text-gray-300 uppercase">Sockets</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Widget */}
        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center tracking-tight">
              <LayoutDashboard className="w-4 h-4 mr-2 text-indigo-500" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              {topPages?.map((page: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center overflow-hidden">
                    <div className="w-6 text-center text-xs font-mono text-gray-400">{idx + 1}</div>
                    <div className="ml-3 truncate font-medium text-sm text-gray-700 max-w-[200px]">{page.pageUrl}</div>
                  </div>
                  <div className="text-xs font-mono font-semibold text-gray-600 bg-gray-100/80 px-2.5 py-1 rounded-md border border-gray-200/50">
                    {page.views.toLocaleString()}
                  </div>
                </div>
              ))}
              {!topPages?.length && (
                <div className="text-sm text-gray-500 text-center py-4 font-medium">No page views recorded yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sessions by Day Chart */}
        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center tracking-tight">
              <Monitor className="w-4 h-4 mr-2 text-blue-500" />
              Daily Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.trendData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={32}>
                <XAxis dataKey="date" tick={{fontSize: 11, fill: '#9ca3af', fontFamily: 'monospace'}} axisLine={false} tickLine={false} tickMargin={10}/>
                <YAxis tick={{fontSize: 11, fill: '#9ca3af', fontFamily: 'monospace'}} axisLine={false} tickLine={false} tickMargin={10}/>
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} itemStyle={{fontFamily: 'monospace', color: '#111827', fontWeight: 600}} labelStyle={{color: '#6b7280', fontSize: '12px', marginBottom: '4px'}} />
                <Bar dataKey="sessions" fill="#111827" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
