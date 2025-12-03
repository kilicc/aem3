"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ClipboardList, Package, FileText, Users, Wrench, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  sent_at: string;
  related_type: string | null;
  related_id: string | null;
}

interface NotificationsListProps {
  groupedNotifications: Record<string, Notification[]>;
  totalCount: number;
  unreadOnly?: boolean;
}

const groupLabels: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  work_order: { label: "İş Emirleri", icon: ClipboardList, color: "text-red-600 dark:text-red-400" },
  warehouse_stock: { label: "Stok İşlemleri", icon: Package, color: "text-blue-600 dark:text-blue-400" },
  invoice: { label: "Faturalar", icon: FileText, color: "text-green-600 dark:text-green-400" },
  customer: { label: "Müşteriler", icon: Users, color: "text-purple-600 dark:text-purple-400" },
  tool_assignment: { label: "Araç-Gereçler", icon: Wrench, color: "text-orange-600 dark:text-orange-400" },
  other: { label: "Diğer", icon: ClipboardList, color: "text-gray-600 dark:text-gray-400" },
};

export default function NotificationsList({
  groupedNotifications,
  totalCount,
  unreadOnly,
}: NotificationsListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [marking, setMarking] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Varsayılan olarak tüm grupları açık tut
    const expanded: Record<string, boolean> = {};
    Object.keys(groupedNotifications).forEach((key) => {
      expanded[key] = true;
    });
    return expanded;
  });

  const handleMarkAsRead = async (id: string) => {
    setMarking(id);
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);
    router.refresh();
    setMarking(null);
  };

  const getRelatedLink = (notification: Notification) => {
    if (notification.related_type === "work_order" && notification.related_id) {
      return `/is-emri/${notification.related_id}`;
    }
    if (notification.related_type === "invoice" && notification.related_id) {
      return `/fatura/${notification.related_id}`;
    }
    if (notification.related_type === "customer" && notification.related_id) {
      return `/musteri/${notification.related_id}`;
    }
    if (notification.related_type === "warehouse_stock" && notification.related_id) {
      return `/depo/stock`;
    }
    if (notification.related_type === "tool_assignment" && notification.related_id) {
      return `/depo/tools/assignments`;
    }
    return null;
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const renderNotification = (notification: Notification) => {
    const link = getRelatedLink(notification);
    const unreadCount = groupedNotifications[notification.related_type || "other"]?.filter((n) => !n.is_read).length || 0;

    const content = (
      <Card
        className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
          !notification.is_read
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
            : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {notification.title}
                </h3>
                {!notification.is_read && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {new Date(notification.sent_at).toLocaleString("tr-TR")}
              </p>
            </div>
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMarkAsRead(notification.id);
                }}
                disabled={marking === notification.id}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );

    if (link) {
      return (
        <Link key={notification.id} href={link} className="block">
          {content}
        </Link>
      );
    }

    return <div key={notification.id}>{content}</div>;
  };

  const groupKeys = Object.keys(groupedNotifications).sort((a, b) => {
    // Önce okunmamış bildirimi olan gruplar
    const aUnread = groupedNotifications[a]?.filter((n) => !n.is_read).length || 0;
    const bUnread = groupedNotifications[b]?.filter((n) => !n.is_read).length || 0;
    if (aUnread !== bUnread) {
      return bUnread - aUnread;
    }
    // Sonra en yeni bildirime göre
    const aLatest = groupedNotifications[a]?.[0]?.sent_at || "";
    const bLatest = groupedNotifications[b]?.[0]?.sent_at || "";
    return bLatest.localeCompare(aLatest);
  });

  if (totalCount === 0 || groupKeys.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Bildirim bulunmamaktadır.</p>
          <p className="text-sm">Yeni bildirimler burada görünecektir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groupKeys.map((groupKey) => {
        const notifications = groupedNotifications[groupKey] || [];
        const unreadCount = notifications.filter((n) => !n.is_read).length;
        const groupInfo = groupLabels[groupKey] || groupLabels.other;
        const Icon = groupInfo.icon;
        const isExpanded = expandedGroups[groupKey] !== false;

        return (
          <Card key={groupKey} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => toggleGroup(groupKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${groupInfo.color}`} />
                  <CardTitle className="text-base sm:text-lg">
                    {groupInfo.label}
                  </CardTitle>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {notifications.length}
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      {unreadCount} okunmamış
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {notifications.map((notification) => renderNotification(notification))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      <div className="text-sm text-gray-500 dark:text-gray-400 text-center pt-4 border-t">
        Toplam {totalCount} bildirim
      </div>
    </div>
  );
}
