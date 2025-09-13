import React, {useMemo, useState} from "react";
import {useAuth} from "@/contexts/AuthContext";
import {useQuery} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Calendar, Navigation} from "lucide-react";
import {RouteOptimizationSettings} from "@/components/settings/RouteOptimizationSettings";
import * as googleCalendar from "@/integrations/googleCalendar";
import * as openAI from "@/integrations/openAI";
import {supabase} from "@/integrations/supabase/client";
import {useToast} from "@/components/ui/use-toast";

const Integrations: React.FC = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const [filterType, setFilterType] = useState<string>("all");
    const [openAiKey, setOpenAiKey] = useState("");

    const [optimizeRoute, setOptimizeRoute] = useState(
        () => localStorage.getItem("optimizeRoute") === "true"
    );

    const {data: googleConnected, refetch: refetchGoogle} = useQuery({
        queryKey: ["google-calendar-connected", user?.id],
        queryFn: () => googleCalendar.isConnected(user!.id),
        enabled: !!user,
    });

    const {data: openAiConnected, refetch: refetchOpenAi} = useQuery({
        queryKey: ["openai-connected", user?.id],
        queryFn: () => openAI.isConnected(user!.id),
        enabled: !!user,
    });

    // Fetch the stored API key to display masked version
    const {data: openAiKeyMasked} = useQuery({
        queryKey: ["openai-key-masked", user?.id],
        queryFn: async () => {
            if (!user?.id || !openAiConnected) return null;
            // Get the stored key and mask it
            const {data} = await supabase
                .from("ai_tokens")
                .select("api_key")
                .eq("user_id", user.id)
                .maybeSingle();
            
            if (data?.api_key) {
                const key = data.api_key;
                // Show first 7 chars + masked middle + last 4 chars
                if (key.length > 11) {
                    return `${key.substring(0, 7)}${'*'.repeat(key.length - 11)}${key.substring(key.length - 4)}`;
                }
                return '*'.repeat(key.length);
            }
            return null;
        },
        enabled: !!user && !!openAiConnected,
    });

    const integrations = useMemo(() => [
        {
            id: 'route-optimization',
            name: 'Route Optimization & Mileage Tracking',
            type: 'navigation' as const,
            category: 'Navigation & Maps',
            description: 'Configure home base, track mileage, and optimize routes with AI',
            icon: <Navigation className="h-5 w-5 text-muted-foreground"/>,
            component: <RouteOptimizationSettings/>,
        },
        {
            id: "google-calendar",
            name: "Google Calendar",
            type: "calendar",
            category: "Calendar Sync",
            description: googleConnected ? "Connected" : "Not connected",
            icon: <img src="/icons/google-calendar.png" alt="Google Calendar" className="h-8 w-8 rounded"/>,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icons/google-calendar.png"
                            alt="Google Calendar"
                            className="h-8 w-8 rounded"
                        />
                        <div>
                            <p className="font-medium">Google Calendar</p>
                            <p className="text-sm text-muted-foreground">
                                {googleConnected ? "Connected" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {googleConnected ? (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await googleCalendar.disconnect(user!.id);
                                refetchGoogle();
                            }}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={() => googleCalendar.connect(user!.id)}>
                            Connect
                        </Button>
                    )}
                </div>
            )
        },
        {
            id: "openai-defects",
            name: "OpenAI Defect Detection",
            type: "ai",
            category: "AI Tools",
            description: openAiConnected ? "API key saved" : "Not connected",
            icon: <img src="/icons/open-ai-logo.png" alt="OpenAI" className="h-5 w-5 rounded"/>,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-start gap-3">
                        <img src="/icons/open-ai-logo.png" alt="OpenAI" className="h-5 w-5 rounded mt-3"/>
                        <div>
                            <p className="font-medium">OpenAI Defect Detection</p>
                            <p className="text-sm text-muted-foreground">
                                {openAiConnected ? "API key saved" : "Add your OpenAI API key to enable AI analysis."}
                            </p>
                            {openAiConnected ? (
                                <div className="mt-3">
                                    <Input
                                        type="text"
                                        value={openAiKeyMasked || "Loading..."}
                                        readOnly
                                        className="w-[400px] bg-muted"
                                        placeholder="API key masked for security"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your API key is stored securely in the database
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-3">
                                    <Input
                                        type="password"
                                        placeholder="Enter your OpenAI API key (sk-...)"
                                        value={openAiKey}
                                        onChange={(e) => setOpenAiKey(e.target.value)}
                                        className="w-[400px]"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your API key will be encrypted and stored securely
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {openAiConnected ? (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await openAI.disconnect(user!.id);
                                refetchOpenAi();
                            }}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={async () => {
                                    try {
                                        await openAI.connect(user!.id, openAiKey);
                                        setOpenAiKey("");
                                        refetchOpenAi();
                                        toast({
                                            title: "Success",
                                            description: "OpenAI API key saved successfully",
                                        });
                                    } catch (error) {
                                        console.error("Failed to save API key:", error);
                                        toast({
                                            title: "Error",
                                            description: "Failed to save API key. Please try again.",
                                            variant: "destructive",
                                        });
                                    }
                                }}
                                disabled={!openAiKey || !openAiKey.startsWith('sk-')}
                            >
                                Save API Key
                            </Button>
                        </div>
                    )}
                </div>
            )
        }
    ], [
        optimizeRoute,
        googleConnected,
        refetchGoogle,
        openAiConnected,
        refetchOpenAi,
        openAiKeyMasked,
        user,
        openAiKey,
    ]);

    const filteredIntegrations = useMemo(() => {
        return integrations.filter(integration => {
            const matchesFilter = filterType === "all" || integration.type === filterType;
            return matchesFilter;
        });
    }, [integrations, filterType]);

    const groupedIntegrations = useMemo(() => {
        const groups: Record<string, typeof filteredIntegrations> = {};
        filteredIntegrations.forEach(integration => {
            if (!groups[integration.category]) {
                groups[integration.category] = [];
            }
            groups[integration.category].push(integration);
        });
        return groups;
    }, [filteredIntegrations]);

    return (
        <div className="space-y-4">

            <div className="flex justify-between">
                <div>
                    <h2 className="text-lg font-medium">Integrations</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your third-party integrations here.
                    </p>
                </div>
                <div className="flex justify-end">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by type"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="navigation">Navigation & Maps</SelectItem>
                            <SelectItem value="calendar">Calendar Sync</SelectItem>
                            <SelectItem value="ai">AI Tools</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
                    <div key={category} className="space-y-4">
                        <div className="flex items-center gap-2">
                            {category === "Navigation & Maps" && <Navigation className="h-5 w-5 text-primary"/>}
                            {category === "Calendar Sync" && <Calendar className="h-5 w-5 text-primary"/>}
                            {category === "AI Tools" &&
                                <img src="/icons/open-ai-logo.png" alt="OpenAI" className="h-5 w-5 text-primary"/>}
                            <h3 className="text-base font-medium">{category}</h3>
                        </div>
                        <div className="grid gap-3">
                            {categoryIntegrations.map((integration) => (
                                <div key={integration.id}>
                                    {integration.component}
                                </div>
                            ))}
                        </div>
                        {Object.keys(groupedIntegrations).indexOf(category) < Object.keys(groupedIntegrations).length - 1 && (
                            <Separator/>
                        )}
                    </div>
                ))}

                {Object.keys(groupedIntegrations).length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No integrations found matching your filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Integrations;

