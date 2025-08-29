
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="font-bold">
          InspectPro
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {user ? (
            <>
              <Link to="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link to="/reports" className="transition-colors hover:text-primary">
                Reports
              </Link>
              <Link to="/contacts" className="transition-colors hover:text-primary">
                Contacts
              </Link>
              <Link to="/calendar" className="transition-colors hover:text-primary">
                Calendar
              </Link>
              <Link to="/tasks" className="transition-colors hover:text-primary">
                Tasks
              </Link>
              <Link to="/defects-admin" className="transition-colors hover:text-primary">
                Defects
              </Link>
              <Link to="/section-manager" className="transition-colors hover:text-primary">
                Section Manager
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="transition-colors hover:text-primary">
                Features
              </Link>
              <Link to="/" className="transition-colors hover:text-primary">
                Templates
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button asChild variant="outline">
                <Link to="/auth?mode=signin">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=signup">Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link to="/reports">Reports</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={(user.user_metadata as any)?.avatar_url || (user.user_metadata as any)?.picture} alt="avatar" />
                      <AvatarFallback>{initials || "U"}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="max-w-[200px] truncate">
                    {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reports">My Reports</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/section-manager">Section Manager</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
