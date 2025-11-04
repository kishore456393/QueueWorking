import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { type DetectionSnapshot, type Settings, type Video } from "@shared/schema";
import { Users, TrendingUp, TrendingDown, Clock, Volume2, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LANGUAGES = {
  'en': '🇬🇧 English',
  'hi': '🇮🇳 Hindi',
  'ta': '🇮🇳 Tamil',
  'te': '🇮🇳 Telugu',
  'bn': '🇮🇳 Bengali',
  'mr': '🇮🇳 Marathi',
  'gu': '🇮🇳 Gujarati',
  'kn': '🇮🇳 Kannada',
  'ml': '🇮🇳 Malayalam',
  'pa': '🇮🇳 Punjabi',
};

export default function Dashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [latestData, setLatestData] = useState<DetectionSnapshot | null>(null);

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const { data: videos } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  const activeVideoId = videos?.[0]?.id;

  const { data: snapshot, refetch } = useQuery<DetectionSnapshot>({
    queryKey: ['/api/detection-snapshots/latest', activeVideoId],
    enabled: !!activeVideoId,
    refetchInterval: autoRefresh ? (settings?.refreshInterval || 2) * 1000 : false,
  });

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'detection_update') {
        setLatestData(message.data);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    };

    return () => ws.close();
  }, []);

  const displayData = latestData || snapshot;

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings?.language || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const chartData = displayData?.queueCounts.map((count, index) => ({
    name: `Queue ${index + 1}`,
    people: count,
    fill: index + 1 === displayData.bestQueue ? '#10b981' : index + 1 === displayData.worstQueue ? '#ef4444' : '#6366f1'
  })) || [];

  const freshnessMinutes = displayData ? Math.floor((Date.now() - new Date(displayData.timestamp).getTime()) / 1000 / 60) : null;
  const isFresh = freshnessMinutes !== null && freshnessMinutes < 1;
  const isRecent = freshnessMinutes !== null && freshnessMinutes < 5;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Live Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Real-time queue analytics and recommendations
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={wsConnected ? "default" : "destructive"} data-testid="badge-websocket-status">
            {wsConnected ? '🟢 Live' : '🔴 Offline'}
          </Badge>
          {freshnessMinutes !== null && (
            <Badge variant={isFresh ? "default" : isRecent ? "secondary" : "destructive"} data-testid="badge-data-freshness">
              {isFresh ? 'Fresh' : isRecent ? `${freshnessMinutes}m ago` : 'Stale'}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-people">
              {displayData?.totalPeople || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {displayData?.totalQueues || 0} queues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Queue</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500" data-testid="text-best-queue">
              Queue {displayData?.bestQueue || '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayData ? displayData.queueCounts[displayData.bestQueue - 1] : 0} people waiting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busiest Queue</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500" data-testid="text-worst-queue">
              Queue {displayData?.worstQueue || '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayData ? displayData.queueCounts[displayData.worstQueue - 1] : 0} people waiting
            </p>
          </CardContent>
        </Card>
      </div>

      {displayData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
            <CardDescription>Current best queue for new customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-lg" data-testid="text-recommendation">{displayData.recommendation}</p>
              {settings?.audioEnabled && (
                <Button
                  onClick={() => handleSpeak(displayData.recommendation)}
                  variant="outline"
                  size="sm"
                  data-testid="button-speak-recommendation"
                  className="hover-elevate active-elevate-2"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Announce
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Queue Comparison</CardTitle>
            <CardDescription>Current people count per queue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="people" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Details</CardTitle>
            <CardDescription>Individual queue statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayData?.queueCounts.map((count, index) => {
              const queueNum = index + 1;
              const isBest = queueNum === displayData.bestQueue;
              const isWorst = queueNum === displayData.worstQueue;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isBest ? 'border-green-500 bg-green-500/10' :
                    isWorst ? 'border-red-500 bg-red-500/10' :
                    'border-border'
                  }`}
                  data-testid={`card-queue-${queueNum}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isBest ? 'bg-green-500 text-white' :
                      isWorst ? 'bg-red-500 text-white' :
                      'bg-primary text-primary-foreground'
                    }`}>
                      {queueNum}
                    </div>
                    <div>
                      <p className="font-medium">Queue {queueNum}</p>
                      <p className="text-sm text-muted-foreground">
                        Est. wait: {count * 2} min
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">people</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Settings</CardTitle>
          <CardDescription>Configure refresh rate, language, and audio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              data-testid="switch-auto-refresh"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue={settings?.language || 'en'}>
              <SelectTrigger className="w-48" data-testid="select-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <SelectItem key={code} value={code}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="w-full hover-elevate active-elevate-2"
            data-testid="button-refresh-now"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
