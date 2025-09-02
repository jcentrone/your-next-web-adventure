import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Zap, Wifi, Download } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallPromptProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall?: () => void;
}

export function PWAInstallPrompt({ isOpen, onOpenChange, onInstall }: PWAInstallPromptProps) {
  const { install, dismiss } = usePWAInstall();

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      onInstall?.();
      onOpenChange(false);
    }
  };

  const handleDismiss = () => {
    dismiss();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Install Home Report Pro
          </DialogTitle>
          <DialogDescription>
            Get the full app experience with offline access and faster performance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span>Works like a native mobile app</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span>Access reports and data offline</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>Faster loading and better performance</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleInstall} className="flex-1">
              Install App
            </Button>
            <Button onClick={handleDismiss} variant="outline" className="flex-1">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}