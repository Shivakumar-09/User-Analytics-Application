import { useQuery } from '@tanstack/react-query';
import { fetchFunnels } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Filter, Users, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FunnelsView() {
  const { data: funnels, isLoading } = useQuery({
    queryKey: ['funnels'],
    queryFn: fetchFunnels,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="w-1/3 h-8 bg-gray-200/50 animate-pulse rounded-lg"></div>
        <div className="w-full h-96 bg-white shadow-sm animate-pulse rounded-2xl border border-gray-100/80"></div>
      </div>
    );
  }

  if (!funnels || funnels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Filter className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">No funnel data available</h2>
        <p className="text-gray-500 mt-2 max-w-sm">There is currently no session data spanning multiple steps to construct a funnel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">User Funnel Analytics</h2>
        <p className="text-gray-500 mt-1">Visualize how users progress through your core application flows and identify drop-off points.</p>
      </div>

      <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100/50">
          <CardTitle className="text-sm font-semibold text-gray-700 flex justify-between items-center tracking-tight">
            <span>Primary Checkout Funnel</span>
            <span className="text-xs font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Users size={14} /> Total Conversion: {funnels[funnels.length - 1].percentage}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            {funnels.map((step: any, index: number) => (
              <div key={step.step} className="relative">
                {/* Connector Line */}
                {index < funnels.length - 1 && (
                  <div className="absolute left-8 top-16 bottom-0 w-px bg-gray-200 z-0"></div>
                )}
                
                <div className="relative z-10 flex items-start gap-6 mb-8 group">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center flex-shrink-0 text-gray-900 font-bold group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                    <span className="text-[10px] font-mono uppercase tracking-widest mb-0.5 opacity-80">Step</span>
                    <span className="text-xl leading-none font-mono">{step.step}</span>
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-end mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{step.pageUrl}</h3>
                      <div className="text-right flex items-baseline gap-3">
                        <span className="text-xs font-mono font-medium text-gray-400">{step.count} users</span>
                        <span className="text-2xl font-bold text-gray-900 font-mono tracking-tighter">{step.percentage}%</span>
                      </div>
                    </div>
                    
                    <div className="h-4 w-full bg-gray-100/80 rounded-full overflow-hidden mb-2 border border-gray-200/50 inset-shadow-sm">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${step.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: index * 0.2 }}
                        className="h-full bg-gray-900 rounded-full relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      </motion.div>
                    </div>
                    
                    {index > 0 && step.dropoff > 0 && (
                      <div className="flex items-center text-xs text-red-500 font-medium bg-red-50/80 border border-red-100 w-max px-2.5 py-1.5 rounded-md mt-3">
                        <ArrowDownRight size={14} className="mr-1.5" />
                        Dropped off: <span className="font-mono mx-1">{step.dropoff}</span> users (<span className="font-mono mx-1">{Math.round((step.dropoff / funnels[index - 1].count) * 100)}%</span>)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] bg-white/50 backdrop-blur-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-900 tracking-tight">Funnel Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                <p className="text-sm text-gray-600 leading-relaxed">The <strong>/products</strong> page is successfully retaining <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800">{funnels && funnels.length > 1 ? funnels[1].percentage : 0}%</span> of homepage traffic.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                <p className="text-sm text-gray-600 leading-relaxed">The largest drop-off occurs between <strong>{funnels && funnels.length > 2 ? `${funnels[1].pageUrl}` : 'steps'}</strong> and <strong>{funnels && funnels.length > 2 ? `${funnels[2].pageUrl}` : 'steps'}</strong>, indicating potential friction in adding items to the cart.</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
