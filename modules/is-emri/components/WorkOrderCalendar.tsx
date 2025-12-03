"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkOrder {
  id: string;
  order_number: string;
  scheduled_date: string;
  status: string;
  priority: string;
  customer?: {
    name: string;
  } | null;
  service?: {
    name: string;
  } | null;
}

interface WorkOrderCalendarProps {
  workOrders: WorkOrder[];
}

export default function WorkOrderCalendar({
  workOrders,
}: WorkOrderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  const getWorkOrdersForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return workOrders.filter((wo) => wo.scheduled_date.startsWith(dateStr));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Bugün
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2"
            >
              {day}
            </div>
          ))}

          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="p-2" />;
            }

            const dayWorkOrders = getWorkOrdersForDate(date);
            const isToday =
              date.toDateString() === new Date().toDateString();

            return (
              <div
                key={date.toISOString()}
                className={`min-h-24 p-2 border rounded-lg ${
                  isToday
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayWorkOrders.slice(0, 3).map((wo) => (
                    <Link
                      key={wo.id}
                      href={`/is-emri/${wo.id}`}
                      className={`block text-xs p-1 rounded ${
                        wo.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : wo.status === "in_progress"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : wo.priority === "urgent"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                      title={`${wo.customer?.name || "Müşteri Yok"} - ${wo.order_number}`}
                    >
                      <div className="font-semibold truncate">
                        {wo.customer?.name || "Müşteri Yok"}
                      </div>
                      <div className="text-[10px] opacity-80 truncate">
                        {wo.order_number}
                      </div>
                    </Link>
                  ))}
                  {dayWorkOrders.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayWorkOrders.length - 3} daha
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
