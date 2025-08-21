import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, Wifi, WifiOff, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Phone = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setError('');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      setStream(mediaStream);
      setIsStreaming(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      toast({
        title: "Camera Started",
        description: "Successfully connected to camera",
      });

      // Simulate WebRTC connection
      setTimeout(() => {
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Successfully connected to detection system",
        });
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsStreaming(false);
    setIsConnected(false);
    setError('');

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    toast({
      title: "Camera Stopped",
      description: "Camera stream has been stopped",
    });
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-gradient-surface p-4">
      {/* Header */}
      <header className="mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Phone Camera
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Stream your camera to the detection system
          </p>
        </div>
      </header>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-3 text-center bg-gradient-surface border-border">
          <div className="flex items-center justify-center gap-2 mb-1">
            {isStreaming ? (
              <Camera className="w-5 h-5 text-success" />
            ) : (
              <CameraOff className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Camera</span>
          </div>
          <Badge variant={isStreaming ? 'default' : 'secondary'}>
            {isStreaming ? 'Active' : 'Stopped'}
          </Badge>
        </Card>

        <Card className="p-3 text-center bg-gradient-surface border-border">
          <div className="flex items-center justify-center gap-2 mb-1">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-success" />
            ) : (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Connection</span>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Connected' : 'Waiting'}
          </Badge>
        </Card>
      </div>

      {/* Video Stream */}
      <Card className="mb-6 overflow-hidden bg-gradient-surface border-border">
        <div className="aspect-video bg-muted relative">
          {isStreaming ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <CameraOff className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium mb-2">Camera Stopped</p>
              <p className="text-sm text-center px-4">
                Tap "Start Camera" below to begin streaming
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 p-4 bg-destructive/10 border-destructive/20">
          <p className="text-destructive text-sm font-medium mb-1">Camera Error</p>
          <p className="text-destructive/80 text-sm">{error}</p>
        </Card>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {!isStreaming ? (
          <Button 
            onClick={startCamera}
            size="lg"
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Camera
          </Button>
        ) : (
          <Button 
            onClick={stopCamera}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            Stop Camera
          </Button>
        )}

        {/* Instructions */}
        <Card className="p-4 bg-muted">
          <h3 className="font-medium mb-2">Instructions:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Allow camera access when prompted</li>
            <li>• Point camera at objects to detect</li>
            <li>• Keep phone steady for best results</li>
            <li>• Ensure good lighting conditions</li>
          </ul>
        </Card>

        {/* Connection Info */}
        {isConnected && (
          <Card className="p-4 bg-success/10 border-success/20">
            <p className="text-success text-sm font-medium mb-1">
              ✅ Successfully Connected
            </p>
            <p className="text-success/80 text-sm">
              Your camera stream is being processed for object detection
            </p>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          WebRTC VLM Detection System
        </p>
      </footer>
    </div>
  );
};

export default Phone;