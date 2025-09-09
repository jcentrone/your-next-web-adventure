import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { notificationLogApi } from '@/integrations/supabase/notificationsApi';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  sent_at: string;
  delivered: boolean;
  clicked: boolean;
  related_appointment_id?: string;
  related_report_id?: string;
  related_contact_id?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.clicked).length;

  useEffect(() => {
    if (user && isOpen) {
      loadNotifications();
    }
  }, [user, isOpen]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await notificationLogApi.getNotificationHistory(user.id, 50);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsClicked = async (notificationId: string) => {
    try {
      await notificationLogApi.markAsClicked(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, clicked: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as clicked:', error);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.clicked) {
      markAsClicked(notification.id);
    }

    // Handle navigation based on notification data
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    } else if (notification.related_appointment_id) {
      window.location.href = `/calendar?appointment=${notification.related_appointment_id}`;
    } else if (notification.related_report_id) {
      window.location.href = `/reports/${notification.related_report_id}`;
    } else if (notification.related_contact_id) {
      window.location.href = `/contacts/${notification.related_contact_id}`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'client_message':
      case 'booking_new':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'sync_complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sync_failed':
      case 'system_alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return 'default';
      case 'client_message':
      case 'booking_new':
        return 'secondary';
      case 'sync_complete':
        return 'default';
      case 'sync_failed':
      case 'system_alert':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatNotificationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">You'll see your notifications here when they arrive</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.clicked ? 'border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={getNotificationBadgeVariant(notification.type)}
                                className="text-xs"
                              >
                                {formatNotificationType(notification.type)}
                              </Badge>
                              {(notification.data?.url || 
                                notification.related_appointment_id || 
                                notification.related_report_id || 
                                notification.related_contact_id) && (
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.body}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}
                            </p>
                            
                            <div className="flex items-center space-x-2">
                              {notification.delivered && (
                                <Badge variant="outline" className="text-xs">
                                  Delivered
                                </Badge>
                              )}
                              {notification.clicked && (
                                <Badge variant="outline" className="text-xs">
                                  Read
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}