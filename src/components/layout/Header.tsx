import React from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/contexts/AuthContext";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    BarChart3,
    BookOpen,
    Building2,
    Calendar,
    CheckSquare,
    ChevronDown,
    DollarSign,
    Download,
    FileText,
    HelpCircle,
    Home,
    MoreHorizontal,
    Navigation,
    Settings,
    Users,
    
} from "lucide-react";
import {useIsMobile} from "@/hooks/use-mobile";
import {usePWAInstall} from "@/hooks/usePWAInstall";
import {useOnboarding} from "@/components/onboarding/OnboardingManager";
import {NotificationCenter} from "@/components/notifications/NotificationCenter";
import {useResponsiveNavigation} from "@/hooks/useResponsiveNavigation";

const Header: React.FC = () => {
    const {user, signOut} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    
    const {isInstallable, install} = usePWAInstall();
    const {isActive, currentStep} = useOnboarding();
    const {
        visibleItems,
        hiddenItems,
        hasMoreItems,
        shouldShowResponsiveNav,
        isActive: isItemActive
    } = useResponsiveNavigation();
    const userMetadata = user?.user_metadata as { avatar_url?: string; picture?: string } | undefined;

    // Auto-open user menu during settings onboarding step
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);

    React.useEffect(() => {
        if (isActive && currentStep === 8) { // Settings step is index 8
            setUserMenuOpen(true);
        } else if (!isActive) {
            setUserMenuOpen(false);
        }
    }, [isActive, currentStep]);

    const initials = React.useMemo(() => {
        const name = (user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email ||
            "") as string;
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }, [user]);

    return (
        <header
            className="sticky top-0 z-[60] border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="flex h-14 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2 font-bold" data-onboarding="logo">
                    <img
                        src="/HomeReportPro_Logo-transparent-light.png"
                        alt="Home Report Pro"
                        className="h-8 w-auto block dark:hidden"
                    />
                    <img
                        src="/HomeReportPro_Logo-transparent-dark.png"
                        alt="Home Report Pro"
                        className="h-8 w-auto hidden dark:block"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    {user && shouldShowResponsiveNav ? (
                        <>
                            {/* Visible navigation items */}
                            {visibleItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.to}
                                        className={`flex items-center gap-2 transition-colors hover:text-primary ${
                                            isItemActive(item) ? 'text-primary' : ''
                                        }`}
                                        data-onboarding={item.id}
                                    >
                                        <IconComponent className="h-4 w-4"/>
                                        {item.label}
                                    </Link>
                                );
                            })}

                            {/* More menu for hidden items */}
                            {hasMoreItems && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost"
                                                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                                            <MoreHorizontal className="h-4 w-4"/>
                                            More
                                            <ChevronDown className="h-3 w-3"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-background border z-50">
                                        {hiddenItems.map((item) => {
                                            const IconComponent = item.icon;
                                            return (
                                                <DropdownMenuItem key={item.id} asChild>
                                                    <Link
                                                        to={item.to}
                                                        className={`flex items-center gap-2 w-full ${
                                                            isItemActive(item) ? 'text-primary' : ''
                                                        }`}
                                                    >
                                                        <IconComponent className="h-4 w-4"/>
                                                        {item.label}
                                                    </Link>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </>
                    ) : !user ? (
                        <>
                            <Link to="/features" className="transition-colors hover:text-primary">
                                Features
                            </Link>
                            <Link to="/pricing" className="transition-colors hover:text-primary">
                                Pricing
                            </Link>
                            <Link to="/sample-reports" className="transition-colors hover:text-primary">
                                Sample Reports
                            </Link>
                        </>
                    ) : null}
                </nav>




                <div className="flex items-center gap-2">
                    {!user ? (
                        <div className="hidden md:flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link to="/auth?mode=signin">Sign in</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link to="/auth?mode=signup">Sign up</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            {isInstallable && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={install}
                                    className="hidden md:flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4"/>
                                    Install App
                                </Button>
                            )}
                            <NotificationCenter/>
                            <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        data-onboarding="user-menu">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src={userMetadata?.avatar_url || userMetadata?.picture}
                                                alt="avatar"/>
                                            <AvatarFallback>{initials || "U"}</AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align={isActive && currentStep === 8 ? "start" : "end"}
                                                     className="w-56 z-[80]">
                                    <DropdownMenuLabel className="max-w-[200px] truncate">
                                        {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    {isMobile && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link to="/dashboard" className="flex items-center gap-2">
                                                    <Home className="h-4 w-4"/> Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/reports" className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4"/> Reports
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/accounts" className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4"/> Accounts
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/contacts" className="flex items-center gap-2">
                                                    <Users className="h-4 w-4"/> Contacts
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/calendar" className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4"/> Calendar
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/tasks" className="flex items-center gap-2">
                                                    <CheckSquare className="h-4 w-4"/> Tasks
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/routes" className="flex items-center gap-2">
                                                    <Navigation className="h-4 w-4"/> Routes
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/expenses" className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4"/> Expenses
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/analytics" className="flex items-center gap-2">
                                                    <BarChart3 className="h-4 w-4"/> Analytics
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    <DropdownMenuItem asChild>
                                        <Link to="/settings" className="flex items-center gap-2"
                                              data-onboarding="settings-menu">
                                            <Settings className="h-4 w-4"/>
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/documentation" className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4"/>
                                            Documentation
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/support" className="flex items-center gap-2">
                                            <HelpCircle className="h-4 w-4"/>
                                            Support
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log("Sign out button clicked");
                                            try {
                                                await signOut();
                                                console.log("Sign out completed, navigating to home");
                                                navigate("/");
                                            } catch (error) {
                                                console.error("Sign out failed:", error);
                                            }
                                        }}
                                    >
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;