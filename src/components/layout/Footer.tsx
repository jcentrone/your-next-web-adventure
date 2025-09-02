import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t">
      <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Home Report Pro. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#templates" className="hover:text-foreground">Templates</a>
          <a href="#offline" className="hover:text-foreground">Offline</a>
          <a href="#security" className="hover:text-foreground">Security</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
