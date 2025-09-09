import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bell, TrendingUp, MousePointer, Send } from 'lucide-react';
import { useNotificationHistory } from '@/hooks/useNotificationHistory';

export function NotificationHistoryCard() {
  const { stats, isLoading } = useNotificationHistory(30);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Statistics</span>
          </CardTitle>
          <CardDescription>Last 30 days performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Statistics</span>
          </CardTitle>
          <CardDescription>Last 30 days performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No notification data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const topNotificationType = Object.entries(stats.byType).reduce(
    (max, [type, count]) => (count > max.count ? { type, count } : max),
    { type: '', count: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notification Statistics</span>
        </CardTitle>
        <CardDescription>Last 30 days performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Send className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-muted-foreground">Sent</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{stats.delivered}</span>
            </div>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MousePointer className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{stats.clicked}</span>
            </div>
            <p className="text-sm text-muted-foreground">Clicked</p>
          </div>
          
          <div className="text-center">
            <span className="text-2xl font-bold">{stats.clickRate}%</span>
            <p className="text-sm text-muted-foreground">Click Rate</p>
          </div>
        </div>

        {/* Delivery Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Delivery Rate</span>
            <span className="font-medium">{stats.deliveryRate}%</span>
          </div>
          <Progress value={stats.deliveryRate} className="h-2" />
        </div>

        {/* Click Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Click Through Rate</span>
            <span className="font-medium">{stats.clickRate}%</span>
          </div>
          <Progress value={stats.clickRate} className="h-2" />
        </div>

        {/* Top Notification Type */}
        {topNotificationType.type && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Most Common Type</span>
              <Badge variant="secondary">
                {topNotificationType.type.replace(/_/g, ' ')} ({topNotificationType.count})
              </Badge>
            </div>
          </div>
        )}

        {/* Notification Types Breakdown */}
        {Object.keys(stats.byType).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Notification Types</h4>
            <div className="space-y-1">
              {Object.entries(stats.byType)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}