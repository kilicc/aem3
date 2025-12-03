"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

interface WorkOrder {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  scheduled_date: string | null;
  customer?: {
    name: string;
  };
}

interface WorkCalendarProps {
  workOrders: WorkOrder[];
}

export default function WorkCalendar({ workOrders }: WorkCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = currentDate.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  const workOrdersByDate = useMemo(() => {
    const map = new Map<string, WorkOrder[]>();
    workOrders.forEach((wo) => {
      if (wo.scheduled_date) {
        const date = new Date(wo.scheduled_date).toISOString().split("T")[0];
        if (!map.has(date)) {
          map.set(date, []);
        }
        map.get(date)!.push(wo);
      }
    });
    return map;
  }, [workOrders]);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-500";
      case "high":
        return "border-orange-500";
      case "normal":
        return "border-gray-300";
      default:
        return "border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            İş Takvimi
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[180px] text-center">
              {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dateString = getDateString(day);
            const dayWorkOrders = workOrdersByDate.get(dateString) || [];
            const todayClass = isToday(day) ? "ring-2 ring-primary" : "";

            return (
              <div
                key={day}
                className={`aspect-square border rounded-lg p-1 overflow-hidden ${getPriorityColor(
                  dayWorkOrders[0]?.priority || "low"
                )} ${todayClass} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
              >
                <div className="text-xs font-medium mb-1">{day}</div>
                <div className="space-y-0.5 max-h-full overflow-y-auto">
                  {dayWorkOrders.slice(0, 3).map((wo) => (
                    <Link
                      key={wo.id}
                      href={`/is-emri/${wo.id}`}
                      className="block"
                      title={`${wo.customer?.name || ""} - ${wo.order_number}`}
                    >
                      <div
                        className={`text-[10px] px-1 py-0.5 rounded ${getStatusColor(
                          wo.status
                        )} text-white hover:opacity-80 transition-opacity`}
                      >
                        <div className="font-semibold truncate">
                          {wo.customer?.name || "Müşteri Yok"}
                        </div>
                        <div className="text-[9px] opacity-90 truncate">
                          {wo.order_number}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {dayWorkOrders.length > 3 && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1">
                      +{dayWorkOrders.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Beklemede</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>İşlemde</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Tamamlandı</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

