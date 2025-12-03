"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignTool } from "../actions/tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Warehouse {
  id: string;
  name: string;
}

interface Tool {
  id: string;
  name: string;
  serial_number: string | null;
}

interface User {
  id: string;
  full_name: string | null;
  email: string;
}

interface ToolAssignmentFormProps {
  warehouses: Warehouse[];
  tools: Tool[];
  users: User[];
}

export default function ToolAssignmentForm({
  warehouses,
  tools,
  users,
}: ToolAssignmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await assignTool(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/depo/tools/assignments");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Zimmet Oluştur</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tool_id">Araç-Gereç *</Label>
            <Select id="tool_id" name="tool_id" required>
              <option value="">Araç-gereç seçin</option>
              {tools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name} {tool.serial_number && `(${tool.serial_number})`}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="warehouse_id">Depo *</Label>
            <Select id="warehouse_id" name="warehouse_id" required>
              <option value="">Depo seçin</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="assigned_to">Zimmetli Kullanıcı *</Label>
            <Select id="assigned_to" name="assigned_to" required>
              <option value="">Kullanıcı seçin</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notlar</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
