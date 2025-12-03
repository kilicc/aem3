"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockTable from "@/modules/depo/components/StockTable";
import { createClient } from "@/lib/supabase/client";

export default function StockList() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"products" | "tools">("products");
  const [productsStock, setProductsStock] = useState<any[]>([]);
  const [toolsStock, setToolsStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        // Ürün stokları
        const { data: productsData } = await supabase
          .from("warehouse_stock")
          .select(`
            *,
            warehouse:warehouses!warehouse_stock_warehouse_id_fkey(id, name),
            product:products!warehouse_stock_product_id_fkey(id, name, unit:units!products_unit_id_fkey(name, symbol))
          `)
          .not("product_id", "is", null)
          .order("last_updated_at", { ascending: false });

        // Araç-gereç stokları
        const { data: toolsData } = await supabase
          .from("warehouse_stock")
          .select(`
            *,
            warehouse:warehouses!warehouse_stock_warehouse_id_fkey(id, name),
            tool:tools!warehouse_stock_tool_id_fkey(id, name)
          `)
          .not("tool_id", "is", null)
          .order("last_updated_at", { ascending: false });

        setProductsStock(productsData || []);
        setToolsStock(toolsData || []);
      } catch (error) {
        console.error("Stok verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [supabase]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mevcut Stok Durumu</CardTitle>
          <Link href="/depo/stock/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Stok Ekle/Güncelle
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "products" | "tools")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Malzeme Stokları</TabsTrigger>
            <TabsTrigger value="tools">Araç/Gereç Stokları</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Yükleniyor...
              </div>
            ) : productsStock.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Henüz malzeme stoku bulunmamaktadır.
              </div>
            ) : (
              <StockTable
                stock={productsStock}
                currentPage={1}
                totalPages={1}
                totalCount={productsStock.length}
              />
            )}
          </TabsContent>
          <TabsContent value="tools" className="mt-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Yükleniyor...
              </div>
            ) : toolsStock.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Henüz araç/gereç stoku bulunmamaktadır.
              </div>
            ) : (
              <StockTable
                stock={toolsStock}
                currentPage={1}
                totalPages={1}
                totalCount={toolsStock.length}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

