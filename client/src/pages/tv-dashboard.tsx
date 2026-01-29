import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type DetectionSnapshot, type Settings, type Video } from "@shared/schema";
import { Users, TrendingUp, TrendingDown, Clock, Maximize2, Minimize2 } from "lucide-react";
import { t, type Language } from "@/lib/translations";
import { playTextToSpeech } from "@/lib/tts";

const LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
};

const ANNOUNCEMENTS = {
    'en': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `Queue ${bestQueue} is the fastest with ${bestCount} ${bestCount === 1 ? 'person' : 'people'}. People waiting in queue ${worstQueue}, which has ${worstCount} ${worstCount === 1 ? 'person' : 'people'}, can move to queue ${bestQueue} for faster service.`,

    'hi': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `कतार ${bestQueue} सबसे तेज़ है जिसमें ${bestCount} लोग हैं। कतार ${worstQueue} में ${worstCount} लोग प्रतीक्षा कर रहे हैं, वे तेज़ सेवा के लिए कतार ${bestQueue} में जा सकते हैं।`,

    'ta': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `வரிசை ${bestQueue} மிக வேகமானது, ${bestCount} பேர் உள்ளனர். வரிசை ${worstQueue} இல் ${worstCount} பேர் காத்திருக்கிறார்கள், அவர்கள் விரைவான சேவைக்காக வரிசை ${bestQueue} க்கு செல்லலாம்.`,

    'te': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `క్యూ ${bestQueue} అత్యంత వేగవంతమైనది, ${bestCount} మంది ఉన్నారు. క్యూ ${worstQueue} లో ${worstCount} మంది వేచి ఉన్నారు, వారు వేగవంతమైన సేవ కోసం క్యూ ${bestQueue} కు వెళ్ళవచ్చు.`,

    'bn': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `সারি ${bestQueue} সবচেয়ে দ্রুত, ${bestCount} জন আছেন। সারি ${worstQueue} তে ${worstCount} জন অপেক্ষা করছেন, তারা দ্রুত সেবার জন্য সারি ${bestQueue} তে যেতে পারেন।`,

    'mr': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `रांग ${bestQueue} सर्वात जलद आहे, ${bestCount} लोक आहेत। रांग ${worstQueue} मध्ये ${worstCount} लोक वाट पाहत आहेत, ते जलद सेवेसाठी रांग ${bestQueue} मध्ये जाऊ शकतात।`,

    'gu': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `કતાર ${bestQueue} સૌથી ઝડપી છે, ${bestCount} લોકો છે. કતાર ${worstQueue} માં ${worstCount} લોકો રાહ જોઈ રહ્યા છે, તેઓ ઝડપી સેવા માટે કતાર ${bestQueue} પર જઈ શકે છે.`,

    'kn': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `ಸರತಿ ${bestQueue} ಅತ್ಯಂತ ವೇಗವಾಗಿದೆ, ${bestCount} ಜನರು ಇದ್ದಾರೆ. ಸರತಿ ${worstQueue} ನಲ್ಲಿ ${worstCount} ಜನರು ಕಾಯುತ್ತಿದ್ದಾರೆ, ಅವರು ವೇಗವಾದ ಸೇವೆಗಾಗಿ ಸರತಿ ${bestQueue} ಗೆ ಹೋಗಬಹುದು.`,

    'ml': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `ക്യൂ ${bestQueue} ഏറ്റവും വേഗതയുള്ളതാണ്, ${bestCount} പേർ ഉണ്ട്. ക്യൂ ${worstQueue} ൽ ${worstCount} പേർ കാത്തിരിക്കുന്നു, അവർക്ക് വേഗത്തിലുള്ള സേവനത്തിനായി ക്യൂ ${bestQueue} ലേക്ക് പോകാം.`,

    'pa': (bestQueue: number, worstQueue: number, bestCount: number, worstCount: number) =>
        `ਕਤਾਰ ${bestQueue} ਸਭ ਤੋਂ ਤੇਜ਼ ਹੈ, ${bestCount} ਲੋਕ ਹਨ। ਕਤਾਰ ${worstQueue} ਵਿੱਚ ${worstCount} ਲੋਕ ਉਡੀਕ ਕਰ ਰਹੇ ਹਨ, ਉਹ ਤੇਜ਼ ਸੇਵਾ ਲਈ ਕਤਾਰ ${bestQueue} ਵਿੱਚ ਜਾ ਸਕਦੇ ਹਨ।`,
};

export default function TvDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [wsConnected, setWsConnected] = useState(false);
    const [latestData, setLatestData] = useState<DetectionSnapshot | null>(null);
    const [selectedVideoId, setSelectedVideoId] = useState<string | undefined>(undefined);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: settings } = useQuery<Settings>({
        queryKey: ['/api/settings'],
    });

    const { data: videos } = useQuery<Video[]>({
        queryKey: ['/api/videos'],
    });

    // Check for active detection on mount
    useEffect(() => {
        const checkActiveDetection = async () => {
            try {
                const res = await apiRequest('GET', '/api/detection/status');
                const status = await res.json();
                if (status.running && status.activeVideoId) {
                    setSelectedVideoId(status.activeVideoId);
                }
            } catch (e) {
                console.error("Failed to check detection status", e);
            }
        };
        checkActiveDetection();
    }, []);

    // Default to the most recently uploaded video if no active detection
    useEffect(() => {
        if (!selectedVideoId && videos && videos.length > 0) {
            // Only set default if we haven't already set it from active detection
            // We can check this by seeing if selectedVideoId is still undefined
            // However, since checkActiveDetection is async, we might have a race condition.
            // But usually active detection check is fast. 
            // Better logic: If we have videos, and selectedVideoId is undefined, set it.
            // But if active detection comes in later, it will overwrite it (which is fine).
            setSelectedVideoId(videos[0].id);
        }
    }, [videos, selectedVideoId]);

    const { data: snapshot } = useQuery<DetectionSnapshot>({
        queryKey: ['/api/detection-snapshots/latest', selectedVideoId],
        enabled: !!selectedVideoId,
        refetchInterval: 2000, // Fallback polling
    });

    // WebSocket connection
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => setWsConnected(true);
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'detection_update') {
                if (!selectedVideoId || message.data?.videoId === selectedVideoId) {
                    setLatestData(message.data);
                }
            }
        };
        ws.onclose = () => setWsConnected(false);

        return () => ws.close();
    }, [selectedVideoId]);

    const displayData = latestData || snapshot;
    const selectedLanguage = settings?.language || 'en';

    // Use a ref to keep track of the latest data without triggering re-renders or effect re-runs
    const displayDataRef = useRef<DetectionSnapshot | null | undefined>(null);

    useEffect(() => {
        displayDataRef.current = displayData;
    }, [displayData]);

    // Auto-announcement logic
    useEffect(() => {
        if (!settings?.audioEnabled) return;

        const interval = setInterval(async () => {
            const currentData = displayDataRef.current;
            if (!currentData) return;

            try {
                const text = t(selectedLanguage as Language, 'announcement' as any, {
                    bestQueue: currentData.bestQueue,
                    worstQueue: currentData.worstQueue,
                    bestCount: currentData.queueCounts[currentData.bestQueue - 1],
                    worstCount: currentData.queueCounts[currentData.worstQueue - 1],
                });
                await playTextToSpeech(text, selectedLanguage);
            } catch (error) {
                console.error('Auto-announcement error:', error);
            }
        }, (settings.audioInterval || 30) * 1000);

        return () => clearInterval(interval);
    }, [settings?.audioEnabled, settings?.audioInterval, selectedLanguage]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const getAnnouncement = () => {
        if (!displayData) return '';
        const bestQueue = displayData.bestQueue;
        const worstQueue = displayData.worstQueue;
        const bestCount = displayData.queueCounts[bestQueue - 1];
        const worstCount = displayData.queueCounts[worstQueue - 1];

        const announcementFn = ANNOUNCEMENTS[selectedLanguage as keyof typeof ANNOUNCEMENTS] || ANNOUNCEMENTS['en'];
        return announcementFn(bestQueue, worstQueue, bestCount, worstCount);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Queue Status
                    </h1>
                    <Badge variant={wsConnected ? "default" : "destructive"} className="text-lg px-3 py-1">
                        {wsConnected ? "LIVE" : "OFFLINE"}
                    </Badge>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-4xl font-mono font-bold text-muted-foreground">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-muted rounded-full transition-colors">
                        {isFullscreen ? <Minimize2 className="w-8 h-8" /> : <Maximize2 className="w-8 h-8" />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Left Column - Video Feed (7 cols) */}
                <div className="col-span-7 flex flex-col gap-6">
                    <Card className="flex-1 overflow-hidden border-2 border-primary/20 shadow-xl">
                        <CardContent className="p-0 h-full bg-black flex items-center justify-center relative">
                            {displayData?.frameData ? (
                                <img
                                    src={displayData.frameData}
                                    alt="Live Detection"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-muted-foreground flex flex-col items-center gap-4">
                                    <div className="animate-pulse w-16 h-16 rounded-full bg-muted" />
                                    <p className="text-2xl">Waiting for video feed...</p>
                                </div>
                            )}

                            {/* Overlay Stats */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/10">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    <span className="text-xl font-bold">{displayData?.totalPeople || 0} People</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Stats (5 cols) */}
                <div className="col-span-5 flex flex-col gap-6">
                    {/* Best Queue Card - Highlighted */}
                    <Card className="bg-green-500/10 border-green-500/50 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                                <TrendingDown className="w-8 h-8" />
                                Fastest Queue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-4">
                                <span className="text-8xl font-bold text-green-600">
                                    {displayData?.bestQueue || '-'}
                                </span>
                                <div className="mb-4 text-2xl text-muted-foreground">
                                    with {displayData ? displayData.queueCounts[displayData.bestQueue - 1] : 0} people
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Queue List */}
                    <Card className="flex-1 flex flex-col shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Queue Details</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-4">
                            {displayData?.queueCounts.map((count, index) => {
                                const queueNum = index + 1;
                                const isBest = queueNum === displayData.bestQueue;
                                const isWorst = queueNum === displayData.worstQueue;

                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 ${isBest ? 'border-green-500 bg-green-500/5' :
                                            isWorst ? 'border-red-500 bg-red-500/5' :
                                                'border-border bg-card'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${isBest ? 'bg-green-500 text-white' :
                                                isWorst ? 'bg-red-500 text-white' :
                                                    'bg-primary text-primary-foreground'
                                                }`}>
                                                {queueNum}
                                            </div>
                                            <div>
                                                <p className="text-xl font-medium">Queue {queueNum}</p>
                                                <p className="text-muted-foreground">Est. wait: {count * 2} min</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold">{count}</span>
                                            <span className="text-sm text-muted-foreground ml-1">ppl</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer Announcement */}
            <div className="mt-6">
                <Card className="bg-primary/5 border-primary/20 shadow-lg">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Clock className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-primary mb-1">Recommendation</h3>
                            <p className="text-2xl font-medium leading-relaxed">
                                {getAnnouncement() || "Analyzing queue status..."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
