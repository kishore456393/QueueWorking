import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type DetectionSnapshot } from "@shared/schema";
import { Users, TrendingUp, Clock, RefreshCw } from "lucide-react";
import { t, type Language } from "@/lib/translations";

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

export default function MobileLiveDashboard() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: snapshot, refetch, isLoading, isError } = useQuery<DetectionSnapshot>({
    queryKey: ['/api/detection/latest'],
    refetchInterval: 2000, // Auto refresh every 2 seconds
    retry: 3,
  });

  useEffect(() => {
    if (snapshot) {
      setLastUpdate(new Date());
    }
  }, [snapshot]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Loading Live Data...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Connecting to detection system...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !snapshot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold mb-2">No Detection Data Available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The queue detection system is not currently running or no data is available yet.
            </p>
            <div className="space-y-2 text-left bg-white dark:bg-gray-800 p-4 rounded-lg text-sm">
              <p className="font-semibold">To start detection:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to Dashboard on your computer</li>
                <li>Select a video or camera feed</li>
                <li>Click "Start Detection"</li>
                <li>Wait a few seconds for data</li>
                <li>This page will auto-refresh</li>
              </ol>
            </div>
            <Button 
              onClick={() => refetch()} 
              className="mt-4 w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎯 Live Queue Monitor
          </h1>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
          >
            {Object.entries(LANGUAGES).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
          <span>•</span>
          <span>Updated: {formatTime(lastUpdate)}</span>
        </div>
      </div>

      {/* Total People Card */}
      <Card className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                {t(selectedLanguage as Language, 'totalPeople')}
              </p>
              <p className="text-4xl font-bold mt-2">{snapshot.totalPeople}</p>
              <p className="text-blue-100 text-sm mt-1">
                {t(selectedLanguage as Language, 'peopleInQueues', { count: snapshot.totalQueues })}
              </p>
            </div>
            <Users className="w-16 h-16 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      {/* Best Queue Recommendation */}
      <Card className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6" />
            <h3 className="font-bold text-lg">
              {t(selectedLanguage as Language, 'recommendation')}
            </h3>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                {t(selectedLanguage as Language, 'fastestQueue')}:
              </span>
              <Badge className="bg-white text-green-700 text-lg px-3 py-1">
                Queue {snapshot.bestQueue}
              </Badge>
            </div>
            <p className="text-sm text-green-50">
              {snapshot.queueCounts[snapshot.bestQueue - 1]} {t(selectedLanguage as Language, 'peopleWaiting')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Individual Queue Cards */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          {t(selectedLanguage as Language, 'allQueues')}
        </h3>
        
        {snapshot.queueCounts.map((count, index) => {
          const queueNum = index + 1;
          const isBest = queueNum === snapshot.bestQueue;
          const isWorst = queueNum === snapshot.worstQueue;
          
          return (
            <Card 
              key={index} 
              className={`${
                isBest ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20' : 
                isWorst ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20' : 
                'border-gray-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      isBest ? 'bg-green-500' : 
                      isWorst ? 'bg-red-500' : 
                      'bg-blue-500'
                    }`}>
                      {queueNum}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Queue {queueNum}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {count} {count === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {isBest && (
                      <Badge className="bg-green-500 text-white mb-1">
                        ⚡ Fastest
                      </Badge>
                    )}
                    {isWorst && (
                      <Badge className="bg-red-500 text-white mb-1">
                        🔴 Busiest
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>~{count * 2} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <Card className="mt-6 border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            💡 {snapshot.recommendation}
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>🎯 AI-Powered Queue Detection System</p>
        <p className="mt-1">Data refreshes every 2 seconds</p>
      </div>
    </div>
  );
}
