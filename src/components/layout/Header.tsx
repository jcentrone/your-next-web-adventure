import React from "react";
import {Link, useNavigate} from "react-router-dom";
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
    Building2,
    Calendar,
    CheckSquare,
    Download,
    FileText,
    Home,
    Menu,
    Settings,
    Users,
    X
} from "lucide-react";
import {useIsMobile} from "@/hooks/use-mobile";
import {usePWAInstall} from "@/hooks/usePWAInstall";

const Header: React.FC = () => {
    const {user, signOut} = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const {isInstallable, install} = usePWAInstall();

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
                        src="/HomeReportPro_Logo-transparent.png"
                        alt="Home Report Pro"
                        className="h-8 w-auto"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    {user ? (
                        <>
                            <Link to="/dashboard"
                                  className="flex items-center gap-2 transition-colors hover:text-primary"
                                  data-onboarding="dashboard">
                                <Home className="h-4 w-4"/>
                                Dashboard
                            </Link>
                            <Link to="/calendar"
                                  className="flex items-center gap-2 transition-colors hover:text-primary"
                                  data-onboarding="calendar">
                                <Calendar className="h-4 w-4"/>
                                Calendar
                            </Link>
                            <Link to="/tasks" className="flex items-center gap-2 transition-colors hover:text-primary">
                                <CheckSquare className="h-4 w-4"/>
                                Tasks
                            </Link>
                            <Link to="/contacts"
                                  className="flex items-center gap-2 transition-colors hover:text-primary"
                                  data-onboarding="contacts">
                                <Users className="h-4 w-4"/>
                                Contacts
                            </Link>
                            <Link to="/accounts"
                                  className="flex items-center gap-2 transition-colors hover:text-primary">
                                <Building2 className="h-4 w-4"/>
                                Accounts
                            </Link>
                            <Link to="/reports"
                                  className="flex items-center gap-2 transition-colors hover:text-primary"
                                  data-onboarding="reports">
                                <FileText className="h-4 w-4"/>
                                Reports
                            </Link>
                            <Link to="/analytics"
                                  className="flex items-center gap-2 transition-colors hover:text-primary">
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
                                    <img src="/HomeReportPro_Logo-transparent.png" alt="Home Report Pro"
                                         className="h-6 w-auto"/>
                                </Link>
                                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}
                                        className="h-6 w-6">
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>

                            <nav className="flex flex-col space-y-4">
                                {user ? (
                                    <>
                                        {/* Primary workflow */}
                                        <Link to="/dashboard"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Dashboard
                                        </Link>
                                        <Link to="/calendar"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Calendar
                                        </Link>
                                        <Link to="/tasks"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Tasks
                                        </Link>

                                        {/* Reference */}
                                        <Link to="/contacts"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Contacts
                                        </Link>
                                        <Link to="/accounts"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Accounts
                                        </Link>

                                        {/* Outputs & insights */}
                                        <Link to="/reports"
                                              className="text-foreground hover:text-primary transition-colors py-2"
                                              onClick={() => setMobileMenuOpen(false)}>
                                            Reports
                                        </Link>
                                        <Link to="/analytics"
                                              className="text-foreground hover:text-primary transition-colors py-2"
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        data-onboarding="user-menu">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src={(user.user_metadata as any)?.avatar_url || (user.user_metadata as any)?.picture}
                                                alt="avatar"/>
                                            <AvatarFallback>{initials || "U"}</AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
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
                                        <Link to="/settings" className="flex items-center gap-2">
                                            <Settings className="h-4 w-4"/>
                                            Settings
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