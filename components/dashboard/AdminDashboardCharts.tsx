"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardChartsProps {
  last7Days: { date: string; count: number }[];
  workOrderStatusData: { name: string; value: number; color: string }[];
  priorityData: { name: string; value: number }[];
}

export default function AdminDashboardCharts({
  last7Days,
  workOrderStatusData,
  priorityData,
}: AdminDashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* İş Emri Trendi */}
      <Card>
        <CardHeader>
          <CardTitle>İş Emri Trendi (Son 7 Gün)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="İş Emri Sayısı"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* İş Emri Durumları */}
      <Card>
        <CardHeader>
          <CardTitle>İş Emri Durumları</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={workOrderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {workOrderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Öncelik Dağılımı */}
      <Card>
        <CardHeader>
          <CardTitle>Öncelik Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8b5cf6" name="İş Emri Sayısı" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
