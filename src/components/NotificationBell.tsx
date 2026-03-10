import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import StreakTracker from './StreakTracker';
import ToastNotification from './ToastNotification';

interface Notification {
  id: string;
  type?: string;
  title?: string;
  message?: string;
  link?: string;
  message_id?: string;
  room_id?: string;
  room_name?: string;
  message_text?: string;
  user_id?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [toastNotification, setToastNotification] = useState<{ message: string; link?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    loadNotifications();
    loadNotificationPreference();
    subscribeToNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.is_read).length || 0);
  };

  const loadNotificationPreference = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('notifications_enabled')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading notification preference:', error);
      return;
    }

    setNotificationsEnabled(data?.notifications_enabled ?? true);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;

          if (newNotification.user_id === user.id || !newNotification.user_id) {
            setNotifications((current) => [newNotification, ...current]);
            setUnreadCount((current) => current + 1);

            if (newNotification.type === 'daily_insights') {
              setToastNotification({
                message: newNotification.title || 'Daily Insights Available!',
                link: newNotification.link,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    if (error) {
      console.error('Error marking notifications as read:', error);
      return;
    }

    setNotifications(current =>
      current.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);

      setNotifications(current =>
        current.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(current => Math.max(0, current - 1));
    }

    setIsOpen(false);

    if (notification.link) {
      navigate(notification.link);
    } else if (notification.room_id) {
      navigate(`/chatroom/${notification.room_id}`);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const displayUnreadCount = notificationsEnabled ? unreadCount : 0;

  return (
    <>
      {toastNotification && (
        <ToastNotification
          message={toastNotification.message}
          link={toastNotification.link}
          onClose={() => setToastNotification(null)}
        />
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Bell className="w-6 h-6" />
          {displayUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
            </span>
          )}
        </button>

      {isOpen && (
        <div className="fixed left-0 top-0 w-[420px] h-screen bg-slate-800 border-r border-slate-700 shadow-2xl flex flex-col z-[99999]">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0">
            <StreakTracker />
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-4 border-b border-slate-700 hover:bg-slate-750 transition-colors text-left ${
                    notification.type === 'daily_insights' && !notification.is_read
                      ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-l-4 border-l-blue-500'
                      : !notification.is_read
                      ? 'bg-slate-700/50'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-sm font-medium ${
                      notification.type === 'daily_insights' && !notification.is_read
                        ? 'text-blue-400'
                        : 'text-white'
                    }`}>
                      {notification.type === 'daily_insights'
                        ? 'Daily Insights'
                        : `${notification.room_name} Chat`}
                    </span>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {notification.type === 'daily_insights'
                      ? notification.message || notification.title
                      : `Hilex Bot posted: ${notification.message_text?.substring(0, 100) || ''}${notification.message_text && notification.message_text.length > 100 ? '...' : ''}`}
                  </p>
                  {!notification.is_read && (
                    <div className="mt-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        notification.type === 'daily_insights' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}></span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
