import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type DetectionSnapshot, type Video } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, ZAxis } from "recharts";
import { TrendingUp, Users, Clock, Activity, Download, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function HeatmapChart({ videoId }: { videoId?: string }) {
  const { data: heatmapData } = useQuery<Array<{ x: number, y: number, value: number }>>({
    queryKey: ['/api/analytics/heatmap', videoId],
    enabled: !!videoId,
  });

  if (!videoId) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Select a camera to view heatmap</div>;
  if (!heatmapData || heatmapData.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No heatmap data available</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="X" hide />
        <YAxis type="number" dataKey="y" name="Y" hide reversed />
        <ZAxis type="number" dataKey="value" range={[50, 400]} name="Density" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Traffic" data={heatmapData} fill="#ef4444" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function ForecastChart({ snapshots, serviceRate }: { snapshots?: DetectionSnapshot[], serviceRate: number }) {
  const forecastData = useMemo(() => {
    if (!snapshots || snapshots.length < 10) return [];

    // Simple linear regression or moving average for demonstration
    // In a real app, this would use more sophisticated time-series analysis
    const recentData = snapshots.slice(0, 20).reverse();
    const lastTime = new Date(recentData[recentData.length - 1].timestamp).getTime();

    // Generate next 3 hours (6 points if 30 min intervals, but here we just show trend)
    const forecast = [];
    let currentTrend = 0;

    // Calculate simple trend
    if (recentData.length >= 2) {
      const first = recentData[0].totalPeople;
      const last = recentData[recentData.length - 1].totalPeople;
      currentTrend = (last - first) / recentData.length;
    }

    let lastValue = recentData[recentData.length - 1].totalPeople;

    for (let i = 1; i <= 6; i++) {
      const nextTime = new Date(lastTime + i * 30 * 60 * 1000); // +30 mins
      // Apply trend with some dampening and randomness for realism
      lastValue = Math.max(0, lastValue + currentTrend * 0.8 + (Math.random() - 0.5));

      forecast.push({
        time: nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        predictedWait: Math.round(lastValue * serviceRate),
        confidence: Math.max(20, 90 - i * 10) // Confidence drops over time
      });
    }

    return forecast;
  }, [snapshots, serviceRate]);

  if (!snapshots || snapshots.length < 10) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Insufficient data for forecast</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={forecastData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="time" stroke="hsl(var(--foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--foreground))" fontSize={12} label={{ value: 'Predicted Wait (min)', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Line type="monotone" dataKey="predictedWait" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Wait Time" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function Analytics() {
  const [serviceRate, setServiceRate] = useState(2); // Minutes per person
  const [selectedVideoId, setSelectedVideoId] = useState<string | undefined>(undefined);
  const [wsConnected, setWsConnected] = useState(false);

  const { data: videos } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  // Default to the most recently uploaded video when list loads
  useEffect(() => {
    if (!selectedVideoId && videos && videos.length > 0) {
      setSelectedVideoId(videos[0].id);
    }
  }, [videos, selectedVideoId]);

  const { data: snapshots } = useQuery<DetectionSnapshot[]>({
    queryKey: ['/api/detection-snapshots', selectedVideoId],
    enabled: !!selectedVideoId,
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'detection_update') {
        // Invalidate query to refetch data if it's for the selected video
        if (!selectedVideoId || message.data?.videoId === selectedVideoId) {
          queryClient.invalidateQueries({ queryKey: ['/api/detection-snapshots', selectedVideoId] });
          queryClient.invalidateQueries({ queryKey: ['/api/analytics/heatmap', selectedVideoId] });
        }
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    return () => ws.close();
  }, [selectedVideoId]);

  const chartData = snapshots?.slice(0, 20).reverse().map((snapshot, index) => {
    const time = new Date(snapshot.timestamp);
    const waitTime = snapshot.totalPeople * serviceRate;
    return {
      time: time.toLocaleTimeString(),
      total: snapshot.totalPeople,
      waitTime,
      ...snapshot.queueCounts.reduce((acc, count, i) => ({
        ...acc,
        [`Queue ${i + 1}`]: count,
        [`Queue ${i + 1} Wait`]: count * serviceRate
      }), {})
    };
  }) || [];

  // Calculate Busy Hours
  const busyHoursData = useMemo(() => {
    if (!snapshots) return [];

    const hoursMap = new Map<number, { total: number; count: number }>();

    snapshots.forEach(s => {
      const hour = new Date(s.timestamp).getHours();
      const current = hoursMap.get(hour) || { total: 0, count: 0 };
      hoursMap.set(hour, {
        total: current.total + s.totalPeople,
        count: current.count + 1
      });
    });

    return Array.from(hoursMap.entries())
      .map(([hour, data]) => ({
        hour: `${hour}:00`,
        avgPeople: Math.round(data.total / data.count)
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [snapshots]);

  const avgPeople = snapshots?.length
    ? Math.round(snapshots.reduce((sum, s) => sum + s.totalPeople, 0) / snapshots.length)
    : 0;

  const peakPeople = snapshots?.length
    ? Math.max(...snapshots.map(s => s.totalPeople))
    : 0;

  const totalSnapshots = snapshots?.length || 0;

  const currentWaitTime = snapshots?.[0]
    ? snapshots[0].totalPeople * serviceRate
    : 0;

  const { toast } = useToast();

  const handleExport = async () => {
    if (!selectedVideoId) return;

    try {
      const response = await fetch(`/api/analytics/export/${selectedVideoId}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedVideoId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Analytics report has been downloaded.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not download the analytics report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">Analytics</h1>
            <Badge variant={wsConnected ? "default" : "destructive"} className="animate-pulse">
              {wsConnected ? "Live" : "Offline"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Historical queue trends and performance insights
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!selectedVideoId}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          {videos && videos.length > 0 && (
            <Card className="w-full md:w-auto min-w-[300px]">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Select Camera</CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <Select value={selectedVideoId} onValueChange={setSelectedVideoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a video source" />
                  </SelectTrigger>
                  <SelectContent>
                    {videos.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.filename}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          <Card className="w-full md:w-auto min-w-[300px]">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Service Time Settings</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-2">
                    Avg Service Time: <span className="font-bold text-foreground">{serviceRate} min/person</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={serviceRate}
                    onChange={(e) => setServiceRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average People</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-avg-people">{avgPeople}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all queues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">~{currentWaitTime} min</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on current load
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Count</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-peak-people">{peakPeople}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum observed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-snapshots">{totalSnapshots}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Detection snapshots
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total People Over Time</CardTitle>
            <CardDescription>Combined queue occupancy trends</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No historical data available yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Busy Hours</CardTitle>
            <CardDescription>Average traffic by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            {busyHoursData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={busyHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="avgPeople" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available for hourly analysis
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Heatmap</CardTitle>
            <CardDescription>High-traffic areas based on detection density</CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapChart videoId={selectedVideoId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wait Time Forecast</CardTitle>
            <CardDescription>Predicted wait times for the next 3 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ForecastChart snapshots={snapshots} serviceRate={serviceRate} />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Estimated Wait Time Trends</CardTitle>
          <CardDescription>Projected wait times based on queue length and service rate</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Queue 1 Wait" name="Queue 1" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Queue 2 Wait" name="Queue 2" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Queue 3 Wait" name="Queue 3" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Queue 4 Wait" name="Queue 4" stroke="#ec4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Queue 5 Wait" name="Queue 5" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No historical data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
