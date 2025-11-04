import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Video, type QueueZone } from "@shared/schema";
import { Upload, Edit3, Play, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Point = { x: number; y: number };
type Polygon = Point[];

export default function Setup() {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const colors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6',
    '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#a855f7'
  ];

  const { data: videos } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      const response = await fetch('/api/videos', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedVideo(data);
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Video uploaded successfully",
        description: "You can now draw queue zones",
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const saveZonesMutation = useMutation({
    mutationFn: async (zones: { videoId: string; polygons: Polygon[] }) => {
      const promises = zones.polygons.map((polygon, index) =>
        apiRequest('/api/queue-zones', 'POST', {
          videoId: zones.videoId,
          queueNumber: index + 1,
          polygonPoints: polygon,
        })
      );
      await Promise.all(promises);
      
      // Start detection after zones are saved
      return apiRequest(`/api/detection/start/${zones.videoId}`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Queue zones saved and detection started",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/queue-zones'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleUpload = () => {
    if (videoFile) {
      uploadMutation.mutate(videoFile);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentPolygon([...currentPolygon, { x, y }]);
  };

  const completePolygon = () => {
    if (currentPolygon.length >= 3) {
      setPolygons([...polygons, currentPolygon]);
      setCurrentPolygon([]);
      toast({
        title: `Queue ${polygons.length + 1} defined`,
        description: `Added polygon with ${currentPolygon.length} points`,
      });
    }
  };

  const undoLastPoint = () => {
    if (currentPolygon.length > 0) {
      setCurrentPolygon(currentPolygon.slice(0, -1));
    }
  };

  const clearLastPolygon = () => {
    if (polygons.length > 0) {
      setPolygons(polygons.slice(0, -1));
      toast({
        title: "Removed last queue",
        description: `${polygons.length - 1} queues remaining`,
      });
    }
  };

  const saveZones = () => {
    if (uploadedVideo && polygons.length > 0) {
      saveZonesMutation.mutate({
        videoId: uploadedVideo.id,
        polygons,
      });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      polygons.forEach((polygon, i) => {
        ctx.fillStyle = colors[i % colors.length] + '40';
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(polygon[0].x, polygon[0].y);
        polygon.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const centerX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
        const centerY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`Q${i + 1}`, centerX - 15, centerY + 8);
      });

      if (currentPolygon.length > 0) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(currentPolygon[0].x, currentPolygon[0].y);
        currentPolygon.forEach(point => {
          ctx.lineTo(point.x, point.y);
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const interval = setInterval(drawFrame, 100);
    return () => clearInterval(interval);
  }, [polygons, currentPolygon]);

  const progress = uploadedVideo ? (polygons.length > 0 ? 100 : 50) : videoFile ? 25 : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Setup & Process</h1>
        <p className="text-muted-foreground text-lg">
          Upload video, define queue zones, and start AI detection
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>Complete these steps to begin queue monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-4" data-testid="progress-setup" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {uploadedVideo ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
              <span className={uploadedVideo ? "text-foreground font-medium" : "text-muted-foreground"}>
                1. Upload Video
              </span>
            </div>
            <div className="flex items-center gap-3">
              {polygons.length > 0 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Edit3 className="w-5 h-5 text-muted-foreground" />}
              <span className={polygons.length > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>
                2. Draw Queue Zones
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">3. Start Detection</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Upload Video</CardTitle>
            <CardDescription>Upload a video file of your queue area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
                data-testid="input-video-file"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {videoFile ? videoFile.name : 'Click to select video file'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP4, AVI, MOV, MKV, WebM
                </p>
              </label>
            </div>
            <Button
              onClick={handleUpload}
              disabled={!videoFile || uploadMutation.isPending}
              className="w-full hover-elevate active-elevate-2"
              data-testid="button-upload-video"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Video'}
            </Button>
            {uploadedVideo && (
              <video
                ref={videoRef}
                src={`/uploads/${uploadedVideo.filename}`}
                className="w-full rounded-lg hidden"
                controls
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Draw Queue Zones</CardTitle>
            <CardDescription>Click on the video to define queue boundaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setIsDrawing(!isDrawing)}
                variant={isDrawing ? "default" : "outline"}
                disabled={!uploadedVideo}
                data-testid="button-toggle-drawing"
                className="hover-elevate active-elevate-2"
              >
                {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
              </Button>
              <Button
                onClick={completePolygon}
                disabled={currentPolygon.length < 3}
                variant="outline"
                data-testid="button-complete-polygon"
                className="hover-elevate active-elevate-2"
              >
                Complete Queue
              </Button>
              <Button
                onClick={undoLastPoint}
                disabled={currentPolygon.length === 0}
                variant="outline"
                data-testid="button-undo-point"
                className="hover-elevate active-elevate-2"
              >
                Undo Point
              </Button>
              <Button
                onClick={clearLastPolygon}
                disabled={polygons.length === 0}
                variant="outline"
                data-testid="button-clear-polygon"
                className="hover-elevate active-elevate-2"
              >
                Clear Last Queue
              </Button>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Click to add points to define queue boundary</p>
              <p>• Click "Complete Queue" when done (min 3 points)</p>
              <p>• Queues defined: {polygons.length}</p>
            </div>
            <Button
              onClick={saveZones}
              disabled={polygons.length === 0 || saveZonesMutation.isPending}
              className="w-full hover-elevate active-elevate-2"
              data-testid="button-save-zones"
            >
              {saveZonesMutation.isPending ? 'Saving...' : `Save ${polygons.length} Queue Zone${polygons.length !== 1 ? 's' : ''}`}
            </Button>
          </CardContent>
        </Card>
      </div>

      {uploadedVideo && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Video Canvas</CardTitle>
            <CardDescription>Click to draw queue zone polygons</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full rounded-lg border border-border cursor-crosshair"
              style={{ maxHeight: '600px' }}
              data-testid="canvas-polygon-draw"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
