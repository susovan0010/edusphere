"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, FileText, Award, ShieldAlert, Info, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "ASSIGNMENT" | "GENERAL" | "RESULT" | "APPROVAL";
  relatedId?: string | null;
  read: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("Failed to mark all as read", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    setIsOpen(false);

    if (notif.type === "ASSIGNMENT") {
      router.push("/student/assignments");
    } else if (notif.type === "APPROVAL") {
      router.push("/admin/approvals");
    } else if (notif.type === "RESULT") {
      router.push("/student/marks");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ASSIGNMENT":
        return <FileText className="w-4 h-4 text-gold-400" />;
      case "RESULT":
        return <Award className="w-4 h-4 text-emerald-400" />;
      case "APPROVAL":
        return <ShieldAlert className="w-4 h-4 text-maroon-300" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-navy-800 text-ivory-300 hover:text-gold-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-gold-500 text-navy-950 font-bold text-[10px] rounded-full px-1 shadow-goldGlow animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy-850 border border-navy-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-navy-900 border-b border-navy-700/80">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gold-400" />
              <span className="font-serif text-sm font-semibold text-ivory-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={isLoading}
                  className="text-xs text-gold-400/80 hover:text-gold-400 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-ivory-400 hover:text-ivory-100 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-navy-750/40">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-ivory-400 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    n.read
                      ? "bg-navy-850 hover:bg-navy-800 text-ivory-300"
                      : "bg-navy-800/90 hover:bg-navy-750 text-ivory-100 border-l-2 border-l-gold-500"
                  }`}
                >
                  <div className="p-2 rounded bg-navy-900 border border-navy-700 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ivory-100 truncate">
                      {n.title}
                    </p>
                    <p className="text-xs text-ivory-300/80 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-ivory-400/70 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
