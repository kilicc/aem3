import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Warehouse, Package, Wrench, BarChart3, Building2, Shirt, Calendar } from "lucide-react";
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
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Link href="/depo/warehouses" className="group">
            <div className="relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-0.5">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-100 dark:bg-blue-900/50 p-3 group-hover:scale-110 transition-transform duration-200">
                    <Warehouse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Depolar
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Depo yönetimi
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/depo/products" className="group">
            <div className="relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 hover:-translate-y-0.5">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-green-100 dark:bg-green-900/50 p-3 group-hover:scale-110 transition-transform duration-200">
                    <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Ürünler
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ürün/Malzeme yönetimi
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/depo/tools" className="group">
            <div className="relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 hover:-translate-y-0.5">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-purple-100 dark:bg-purple-900/50 p-3 group-hover:scale-110 transition-transform duration-200">
                    <Wrench className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Araç-Gereçler
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Araç-gereç yönetimi
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/depo/stock" className="group">
            <div className="relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 hover:-translate-y-0.5">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-orange-100 dark:bg-orange-900/50 p-3 group-hover:scale-110 transition-transform duration-200">
                    <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Stok Yönetimi
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Stok ekle/düzenle
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/depo/fixed-assets" className="group">
            <div className="relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:-translate-y-0.5">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-indigo-100 dark:bg-indigo-900/50 p-3 group-hover:scale-110 transition-transform duration-200">
                    <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Demirbaşlar
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Demirbaş yönetimi
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/depo/equipment" className="group">
            <div className="relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-600 hover:-translate-y-0.5">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-pink-100 dark:bg-pink-900/50 p-3 group-hover:scale-110 transition-transform duration-200">
                    <Shirt className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Ekipmanlar
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ekipman yönetimi
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/depo/periodic-products" className="group">
            <div className="relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 hover:-translate-y-0.5">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-teal-100 dark:bg-teal-900/50 p-3 group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Periyodik Ürünler
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Takip ve bildirimler
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
