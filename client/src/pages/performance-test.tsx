import { ImageTest } from '@/components/ui/image-test';

export default function PerformanceTestPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Performance Optimization Test</h1>
        <ImageTest />
      </div>
    </div>
  );
}
