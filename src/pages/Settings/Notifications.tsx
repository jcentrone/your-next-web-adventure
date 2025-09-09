import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Bell, Clock, MessageSquare, AlertTriangle, RotateCcw, TrendingUp, Moon, TestTube } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { NotificationHistoryCard } from '@/components/notifications/NotificationHistoryCard';
import Seo from '@/components/Seo';

const Notifications = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading: pushLoading,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

  const {
    preferences,
    isLoading: prefsLoading,
    isSaving,
    togglePreference,
    updateReminderTimes,
    updateQuietHours
  } = useNotificationPreferences();

  const reminderOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 1440, label: '24 hours' }
  ];

  const toggleReminderTime = (minutes: number) => {
    const currentTimes = preferences.appointment_reminder_times;
    const newTimes = currentTimes.includes(minutes)
      ? currentTimes.filter(time => time !== minutes)
      : [...currentTimes, minutes].sort((a, b) => a - b);
    
    updateReminderTimes(newTimes);
  };

  if (prefsLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title="Notification Settings"
        description="Configure your push notification preferences for appointments, client messages, and system alerts."
      />
      
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Configure your push notification preferences to stay updated on important events.
          </p>
        </div>

        {/* Push Notification Setup */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Push Notifications</CardTitle>
                {isSubscribed && <Badge variant="default">Enabled</Badge>}
                {!isSubscribed && isSupported && <Badge variant="secondary">Disabled</Badge>}
                {!isSupported && <Badge variant="destructive">Not Supported</Badge>}
              </div>
              <div className="flex space-x-2">
                {isSubscribed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={sendTestNotification}
                    disabled={pushLoading}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                )}
                <Button
                  onClick={isSubscribed ? unsubscribe : subscribe}
                  disabled={!isSupported || pushLoading}
                  variant={isSubscribed ? "destructive" : "default"}
                  size="sm"
                >
                  {pushLoading ? 'Processing...' : isSubscribed ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {!isSupported && (
                <span className="text-destructive">
                  Push notifications are not supported in your current browser or device.
                </span>
              )}
              {isSupported && !isSubscribed && (
                "Enable push notifications to receive real-time updates about appointments, client messages, and system alerts."
              )}
              {isSupported && isSubscribed && (
                "Push notifications are enabled. You'll receive real-time updates based on your preferences below."
              )}
            </CardDescription>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <div className="grid gap-6">
          {/* Appointment Reminders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <CardTitle>Appointment Reminders</CardTitle>
                </div>
                <Switch
                  checked={preferences.appointment_reminders}
                  onCheckedChange={() => togglePreference('appointment_reminders')}
                  disabled={isSaving}
                />
              </div>
              <CardDescription>
                Get notified before your scheduled inspections
              </CardDescription>
            </CardHeader>
            {preferences.appointment_reminders && (
              <CardContent>
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Reminder Times</Label>
                  <div className="flex flex-wrap gap-2">
                    {reminderOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={preferences.appointment_reminder_times.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleReminderTime(option.value)}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Client Messages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle>Client Messages</CardTitle>
                </div>
                <Switch
                  checked={preferences.client_messages}
                  onCheckedChange={() => togglePreference('client_messages')}
                  disabled={isSaving}
                />
              </div>
              <CardDescription>
                New bookings, cancellations, and client communications
              </CardDescription>
            </CardHeader>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle>System Alerts</CardTitle>
                </div>
                <Switch
                  checked={preferences.system_alerts}
                  onCheckedChange={() => togglePreference('system_alerts')}
                  disabled={isSaving}
                />
              </div>
              <CardDescription>
                Important system updates, maintenance, and security alerts
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Sync Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5" />
                  <CardTitle>Sync Notifications</CardTitle>
                </div>
                <Switch
                  checked={preferences.sync_notifications}
                  onCheckedChange={() => togglePreference('sync_notifications')}
                  disabled={isSaving}
                />
              </div>
              <CardDescription>
                Data synchronization status and offline sync completions
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Business Intelligence */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <CardTitle>Business Intelligence</CardTitle>
                </div>
                <Switch
                  checked={preferences.business_intelligence}
                  onCheckedChange={() => togglePreference('business_intelligence')}
                  disabled={isSaving}
                />
              </div>
              <CardDescription>
                Weekly summaries, performance metrics, and achievement notifications
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="h-5 w-5" />
                <CardTitle>Quiet Hours</CardTitle>
              </div>
              <Switch
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={() => togglePreference('quiet_hours_enabled')}
                disabled={isSaving}
              />
            </div>
            <CardDescription>
              Suppress non-critical notifications during specified hours
            </CardDescription>
          </CardHeader>
          {preferences.quiet_hours_enabled && (
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet_start">Start Time</Label>
                  <Input
                    id="quiet_start"
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => updateQuietHours(e.target.value, preferences.quiet_hours_end)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet_end">End Time</Label>
                  <Input
                    id="quiet_end"
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => updateQuietHours(preferences.quiet_hours_start, e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <NotificationHistoryCard />

        <Separator />

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> Push notifications require HTTPS and are supported in modern browsers. 
            Critical alerts (like system emergencies) may override quiet hours settings.
          </p>
        </div>
      </div>
    </>
  );
};

export default Notifications;