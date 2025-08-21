import { useEffect, useRef } from 'react';
import { Detection } from '@/types/detection';

interface DetectionOverlayProps {
  detections: Detection[];
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  detections,
  videoRef,
  canvasRef
}) => {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw detection boxes
    detections.forEach((detection) => {
      const { xmin, ymin, xmax, ymax, label, score } = detection;
      
      // Convert normalized coordinates to pixel coordinates
      const x = xmin * canvas.width;
      const y = ymin * canvas.height;
      const width = (xmax - xmin) * canvas.width;
      const height = (ymax - ymin) * canvas.height;

      // Box styling
      ctx.strokeStyle = 'var(--detection-box)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';

      // Draw bounding box
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);

      // Label background
      const labelText = `${label} ${(score * 100).toFixed(1)}%`;
      ctx.font = '14px Inter, system-ui, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const labelWidth = textMetrics.width + 12;
      const labelHeight = 24;

      // Label background
      ctx.fillStyle = 'var(--detection-label)';
      ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);

      // Label text
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, x + 6, y - labelHeight / 2);
    });
  }, [detections, videoRef]);

  return (
    <canvas
      ref={overlayCanvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  );
};