import React, {useMemo, useState} from "react";
import {useAuth} from "@/contexts/AuthContext";
import {useQuery} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Calendar, CalendarDays, ExternalLink, Navigation, Search, Receipt} from "lucide-react";
import * as googleCalendar from "@/integrations/googleCalendar";
import * as outlookCalendar from "@/integrations/outlookCalendar";
import * as appleCalendar from "@/integrations/appleCalendar";
import * as showingTime from "@/integrations/showingTime";
import * as quickBooks from "@/integrations/quickBooks";
import * as xero from "@/integrations/xero";
import * as zohoBooks from "@/integrations/zohoBooks";
import * as freshBooks from "@/integrations/freshBooks";

const Integrations: React.FC = () => {
    const {user} = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");

    const [optimizeRoute, setOptimizeRoute] = useState(
        () => localStorage.getItem("optimizeRoute") === "true"
    );

    const [calendlyLink, setCalendlyLink] = useState(
        () => localStorage.getItem("calendlyLink") || ""
    );
    const [acuityLink, setAcuityLink] = useState(
        () => localStorage.getItem("acuityLink") || ""
    );
    const [setmoreLink, setSetmoreLink] = useState(
        () => localStorage.getItem("setmoreLink") || ""
    );

    const {data: googleConnected, refetch: refetchGoogle} = useQuery({
        queryKey: ["google-calendar-connected", user?.id],
        queryFn: () => googleCalendar.isConnected(user!.id),
        enabled: !!user,
    });

    const {data: outlookConnected, refetch: refetchOutlook} = useQuery({
        queryKey: ["outlook-calendar-connected", user?.id],
        queryFn: () => outlookCalendar.isConnected(user!.id),
        enabled: !!user,
    });

    const {data: appleConnected, refetch: refetchApple} = useQuery({
        queryKey: ["apple-calendar-connected", user?.id],
        queryFn: () => appleCalendar.isConnected(user!.id),
        enabled: !!user,
    });

    const {data: showingTimeConnected, refetch: refetchShowingTime} = useQuery({
        queryKey: ["showingtime-connected", user?.id],
        queryFn: () => showingTime.isConnected(user!.id),
        enabled: !!user,
    });

    const {data: quickBooksConnected, refetch: refetchQuickBooks} = useQuery({
        queryKey: ["quickbooks-connected", user?.id],
        queryFn: () => quickBooks.isConnected(user!.id),
        enabled: !!user,
    });

    const {data: xeroConnected, refetch: refetchXero} = useQuery({
        queryKey: ["xero-connected", user?.id],
        queryFn: () => xero.isConnected(user!.id),
        enabled: !!user,
    });

    const {data: zohoBooksConnected, refetch: refetchZohoBooks} = useQuery({
        queryKey: ["zohobooks-connected", user?.id],
        queryFn: () => zohoBooks.isConnected(user!.id),
        enabled: !!user,
    });

    const {data: freshBooksConnected, refetch: refetchFreshBooks} = useQuery({
        queryKey: ["freshbooks-connected", user?.id],
        queryFn: () => freshBooks.isConnected(user!.id),
        enabled: !!user,
    });

    // Integration data structure
    const integrations = useMemo(() => [
        {
            id: "route-optimization",
            name: "Route Optimization",
            type: "navigation",
            category: "Navigation & Maps",
            description: "Enable optimized navigation when viewing daily appointments.",
            icon: <Navigation className="h-5 w-5 text-muted-foreground"/>,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <Navigation className="h-5 w-5 text-muted-foreground"/>
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
            id: "outlook-calendar",
            name: "Outlook Calendar",
            type: "calendar",
            category: "Calendar Sync",
            description: outlookConnected ? "Connected" : "Not connected",
            icon: <img src="/icons/outlook.png" alt="Outlook Calendar" className="h-8 w-8 rounded"/>,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icons/outlook.png"
                            alt="Outlook Calendar"
                            className="h-8 w-8 rounded"
                        />
                        <div>
                            <p className="font-medium">Outlook Calendar</p>
                            <p className="text-sm text-muted-foreground">
                                {outlookConnected ? "Connected" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {outlookConnected ? (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await outlookCalendar.disconnect(user!.id);
                                refetchOutlook();
                            }}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={() => outlookCalendar.connect(user!.id)}>
                            Connect
                        </Button>
                    )}
                </div>
            )
        },
        {
            id: "apple-calendar",
            name: "Apple Calendar",
            type: "calendar",
            category: "Calendar Sync",
            description: appleConnected ? "Connected" : "Not connected",
            icon: <img src="/icons/apple.png" alt="Apple Calendar" className="h-8 w-8 rounded"/>,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icons/apple.png"
                            alt="Apple Calendar"
                            className="h-8 w-8 rounded"
                        />
                        <div>
                            <p className="font-medium">Apple Calendar</p>
                            <p className="text-sm text-muted-foreground">
                                {appleConnected ? "Connected" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {appleConnected ? (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await appleCalendar.disconnect(user!.id);
                                refetchApple();
                            }}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={() => appleCalendar.connect(user!.id)}>
                            Connect
                        </Button>
                    )}
                </div>
            )
        },
        {
            id: "quickbooks",
            name: "QuickBooks",
            type: "accounting",
            category: "Accounting",
            description: quickBooksConnected ? "Connected" : "Not connected",
            icon: <Receipt className="h-5 w-5 text-muted-foreground"/>,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="font-medium">QuickBooks</p>
                            <p className="text-sm text-muted-foreground">
                                {quickBooksConnected ? "Connected" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {quickBooksConnected ? (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await quickBooks.disconnect(user!.id);
                                refetchQuickBooks();
                            }}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={() => quickBooks.connect(user!.id)}>
                            Connect
                        </Button>
                    )}
                </div>
            )
        },
        {
            id: "xero",
            name: "Xero",
            type: "accounting",
            category: "Accounting",
            description: xeroConnected ? "Connected" : "Not connected",
            icon: <Receipt className="h-5 w-5 text-muted-foreground"/>,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="font-medium">Xero</p>
                            <p className="text-sm text-muted-foreground">
                                {xeroConnected ? "Connected" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {xeroConnected ? (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await xero.disconnect(user!.id);
                                refetchXero();
                            }}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={() => xero.connect(user!.id)}>
                            Connect
                        </Button>
                    )}
                </div>
            )
        },
        {
            id: "zoho-books",
            name: "Zoho Books",
            type: "accounting",
            category: "Accounting",
            description: zohoBooksConnected ? "Connected" : "Not connected",
            icon: <Receipt className="h-5 w-5 text-muted-foreground"/>,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="font-medium">Zoho Books</p>
                            <p className="text-sm text-muted-foreground">
                                {zohoBooksConnected ? "Connected" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {zohoBooksConnected ? (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await zohoBooks.disconnect(user!.id);
                                refetchZohoBooks();
                            }}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={() => zohoBooks.connect(user!.id)}>
                            Connect
                        </Button>
                    )}
                </div>
            )
        },
        {
            id: "freshbooks",
            name: "FreshBooks",
            type: "accounting",
            category: "Accounting",
            description: freshBooksConnected ? "Connected" : "Not connected",
            icon: <Receipt className="h-5 w-5 text-muted-foreground"/>,
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="font-medium">FreshBooks</p>
                            <p className="text-sm text-muted-foreground">
                                {freshBooksConnected ? "Connected" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {freshBooksConnected ? (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await freshBooks.disconnect(user!.id);
                                refetchFreshBooks();
                            }}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={() => freshBooks.connect(user!.id)}>
                            Connect
                        </Button>
                    )}
                </div>
            )
        },
        {
            id: "calendly",
            name: "Calendly",
            type: "scheduling",
            category: "Scheduling Platforms",
            description: "Paste your scheduling link for client bookings.",
            icon: <img src="/icons/calendly.png" alt="Calendly" className="h-8 w-8 rounded mt-0.5"/>,
            component: (
                <div className="flex items-start justify-between border p-4 rounded-md">
                    <div className="flex items-start gap-3 flex-1 mr-4">
                        <img
                            src="/icons/calendly.png"
                            alt="Calendly"
                            className="h-8 w-8 rounded mt-0.5"
                        />
                        <div className="space-y-2 flex-1">
                            <p className="font-medium">Calendly</p>
                            <p className="text-sm text-muted-foreground">
                                Paste your scheduling link for client bookings.
                            </p>
                            <Label htmlFor="calendly-link" className="sr-only">
                                Calendly Link
                            </Label>
                            <Input
                                id="calendly-link"
                                placeholder="https://calendly.com/your-name/meeting"
                                value={calendlyLink}
                                onChange={(e) => setCalendlyLink(e.target.value)}
                                onBlur={() => localStorage.setItem("calendlyLink", calendlyLink)}
                            />
                            {calendlyLink && (
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="h-3 w-3 text-muted-foreground"/>
                                    <p className="text-xs text-muted-foreground">
                                        Share this link with clients: {calendlyLink}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => localStorage.setItem("calendlyLink", calendlyLink)}
                    >
                        Save
                    </Button>
                </div>
            )
        },
        {
            id: "acuity-scheduling",
            name: "Acuity Scheduling",
            type: "scheduling",
            category: "Scheduling Platforms",
            description: "Enter your scheduling link or API key.",
            icon: <img src="/icons/acuity-scheduling.png" alt="Acuity Scheduling" className="h-8 w-8 rounded mt-0.5"/>,
            component: (
                <div className="flex items-start justify-between border p-4 rounded-md">
                    <div className="flex items-start gap-3 flex-1 mr-4">
                        <img
                            src="/icons/acuity-scheduling.png"
                            alt="Acuity Scheduling"
                            className="h-8 w-8 rounded mt-0.5"
                        />
                        <div className="space-y-2 flex-1">
                            <p className="font-medium">Acuity Scheduling</p>
                            <p className="text-sm text-muted-foreground">
                                Enter your scheduling link or API key.
                            </p>
                            <Label htmlFor="acuity-link" className="sr-only">
                                Acuity Link
                            </Label>
                            <Input
                                id="acuity-link"
                                placeholder="https://app.acuityscheduling.com/schedule.php?owner=123456"
                                value={acuityLink}
                                onChange={(e) => setAcuityLink(e.target.value)}
                                onBlur={() => localStorage.setItem("acuityLink", acuityLink)}
                            />
                            {acuityLink && (
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="h-3 w-3 text-muted-foreground"/>
                                    <p className="text-xs text-muted-foreground">
                                        Share this link with clients: {acuityLink}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => localStorage.setItem("acuityLink", acuityLink)}
                    >
                        Save
                    </Button>
                </div>
            )
        },
        {
            id: "setmore",
            name: "Setmore",
            type: "scheduling",
            category: "Scheduling Platforms",
            description: "Provide your booking page link for clients to schedule.",
            icon: <img src="/icons/setmore.png" alt="Setmore" className="h-8 w-8 rounded mt-0.5"/>,
            component: (
                <div className="flex items-start justify-between border p-4 rounded-md">
                    <div className="flex items-start gap-3 flex-1 mr-4">
                        <img
                            src="/icons/setmore.png"
                            alt="Setmore"
                            className="h-8 w-8 rounded mt-0.5"
                        />
                        <div className="space-y-2 flex-1">
                            <p className="font-medium">Setmore</p>
                            <p className="text-sm text-muted-foreground">
                                Provide your booking page link for clients to schedule.
                            </p>
                            <Label htmlFor="setmore-link" className="sr-only">
                                Setmore Link
                            </Label>
                            <Input
                                id="setmore-link"
                                placeholder="https://booking.setmore.com/schedule/yourbusiness"
                                value={setmoreLink}
                                onChange={(e) => setSetmoreLink(e.target.value)}
                                onBlur={() => localStorage.setItem("setmoreLink", setmoreLink)}
                            />
                            {setmoreLink && (
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="h-3 w-3 text-muted-foreground"/>
                                    <p className="text-xs text-muted-foreground">
                                        Share this link with clients: {setmoreLink}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => localStorage.setItem("setmoreLink", setmoreLink)}
                    >
                        Save
                    </Button>
                </div>
            )
        },
        {
            id: "showingtime",
            name: "ShowingTime",
            type: "calendar",
            category: "Calendar Sync",
            description: showingTimeConnected ? "Connected" : "Not connected",
            icon: (
                <img
                    src="/icons/showingtime.png"
                    alt="ShowingTime"
                    className="h-8 w-8 rounded"
                />
            ),
            component: (
                <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icons/showingtime.png"
                            alt="ShowingTime"
                            className="h-8 w-8 rounded"
                        />
                        <div>
                            <p className="font-medium">ShowingTime</p>
                            <p className="text-sm text-muted-foreground">
                                {showingTimeConnected ? "Connected" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {showingTimeConnected ? (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await showingTime.disconnect(user!.id);
                                refetchShowingTime();
                            }}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={() => showingTime.connect(user!.id)}>
                            Connect
                        </Button>
                    )}
                </div>
            ),
        }
    ], [
        optimizeRoute,
        calendlyLink,
        acuityLink,
        setmoreLink,
        googleConnected,
        outlookConnected,
        appleConnected,
        showingTimeConnected,
        quickBooksConnected,
        xeroConnected,
        zohoBooksConnected,
        freshBooksConnected,
        refetchGoogle,
        refetchOutlook,
        refetchApple,
        refetchShowingTime,
        refetchQuickBooks,
        refetchXero,
        refetchZohoBooks,
        refetchFreshBooks,
        user,
    ]);

    // Filter integrations based on search query and filter type
    const filteredIntegrations = useMemo(() => {
        return integrations.filter(integration => {
            const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                integration.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterType === "all" || integration.type === filterType;
            return matchesSearch && matchesFilter;
        });
    }, [integrations, searchQuery, filterType]);

    // Group filtered integrations by category
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

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Search integrations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by type"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="navigation">Navigation & Maps</SelectItem>
                        <SelectItem value="calendar">Calendar Sync</SelectItem>
                        <SelectItem value="scheduling">Scheduling Platforms</SelectItem>
                        <SelectItem value="accounting">Accounting</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Filtered Integrations */}
            <div className="space-y-6">
                {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
                    <div key={category} className="space-y-4">
                        <div className="flex items-center gap-2">
                            {category === "Navigation & Maps" && <Navigation className="h-5 w-5 text-primary"/>}
                            {category === "Calendar Sync" && <Calendar className="h-5 w-5 text-primary"/>}
                            {category === "Scheduling Platforms" && <CalendarDays className="h-5 w-5 text-primary"/>}
                            {category === "Accounting" && <Receipt className="h-5 w-5 text-primary"/>}
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
                        <p className="text-muted-foreground">No integrations found matching your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Integrations;
