import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Server, Database, Monitor, FileCode2 } from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Session Replay Architecture</h2>
        <p className="text-gray-500 mt-1">Technical specification for implementing Hotjar/Microsoft Clarity style DOM snapshotting and replay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6 text-center">
            <Monitor className="w-10 h-10 mx-auto text-blue-600 mb-4" />
            <h3 className="font-semibold text-gray-900">1. Client SDK</h3>
            <p className="text-xs text-gray-500 mt-2">rrweb or custom DOM observer records HTML mutations, mouse movements, and scroll events into a compressed JSON stream.</p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-6 text-center">
            <Server className="w-10 h-10 mx-auto text-purple-600 mb-4" />
            <h3 className="font-semibold text-gray-900">2. Ingestion API</h3>
            <p className="text-xs text-gray-500 mt-2">Node.js microservice receives batched payloads every 5s. Validates, decompresses, and queues via Apache Kafka or RabbitMQ.</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6 text-center">
            <Database className="w-10 h-10 mx-auto text-green-600 mb-4" />
            <h3 className="font-semibold text-gray-900">3. Storage Layer</h3>
            <p className="text-xs text-gray-500 mt-2">MongoDB stores metadata (session ID, duration). Raw DOM event JSON streams are stored in AWS S3 for cost-effective scaling.</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6 text-center">
            <FileCode2 className="w-10 h-10 mx-auto text-orange-600 mb-4" />
            <h3 className="font-semibold text-gray-900">4. Replay Engine</h3>
            <p className="text-xs text-gray-500 mt-2">React dashboard fetches the S3 JSON stream and renders it inside an isolated iframe, executing mutations to recreate the user's screen.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Data Flow Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 overflow-x-auto flex justify-center font-mono text-sm whitespace-pre">
{`
[Browser DOM] --> (MutationObserver) --> [JSON Event Batch]
                                                |
                                                v
                                        [POST /api/replay]
                                                |
                                                v
[React Player] <-- (Fetch JSON) <-- [AWS S3 / CloudFront]
      |
      v
[Isolated iframe] --> Rebuilds exact user experience over time.
`}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Implementation Considerations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Privacy & Masking</h4>
              <p className="text-sm text-gray-500 mt-1">All PII (Personally Identifiable Information) such as passwords, emails, and credit cards must be masked `<input type="password" />` directly on the client side before leaving the browser.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Performance Overhead</h4>
              <p className="text-sm text-gray-500 mt-1">Recording the DOM tree can degrade main thread performance. Use `requestIdleCallback` and Web Workers to compress JSON payloads.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Database Sizing (At Scale)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Storage Estimations</h4>
              <p className="text-sm text-gray-500 mt-1">A typical 5-minute session replay generates ~150KB of gzipped JSON. 1 Million sessions = 150GB of S3 storage.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Cost Optimization</h4>
              <p className="text-sm text-gray-500 mt-1">Implement a TTL (Time To Live) policy via AWS S3 Lifecycle rules to automatically delete session recordings after 30 days to prevent unbounded storage costs.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
