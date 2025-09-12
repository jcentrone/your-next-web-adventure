import React from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/contexts/AuthContext";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
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
    HelpCircle,
    FileText,
    Home,
    Menu,
    MoreHorizontal,
    Navigation,
    Settings,
    Users,
    X
} from "lucide-react";
import {useIsMobile} from "@/hooks/use-mobile";
import {usePWAInstall} from "@/hooks/usePWAInstall";
import {useOnboarding} from "@/components/onboarding/OnboardingManager";
import {NotificationCenter} from "@/components/notifications/NotificationCenter";

const Header: React.FC = () => {
    const {user, signOut} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const {isInstallable, install} = usePWAInstall();
    const {isActive, currentStep} = useOnboarding();
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
                    {user ? (
                        <>
                            <Link to="/dashboard"
                                  className={`flex items-center gap-2 transition-colors hover:text-primary ${location.pathname === '/dashboard' ? 'text-primary' : ''}`}
                                  data-onboarding="dashboard">
                                <Home className="h-4 w-4"/>
                                Dashboard
                            </Link>
                            <Link to="/reports"
                                  className={`flex items-center gap-2 transition-colors hover:text-primary ${location.pathname.startsWith('/reports') ? 'text-primary' : ''}`}
                                  data-onboarding="reports">
                                <FileText className="h-4 w-4"/>
                                Reports
                            </Link>
                            <Link to="/accounts"
                                  className={`flex items-center gap-2 transition-colors hover:text-primary ${location.pathname.startsWith('/accounts') ? 'text-primary' : ''}`}
                                  data-onboarding="accounts">
                                <Building2 className="h-4 w-4"/>
                                Accounts
                            </Link>
                            <Link to="/contacts"
                                  className={`flex items-center gap-2 transition-colors hover:text-primary ${location.pathname.startsWith('/contacts') ? 'text-primary' : ''}`}
                                  data-onboarding="contacts">
                                <Users className="h-4 w-4"/>
                                Contacts
                            </Link>
                            <Link to="/calendar"
                                  className={`flex items-center gap-2 transition-colors hover:text-primary ${location.pathname === '/calendar' ? 'text-primary' : ''}`}
                                  data-onboarding="calendar">
                                <Calendar className="h-4 w-4"/>
                                Calendar
                            </Link>
                            <Link to="/tasks"
                                   className={`flex items-center gap-2 transition-colors hover:text-primary ${location.pathname === '/tasks' ? 'text-primary' : ''}`}
                                   data-onboarding="tasks">
                                 <CheckSquare className="h-4 w-4"/>
                                 Tasks
                             </Link>
                             <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                                         <MoreHorizontal className="h-4 w-4"/>
                                         More
                                         <ChevronDown className="h-3 w-3"/>
                                     </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                     <DropdownMenuItem asChild>
                                         <Link to="/routes" className="flex items-center gap-2 w-full">
                                             <Navigation className="h-4 w-4"/>
                                             Routes
                                         </Link>
                                     </DropdownMenuItem>
                                     <DropdownMenuItem asChild>
                                         <Link to="/expenses" className="flex items-center gap-2 w-full">
                                             <DollarSign className="h-4 w-4"/>
                                             Expenses
                                         </Link>
                                     </DropdownMenuItem>
                                 </DropdownMenuContent>
                             </DropdownMenu>
                             <Link to="/analytics"
                                   className={`flex items-center gap-2 transition-colors hover:text-primary ${location.pathname === '/analytics' ? 'text-primary' : ''}`}
                                   data-onboarding="analytics">
                                 <BarChart3 className="h-4 w-4"/>
                                 Analytics
                             </Link>
                        </>
                    ) : (
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
                    )}
                </nav>


                {/* Mobile Navigation */}
                {isMobile && (
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5"/>
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="left" className="w-64">
                            <div className="flex items-center justify-between mb-6">
                                <Link to="/" className="flex items-center gap-2 font-bold"
                                      onClick={() => setMobileMenuOpen(false)}>
                                    <img src="/HomeReportPro_Logo-transparent-light.png" alt="Home Report Pro"
                                         className="h-6 w-auto block dark:hidden"/>
                                    <img src="/HomeReportPro_Logo-transparent-dark.png" alt="Home Report Pro"
                                         className="h-6 w-auto hidden dark:block"/>
                                </Link>
                                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}
                                        className="h-6 w-6">
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>

                            <nav className="flex flex-col space-y-4">
                                {user ? (
                                    <>
                                        {/* Reordered navigation */}
                                        <Link to="/dashboard"
                                              className={`transition-colors py-2 hover:text-primary ${location.pathname === '/dashboard' ? 'text-primary' : 'text-foreground'}`}
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Dashboard
                                        </Link>
                                        <Link to="/reports"
                                              className={`transition-colors py-2 hover:text-primary ${location.pathname.startsWith('/reports') ? 'text-primary' : 'text-foreground'}`}
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Reports
                                        </Link>
                                        <Link to="/accounts"
                                              className={`transition-colors py-2 hover:text-primary ${location.pathname.startsWith('/accounts') ? 'text-primary' : 'text-foreground'}`}
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Accounts
                                        </Link>
                                        <Link to="/contacts"
                                              className={`transition-colors py-2 hover:text-primary ${location.pathname.startsWith('/contacts') ? 'text-primary' : 'text-foreground'}`}
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Contacts
                                        </Link>
                                        <Link to="/calendar"
                                              className={`transition-colors py-2 hover:text-primary ${location.pathname === '/calendar' ? 'text-primary' : 'text-foreground'}`}
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Calendar
                                        </Link>
                                        <Link to="/routes"
                                              className={`transition-colors py-2 hover:text-primary ${location.pathname === '/routes' ? 'text-primary' : 'text-foreground'}`}
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Routes
                                        </Link>
                                        <Link to="/tasks"
                                              className={`transition-colors py-2 hover:text-primary ${location.pathname === '/tasks' ? 'text-primary' : 'text-foreground'}`}
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Tasks
                                        </Link>
                                        <Link to="/expenses"
                                              className={`transition-colors py-2 hover:text-primary ${location.pathname.startsWith('/expenses') ? 'text-primary' : 'text-foreground'}`}
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Expenses
                                        </Link>
                                        <Link to="/analytics"
                                              className={`transition-colors py-2 hover:text-primary ${location.pathname === '/analytics' ? 'text-primary' : 'text-foreground'}`}
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Analytics
                                        </Link>

                                        {/* Settings */}
                                        <Link to="/settings"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Settings
                                        </Link>

                                        {/* Optional PWA install */}
                                        {isInstallable && (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start gap-2"
                                                onClick={() => {
                                                    install();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <Download className="h-4 w-4"/>
                                                Install App
                                            </Button>
                                        )}

                                        {/* Auth actions */}
                                        <div className="border-t pt-4 mt-4">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={async () => {
                                                    try {
                                                        await signOut();
                                                        setMobileMenuOpen(false);
                                                        navigate("/");
                                                    } catch (error) {
                                                        console.error("Sign out failed:", error);
                                                    }
                                                }}
                                            >
                                                Sign out
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/features"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Features
                                        </Link>
                                        <Link to="/pricing"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Pricing
                                        </Link>
                                        <Link to="/sample-reports"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Sample Reports
                                        </Link>
                                        <div className="border-t pt-4 mt-4 space-y-2">
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link to="/auth?mode=signin" onClick={() => setMobileMenuOpen(false)}>
                                                    Sign in
                                                </Link>
                                            </Button>
                                            <Button className="w-full" asChild>
                                                <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                                                    Sign up
                                                </Link>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                )}


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
                            <NotificationCenter />
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
                                <DropdownMenuContent align={isActive && currentStep === 8 ? "start" : "end"} className="w-56 z-[80]">
                                    <DropdownMenuLabel className="max-w-[200px] truncate">
                                        {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard" className="flex items-center gap-2">
                                            <Home className="h-4 w-4"/>
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/reports" className="flex items-center gap-2">
                                            <FileText className="h-4 w-4"/>
                                            My Reports
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/settings" className="flex items-center gap-2" data-onboarding="settings-menu">
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