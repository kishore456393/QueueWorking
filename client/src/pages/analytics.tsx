import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type DetectionSnapshot } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Users, Clock, Activity } from "lucide-react";

export default function Analytics() {
  const { data: snapshots } = useQuery<DetectionSnapshot[]>({
    queryKey: ['/api/detection-snapshots/default'],
  });

  const chartData = snapshots?.slice(0, 20).reverse().map((snapshot, index) => {
    const time = new Date(snapshot.timestamp);
    return {
      time: time.toLocaleTimeString(),
      total: snapshot.totalPeople,
      ...snapshot.queueCounts.reduce((acc, count, i) => ({
        ...acc,
        [`Queue ${i + 1}`]: count
      }), {})
    };
  }) || [];

  const avgPeople = snapshots?.length
    ? Math.round(snapshots.reduce((sum, s) => sum + s.totalPeople, 0) / snapshots.length)
    : 0;

  const peakPeople = snapshots?.length
    ? Math.max(...snapshots.map(s => s.totalPeople))
    : 0;

  const totalSnapshots = snapshots?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground text-lg">
          Historical queue trends and performance insights
        </p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time tracking
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Total People Over Time</CardTitle>
          <CardDescription>Combined queue occupancy trends</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
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
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No historical data available yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queue-by-Queue Trends</CardTitle>
          <CardDescription>Individual queue performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Queue 1" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Queue 2" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Queue 3" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="Queue 4" stroke="#ec4899" strokeWidth={2} />
                <Line type="monotone" dataKey="Queue 5" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No historical data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
