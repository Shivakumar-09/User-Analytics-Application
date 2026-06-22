import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MousePointerClick, Filter, Server, Sparkles } from 'lucide-react';
import { cn } from '../ui/card';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Sessions', path: '/sessions', icon: Users },
    { name: 'Heatmap', path: '/heatmap', icon: MousePointerClick },
    { name: 'Funnels', path: '/funnels', icon: Filter },
    { name: 'Architecture', path: '/architecture', icon: Server },
  ];

  return (
    <div className="flex h-screen bg-muted/20">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center">
            InsightFlow <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">v3.0</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">CausalFunnel Edition</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/sessions' && location.pathname.startsWith('/sessions/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  isActive ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                )}
              >
                <Icon size={20} className={isActive ? "text-primary-foreground" : "text-gray-400"} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
           <Link to="/about" className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground font-medium w-full">
             <Sparkles size={20} className="text-purple-500" />
             <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Why InsightFlow?</span>
           </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8 bg-[#f9fafb]">
        <Outlet />
      </main>
    </div>
  );
}
