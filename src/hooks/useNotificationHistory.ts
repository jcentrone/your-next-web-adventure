import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationLogApi } from '@/integrations/supabase/notificationsApi';

interface NotificationStats {
  total: number;
  delivered: number;
  clicked: number;
  deliveryRate: number;
  clickRate: number;
  byType: Record<string, number>;
}

export function useNotificationHistory(days = 30) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotificationData();
    }
  }, [user, days]);

  const loadNotificationData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load notification history
      const historyData = await notificationLogApi.getNotificationHistory(user.id, 100);
      setHistory(historyData || []);

      // Load and calculate stats
      const statsData = await notificationLogApi.getNotificationStats(user.id, days);
      
      if (statsData && statsData.length > 0) {
        const total = statsData.length;
        const delivered = statsData.filter(n => n.delivered).length;
        const clicked = statsData.filter(n => n.clicked).length;
        const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
        const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0;

        // Group by type
        const byType = statsData.reduce((acc, notification) => {
          acc[notification.type] = (acc[notification.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setStats({
          total,
          delivered,
          clicked,
          deliveryRate: Math.round(deliveryRate * 100) / 100,
          clickRate: Math.round(clickRate * 100) / 100,
          byType
        });
      } else {
        setStats({
          total: 0,
          delivered: 0,
          clicked: 0,
          deliveryRate: 0,
          clickRate: 0,
          byType: {}
        });
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadNotificationData();
  };

  return {
    history,
    stats,
    isLoading,
    refreshData
  };
}