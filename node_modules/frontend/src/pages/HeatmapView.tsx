import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHeatmap, fetchTopPages } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RefreshCw, MousePointerClick, Target, Flame } from 'lucide-react';

export default function HeatmapView() {
  const [urlFilter, setUrlFilter] = useState<string>('');

  const { data: topPages } = useQuery({
    queryKey: ['topPagesHeatmap'],
    queryFn: () => fetchTopPages(10),
  });

  const { data: clicks, isLoading, refetch } = useQuery({
    queryKey: ['heatmap', urlFilter],
    queryFn: () => fetchHeatmap(urlFilter),
    enabled: !!urlFilter,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [topArea, setTopArea] = useState<{ x: number, y: number, density: number } | null>(null);

  useEffect(() => {
    if (!clicks || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'multiply';

    let maxDensity = 0;
    let maxPoint = null;
    
    const densityMap = new Map<string, number>();

    clicks.forEach((click: any) => {
      const { x, y } = click.coordinates || {};
      if (x === undefined || y === undefined) return;
      
      const blockX = Math.floor(x / 50) * 50;
      const blockY = Math.floor(y / 50) * 50;
      const key = `${blockX},${blockY}`;
      const currentDensity = (densityMap.get(key) || 0) + 1;
      densityMap.set(key, currentDensity);

      if (currentDensity > maxDensity) {
        maxDensity = currentDensity;
        maxPoint = { x: blockX + 25, y: blockY + 25, density: currentDensity };
      }
      
      const radius = 35; 
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    setTopArea(maxPoint);
  }, [clicks]);

  useEffect(() => {
    if (topPages && topPages.length > 0 && urlFilter === '') {
      setUrlFilter(topPages[0].pageUrl);
    }
  }, [topPages, urlFilter]);

  const renderWireframe = () => {
    const url = urlFilter.toLowerCase();
    
    if (url.includes('checkout')) {
      return (
        <div className="w-full h-full opacity-40 flex flex-col items-center pt-8 space-y-8">
          <div className="w-11/12 h-16 bg-gray-200 flex justify-between items-center px-8 rounded mb-4">
            <div className="w-32 h-6 bg-gray-300 rounded"></div>
            <div className="flex space-x-6">
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="w-3/4 flex space-x-8">
            <div className="flex-1 space-y-6">
              <div className="w-full h-8 bg-gray-300 rounded mb-4"></div>
              <div className="w-full h-12 bg-gray-200 rounded"></div>
              <div className="flex space-x-4">
                <div className="flex-1 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1 h-12 bg-gray-200 rounded"></div>
              </div>
              <div className="w-full h-12 bg-gray-200 rounded"></div>
              <div className="w-full h-16 bg-green-200 rounded mt-8"></div>
            </div>
            <div className="w-1/3 bg-gray-100 rounded-lg p-6 space-y-4 h-64 border border-gray-200">
              <div className="w-24 h-4 bg-gray-300 rounded mb-6"></div>
              <div className="flex justify-between"><div className="w-20 h-4 bg-gray-200 rounded"></div><div className="w-10 h-4 bg-gray-200 rounded"></div></div>
              <div className="flex justify-between"><div className="w-24 h-4 bg-gray-200 rounded"></div><div className="w-10 h-4 bg-gray-200 rounded"></div></div>
              <div className="w-full h-px bg-gray-300 my-4"></div>
              <div className="flex justify-between"><div className="w-16 h-6 bg-gray-300 rounded"></div><div className="w-16 h-6 bg-gray-300 rounded"></div></div>
            </div>
          </div>
        </div>
      );
    }
    
    if (url.includes('cart')) {
      return (
        <div className="w-full h-full opacity-40 flex flex-col items-center pt-8 space-y-8">
          <div className="w-11/12 h-16 bg-gray-200 flex justify-between items-center px-8 rounded mb-4">
            <div className="w-32 h-6 bg-gray-300 rounded"></div>
            <div className="flex space-x-6">
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="w-3/4 flex flex-col space-y-4">
             <div className="w-48 h-8 bg-gray-300 rounded mb-2"></div>
             {[1, 2].map(i => (
               <div key={i} className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center px-6 space-x-6">
                  <div className="w-16 h-16 bg-gray-300 rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="w-48 h-5 bg-gray-300 rounded"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-300 rounded"></div>
               </div>
             ))}
             <div className="w-full flex justify-end mt-8">
                <div className="w-64 h-16 bg-blue-200 rounded-lg"></div>
             </div>
          </div>
        </div>
      );
    }
    
    if (url.includes('products')) {
      return (
        <div className="w-full h-full opacity-40 flex flex-col items-center pt-8 space-y-8">
          <div className="w-11/12 h-16 bg-gray-200 flex justify-between items-center px-8 rounded mb-4">
            <div className="w-32 h-6 bg-gray-300 rounded"></div>
            <div className="flex space-x-6">
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="w-11/12 grid grid-cols-4 gap-6">
             {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
               <div key={i} className="h-64 bg-gray-100 rounded-lg border border-gray-200 flex flex-col p-4 space-y-3">
                  <div className="w-full h-32 bg-gray-300 rounded"></div>
                  <div className="w-3/4 h-5 bg-gray-300 rounded"></div>
                  <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                  <div className="w-full h-8 bg-blue-100 rounded mt-auto"></div>
               </div>
             ))}
          </div>
        </div>
      );
    }

    // Default (Home)
    return (
      <div className="w-full h-full opacity-40 flex flex-col items-center pt-8 space-y-12">
        <div className="w-11/12 h-16 bg-gray-200 flex justify-between items-center px-8 rounded">
          <div className="w-32 h-6 bg-gray-300 rounded"></div>
          <div className="flex space-x-6">
            <div className="w-16 h-4 bg-gray-300 rounded"></div>
            <div className="w-16 h-4 bg-gray-300 rounded"></div>
            <div className="w-16 h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="w-3/4 h-64 bg-gray-200 rounded-xl flex flex-col items-center justify-center space-y-6">
          <div className="w-1/2 h-10 bg-gray-300 rounded"></div>
          <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
          <div className="w-32 h-12 bg-blue-200 rounded-lg mt-4"></div>
        </div>
        <div className="flex space-x-8 w-11/12">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-80 bg-gray-200 rounded-xl flex flex-col p-6 space-y-4">
              <div className="w-full h-32 bg-gray-300 rounded-lg"></div>
              <div className="w-3/4 h-6 bg-gray-300 rounded"></div>
              <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
              <div className="mt-auto w-full h-10 bg-blue-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl mb-6">
        <CardHeader className="border-b border-gray-100/50 pb-4">
          <CardTitle className="text-sm font-semibold text-gray-900 flex justify-between items-center tracking-tight">
            <span className="flex items-center">
              <MousePointer2 className="w-4 h-4 mr-2 text-indigo-500" />
              Advanced Heatmap
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Filter by URL</span>
              <select 
                className="text-sm border border-gray-200/80 bg-white rounded-md px-3 py-1.5 font-medium text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow shadow-sm"
                value={urlFilter}
                onChange={(e) => setUrlFilter(e.target.value)}
              >
                {topPages?.map((p: any) => (
                  <option key={p.pageUrl} value={p.pageUrl}>{p.pageUrl}</option>
                ))}
                {!topPages?.length && <option value="">Loading pages...</option>}
              </select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-50/50 text-blue-600 rounded-xl"><MousePointerClick className="w-6 h-6"/></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest font-mono">Total Clicks</p>
              <h3 className="text-2xl font-bold text-gray-900 font-mono tracking-tighter mt-1">{clicks?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-orange-50/50 text-orange-600 rounded-xl"><Target className="w-6 h-6"/></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest font-mono">Top Click Area</p>
              <h3 className="text-xl font-bold text-gray-900 font-mono tracking-tighter mt-1 truncate">
                {topArea ? `x: ${topArea.x}, y: ${topArea.y}` : 'N/A'}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-red-50/50 text-red-600 rounded-xl"><Flame className="w-6 h-6"/></div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest font-mono mb-2">Heat Intensity</p>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-orange-100 via-orange-400 to-red-600"></div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-mono tracking-widest uppercase">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100/50">
          <CardTitle className="text-sm font-semibold text-gray-700 flex justify-between items-center tracking-tight">
            <span>Visual Density Map - {urlFilter}</span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 bg-gray-200/50 border border-gray-200 px-2 py-1 rounded-md">Desktop Viewport (1920x1080)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-gray-50/30">
          <div className="relative w-full overflow-x-auto custom-scrollbar flex justify-center p-4">
            <div className="relative bg-white shadow-md border border-gray-200 rounded-md overflow-hidden aspect-video w-full max-w-[1200px]" style={{ flexShrink: 0 }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Rendering Heatmap...</p>
                  </div>
                </div>
              )}
              <canvas 
                ref={canvasRef}
                width={1920}
                height={1080}
                className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
              />
              {renderWireframe()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
