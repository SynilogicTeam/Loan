import { useState, useEffect } from 'react';
import { Bell, Check, X, Eye, Trash2, Filter } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New member registration",
      message: "John Doe has registered for Mahadev Trust",
      type: "member",
      time: "2 minutes ago",
      read: false,
      priority: "normal"
    },
    {
      id: 2,
      title: "Payment received",
      message: "₹5,000 contribution from Ram Kumar",
      type: "payment",
      time: "1 hour ago",
      read: false,
      priority: "high"
    },
    {
      id: 3,
      title: "Loan application",
      message: "New loan request for ₹50,000 from Priya Sharma",
      type: "loan",
      time: "3 hours ago",
      read: true,
      priority: "normal"
    },
    {
      id: 4,
      title: "Payment overdue",
      message: "EMI payment overdue for Rajesh Kumar - ₹2,500",
      type: "overdue",
      time: "1 day ago",
      read: false,
      priority: "urgent"
    },
    {
      id: 5,
      title: "System update",
      message: "Platform maintenance scheduled for tonight 2:00 AM",
      type: "system",
      time: "2 days ago",
      read: true,
      priority: "low"
    }
  ]);

  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'member': return '👤';
      case 'payment': return '💰';
      case 'loan': return '🏦';
      case 'overdue': return '⚠️';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${notifications.length} total notifications, ${unreadCount} unread`}
        icon={Bell}
      />

      {/* Actions Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
          <span className="text-sm text-slate-600">
            Showing {filteredNotifications.length} notifications
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            icon={Check}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications</h3>
            <p className="text-slate-500">
              {filter === 'unread' ? 'All caught up! No unread notifications.' : 'No notifications to show.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white border rounded-lg p-4 transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-indigo-500 bg-indigo-50/30' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400">
                      {notification.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Mark as read"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}