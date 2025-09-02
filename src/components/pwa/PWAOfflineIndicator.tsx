import React from 'react';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PWAOfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <Alert className="border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="text-sm font-medium">
        You're currently offline. Changes will sync when reconnected.
      </AlertDescription>
    </Alert>
  );
}