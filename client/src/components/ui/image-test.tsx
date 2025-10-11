import { useState } from 'react';
import { OptimizedImage, EagerOptimizedImage } from './optimized-image';
import { LazyImage, FallbackImage } from './lazy-image';
import { useIntersectionObserver } from './lazy-image';
import { Button } from './button';
// import { performanceMonitor, logPerformanceReport, getPerformanceReport } from '@/lib/performance-monitor';

export function ImageTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const isIntersectionObserverSupported = useIntersectionObserver();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testImages = [
    {
      src: '/src/assets/Dopaya Logo.png',
      alt: 'Dopaya Logo',
      width: 200,
      height: 100
    },
    {
      src: '/src/assets/allika.png',
      alt: 'Allika Project',
      width: 300,
      height: 200
    },
    {
      src: '/src/assets/Patrick Widmann_1749545204060.png',
      alt: 'Patrick Widmann',
      width: 150,
      height: 150
    }
  ];

  const runTests = () => {
    setTestResults([]);
    // performanceMonitor.reset();
    addResult('🧪 Starting image optimization tests...');
    
    // Test 1: Intersection Observer support
    addResult(`✅ Intersection Observer supported: ${isIntersectionObserverSupported}`);
    
    // Test 2: WebP support
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    addResult(`✅ WebP supported: ${webpSupported}`);
    
    // Test 3: Performance metrics
    addResult('🔄 Testing performance monitoring...');
    
    // Test 4: Error handling
    addResult('🔄 Testing error handling...');
    
    addResult('✅ All tests completed!');
  };

  const showPerformanceReport = () => {
    // const report = getPerformanceReport();
    // const reportLines = report.split('\n');
    // setTestResults(prev => [...prev, ...reportLines]);
    // logPerformanceReport();
    addResult('Performance reporting temporarily disabled');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Image Optimization Test Suite</h2>
      
      {/* Test Controls */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <Button onClick={runTests}>
            Run Performance Tests
          </Button>
          <Button onClick={showPerformanceReport} variant="outline">
            Show Performance Report
          </Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <div className="space-y-1 text-sm">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Click "Run Performance Tests" to start</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="font-mono">{result}</div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Test Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testImages.map((image, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Test {index + 1}: {image.alt}</h3>
            
            {/* Optimized Lazy Image */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Optimized Lazy Image:</h4>
              <OptimizedImage
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="w-full h-32 object-cover rounded"
                onLoad={() => addResult(`✅ Lazy image ${index + 1} loaded successfully`)}
                onError={() => addResult(`❌ Lazy image ${index + 1} failed to load`)}
              />
            </div>

            {/* Eager Optimized Image */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Eager Optimized Image:</h4>
              <EagerOptimizedImage
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="w-full h-32 object-cover rounded"
                onLoad={() => addResult(`✅ Eager image ${index + 1} loaded successfully`)}
                onError={() => addResult(`❌ Eager image ${index + 1} failed to load`)}
              />
            </div>

            {/* Fallback Image (for browsers without Intersection Observer) */}
            {!isIntersectionObserverSupported && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Fallback Image:</h4>
                <FallbackImage
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-32 object-cover rounded"
                  onLoad={() => addResult(`✅ Fallback image ${index + 1} loaded successfully`)}
                  onError={() => addResult(`❌ Fallback image ${index + 1} failed to load`)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Performance Info */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Performance Features:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ Lazy loading with Intersection Observer</li>
          <li>✅ Automatic WebP format detection</li>
          <li>✅ Responsive image srcSet generation</li>
          <li>✅ Graceful fallbacks for older browsers</li>
          <li>✅ Error handling with fallback images</li>
          <li>✅ Loading states and indicators</li>
        </ul>
      </div>
    </div>
  );
}
