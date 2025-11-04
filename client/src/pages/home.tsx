import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Brain, BarChart3, Languages, Volume2, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            QueueGuidance
          </h1>
          <p className="text-2xl text-muted-foreground mb-2">
            AI-Powered Intelligent Queue Management System
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transform your queue management with cutting-edge AI technology.
            Upload videos, define zones, and get real-time intelligent insights.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/setup">
              <Button size="lg" data-testid="button-get-started" className="hover-elevate active-elevate-2">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" data-testid="button-view-dashboard" className="hover-elevate active-elevate-2">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover-elevate">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Upload & Process</CardTitle>
              <CardDescription>
                Upload queue videos and define custom zones using an intuitive
                point-and-click canvas interface. Support for multiple queue areas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <CardTitle>AI Detection</CardTitle>
              <CardDescription>
                Advanced AI-powered person detection with high accuracy.
                Real-time queue counting and analysis running in background.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Live Dashboard</CardTitle>
              <CardDescription>
                Real-time analytics with auto-refresh, interactive charts,
                and intelligent queue recommendations for optimal flow.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Multi-Language</CardTitle>
              <CardDescription>
                Support for 14+ languages including Hindi, Tamil, Telugu, Bengali,
                and more. Perfect for diverse environments.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Audio Announcements</CardTitle>
              <CardDescription>
                Automated voice announcements in multiple languages to guide
                customers to the fastest queue.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Real-Time Updates</CardTitle>
              <CardDescription>
                WebSocket-powered live updates ensure you always see the latest
                queue statistics without manual refresh.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Get started with QueueGuidance in three simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Setup & Process</h3>
                <p className="text-muted-foreground">
                  Upload your queue video, draw polygon zones around queues, and start AI detection
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Live Dashboard</h3>
                <p className="text-muted-foreground">
                  View real-time queue statistics, see which queue is fastest, and get recommendations
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Monitor & Optimize</h3>
                <p className="text-muted-foreground">
                  Track queue performance over time, identify bottlenecks, and improve customer experience
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/setup">
            <Button size="lg" data-testid="button-start-now" className="hover-elevate active-elevate-2">
              Start Now →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
