import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MousePointerClick, Filter, Server, Sparkles, Menu, X } from 'lucide-react';
import { cn } from '../ui/card';

export default function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Sessions', path: '/sessions', icon: Users },
    { name: 'Heatmap', path: '/heatmap', icon: MousePointerClick },
    { name: 'Funnels', path: '/funnels', icon: Filter },
    { name: 'Architecture', path: '/architecture', icon: Server },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b z-20 absolute top-0 w-full h-16">
        <h1 className="text-xl font-bold tracking-tight text-primary flex items-center">
          InsightFlow <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">v3.0</span>
        </h1>
        <button onClick={toggleMobileMenu} className="text-gray-500 hover:text-gray-900 focus:outline-none">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-20 w-64 border-r bg-card flex flex-col transform transition-transform duration-200 ease-in-out md:transform-none h-full",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 pb-2 hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center">
            InsightFlow <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">v3.0</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">CausalFunnel Edition</p>
        </div>
        
        {/* Spacer for mobile to account for the top bar */}
        <div className="h-16 md:hidden flex items-center px-6 border-b">
           <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">CausalFunnel Edition</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/sessions' && location.pathname.startsWith('/sessions/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
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
           <Link onClick={() => setIsMobileMenuOpen(false)} to="/about" className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground font-medium w-full">
             <Sparkles size={20} className="text-purple-500" />
             <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Why InsightFlow?</span>
           </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#f9fafb] w-full pt-16 md:pt-0">
        <div className="p-4 md:p-8 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
