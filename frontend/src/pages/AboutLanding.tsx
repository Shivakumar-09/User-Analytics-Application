import { ArrowRight, BarChart3, Users, Zap, LayoutDashboard, Search, Database } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';

export default function AboutLanding() {
  return (
    <div className="bg-white min-h-screen rounded-xl border border-gray-200 overflow-hidden shadow-sm -mt-2">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden py-24 px-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-1.5 mb-8 border border-white/20">
            <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
            <span className="text-sm font-medium">InsightFlow V3.0 is now live</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Understand your users.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Build better products.
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            InsightFlow is a powerful, self-hosted analytics platform inspired by industry leaders like Mixpanel and PostHog. Track events, visualize funnels, and generate actionable insights in real-time.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold flex items-center hover:bg-gray-100 transition-colors">
              View Dashboard <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/architecture" className="bg-transparent border border-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/5 transition-colors">
              Read Documentation
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Engineering Excellence</h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Built from the ground up with a robust modern technology stack designed for scale and developer experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Server-Side Aggregations</h3>
              <p className="text-gray-500 leading-relaxed">
                Complex analytical calculations are pushed down to the MongoDB database layer using powerful native aggregation pipelines, keeping the Node.js event loop completely unblocked.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time WebSockets</h3>
              <p className="text-gray-500 leading-relaxed">
                Leverages Socket.io to push live active user counts and real-time event streams directly to the React dashboard without the need for heavy client-side polling.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Heatmaps</h3>
              <p className="text-gray-500 leading-relaxed">
                Utilizes the HTML5 Canvas API with 'multiply' composite blending to render thousands of click coordinates efficiently over dynamic wireframe representations of pages.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Funnel Analysis</h3>
              <p className="text-gray-500 leading-relaxed">
                Automatically identifies user drop-off points across the core application journey, providing actionable conversion metrics to improve product UX.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Session Journeys</h3>
              <p className="text-gray-500 leading-relaxed">
                Dive deep into specific user sessions. View the exact chronological sequence of page views and clicks via a beautiful Framer Motion animated timeline.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Resilient SDK</h3>
              <p className="text-gray-500 leading-relaxed">
                The standalone Vanilla JS tracking SDK automatically handles offline queuing via localStorage and implements an exponential backoff retry mechanism.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stack Section */}
      <div className="bg-gray-50 py-24 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">Built with modern, production-ready technologies</h2>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <span className="text-2xl font-bold text-gray-800">React 19</span>
            <span className="text-2xl font-bold text-gray-800">TypeScript</span>
            <span className="text-2xl font-bold text-gray-800">Node.js</span>
            <span className="text-2xl font-bold text-gray-800">Express</span>
            <span className="text-2xl font-bold text-gray-800">MongoDB Atlas</span>
            <span className="text-2xl font-bold text-gray-800">Tailwind CSS</span>
            <span className="text-2xl font-bold text-gray-800">Socket.io</span>
          </div>
        </div>
      </div>
    </div>
  );
}
