import React, { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Navigation, Search } from "lucide-react";
import * as googleCalendar from "@/integrations/googleCalendar";

const Integrations: React.FC = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");

    const [optimizeRoute, setOptimizeRoute] = useState(
        () => localStorage.getItem("optimizeRoute") === "true"
    );

    const { data: googleConnected, refetch: refetchGoogle } = useQuery({
        queryKey: ["google-calendar-connected", user?.id],
        queryFn: () => googleCalendar.isConnected(user!.id),
        enabled: !!user,
    });

    const integrations = useMemo(() => [
        {
            id: "route-optimization",
            name: "Route Optimization",
            type: "navigation",
            category: "Navigation & Maps",
            description: "Enable optimized navigation when viewing daily appointments.",
            icon: <Navigation className="h-5 w-5 text-muted-foreground" />,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <Navigation className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Route Optimization</p>
                            <p className="text-sm text-muted-foreground">
                                Enable optimized navigation when viewing daily appointments.
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={optimizeRoute}
                        onCheckedChange={(checked) => {
                            setOptimizeRoute(checked);
                            localStorage.setItem("optimizeRoute", String(checked));
                        }}
                    />
                </div>
            )
        },
        {
            id: "google-calendar",
            name: "Google Calendar",
            type: "calendar",
            category: "Calendar Sync",
            description: googleConnected ? "Connected" : "Not connected",
            icon: <img src="/icons/google-calendar.png" alt="Google Calendar" className="h-8 w-8 rounded" />,
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
        }
    ], [optimizeRoute, googleConnected, refetchGoogle, user]);

    const filteredIntegrations = useMemo(() => {
        return integrations.filter(integration => {
            const matchesSearch =
                integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                integration.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterType === "all" || integration.type === filterType;
            return matchesSearch && matchesFilter;
        });
    }, [integrations, searchQuery, filterType]);

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
            <h2 className="text-lg font-medium">Integrations</h2>
            <p className="text-sm text-muted-foreground">
                Manage your third-party integrations here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search integrations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="navigation">Navigation & Maps</SelectItem>
                        <SelectItem value="calendar">Calendar Sync</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
                    <div key={category} className="space-y-4">
                        <div className="flex items-center gap-2">
                            {category === "Navigation & Maps" && <Navigation className="h-5 w-5 text-primary" />}
                            {category === "Calendar Sync" && <Calendar className="h-5 w-5 text-primary" />}
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
                            <Separator />
                        )}
                    </div>
                ))}

                {Object.keys(groupedIntegrations).length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No integrations found matching your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Integrations;

