import { useState, useCallback, useRef, useEffect } from 'react';
import { Detection, DetectionMode } from '@/types/detection';

export const useObjectDetection = (mode: DetectionMode) => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize detection worker based on mode
  useEffect(() => {
    if (mode === 'wasm') {
      // Initialize WASM worker for on-device detection
      workerRef.current = new Worker('/src/workers/detectionWorker.js');
      workerRef.current.onmessage = (event) => {
        const { detections: newDetections, processingTime } = event.data;
        setDetections(newDetections);
        console.log(`WASM detection completed in ${processingTime}ms`);
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [mode]);

  const processFrame = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!videoElement || !isProcessing) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize for efficient processing
    canvas.width = 320;
    canvas.height = 240;
    
    // Draw current frame
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (mode === 'wasm' && workerRef.current) {
      // Send frame to WASM worker
      workerRef.current.postMessage({
        imageData: imageData.data,
        width: canvas.width,
        height: canvas.height,
        timestamp: Date.now()
      });
    } else if (mode === 'server') {
      // Send frame to server for inference
      try {
        const blob = await new Promise<Blob>(resolve => 
          canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.8)
        );
        
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('timestamp', Date.now().toString());

        const response = await fetch('/api/detect', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          setDetections(result.detections || []);
        }
      } catch (error) {
        console.error('Server detection failed:', error);
      }
    }
  }, [mode, isProcessing]);

  const startDetection = useCallback(async (stream: MediaStream | null) => {
    if (!stream) return;

    streamRef.current = stream;
    setIsProcessing(true);

    // Create video element for frame processing
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;

    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
    });

    // Process frames at 10-15 FPS for efficiency
    intervalRef.current = setInterval(() => {
      processFrame(video);
    }, 1000 / 15);

    console.log(`Object detection started in ${mode} mode`);
  }, [mode, processFrame]);

  const stopDetection = useCallback(() => {
    setIsProcessing(false);
    setDetections([]);
    streamRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    console.log('Object detection stopped');
  }, []);

  // Mock detection data for demo purposes
  useEffect(() => {
    if (isProcessing && detections.length === 0) {
      // Generate mock detections to demonstrate the UI
      const mockDetections: Detection[] = [
        {
          label: 'person',
          score: 0.93,
          xmin: 0.12,
          ymin: 0.08,
          xmax: 0.34,
          ymax: 0.67,
          frame_id: Date.now(),
          capture_ts: Date.now(),
          recv_ts: Date.now() + 10,
          inference_ts: Date.now() + 25
        },
        {
          label: 'phone',
          score: 0.87,
          xmin: 0.45,
          ymin: 0.23,
          xmax: 0.62,
          ymax: 0.41,
          frame_id: Date.now() + 1,
          capture_ts: Date.now(),
          recv_ts: Date.now() + 8,
          inference_ts: Date.now() + 20
        }
      ];

      // Simulate detection updates
      const timeout = setTimeout(() => {
        setDetections(mockDetections);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isProcessing, detections.length]);

  return {
    detections,
    isProcessing,
    startDetection,
    stopDetection
  };
};