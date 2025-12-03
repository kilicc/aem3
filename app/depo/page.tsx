import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Warehouse, Package, Wrench, BarChart3 } from "lucide-react";
import StockList from "@/components/depo/StockList";

export default async function DepoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Depo Yönetimi
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Depo, ürün, araç-gereç ve stok yönetimi
          </p>
        </div>

        {/* Hızlı Erişim Kartları */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/depo/warehouses">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-shadow hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                  <Warehouse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Depolar
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Depo yönetimi
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/depo/products">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-shadow hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Ürünler
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ürün/Malzeme yönetimi
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/depo/tools">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-shadow hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
                  <Wrench className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Araç-Gereçler
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Araç-gereç yönetimi
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/depo/stock">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow transition-shadow hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-3">
                  <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Stok Yönetimi
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Stok ekle/düzenle
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stok Listesi */}
        <StockList />
      </div>
    </AppLayout>
  );
}
