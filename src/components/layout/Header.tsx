import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="font-bold">
          InspectPro
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/reports" className="text-sm text-muted-foreground hover:text-foreground">Reports</Link>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
          <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground">Templates</a>
          <a href="#offline" className="text-sm text-muted-foreground hover:text-foreground">Offline</a>
          <a href="#security" className="text-sm text-muted-foreground hover:text-foreground">Security</a>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/reports">Reports</Link>
          </Button>
          <Button asChild>
            <Link to="/">Get Started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
