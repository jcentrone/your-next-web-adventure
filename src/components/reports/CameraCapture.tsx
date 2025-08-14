import React, { useState, useRef, useCallback } from "react";
import { Camera, SwitchCamera, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      console.log("Starting camera with facingMode:", facingMode);
      setError(null);
      if (stream) {
        console.log("Stopping existing stream");
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      console.log("Requesting camera with constraints:", constraints);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera stream obtained:", newStream);
      
      setStream(newStream);
      if (videoRef.current) {
        console.log("Assigning stream to video element");
        videoRef.current.srcObject = newStream;
        
        // Wait for the video to load
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, playing video");
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setError("Camera access denied or not available");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const takePicture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onClose();
  }, [onClose, stopCamera]);

  const confirmCapture = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        handleClose();
      }
    }, "image/jpeg", 0.8);
  }, [capturedImage, onCapture, handleClose]);

  const retakePicture = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  }, []);


  React.useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
  }, [isOpen, capturedImage, facingMode]);

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Take Photo</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Camera className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={startCamera}>Try Again</Button>
            </div>
          ) : capturedImage ? (
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
              <div className="flex gap-2 mt-4 justify-center">
                <Button variant="outline" onClick={retakePicture}>
                  Retake
                </Button>
                <Button onClick={confirmCapture}>
                  <Check className="h-4 w-4 mr-2" />
                  Use Photo
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={switchCamera}
                  className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                >
                  <SwitchCamera className="h-4 w-4" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={takePicture}
                  className="rounded-full w-16 h-16 bg-white text-black hover:bg-gray-100"
                >
                  <Camera className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClose}
                  className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};