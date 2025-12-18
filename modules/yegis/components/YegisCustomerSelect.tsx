"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  tax_id: string | null;
  tax_office: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
}

interface YegisCustomerSelectProps {
  customers: Customer[];
}

export default function YegisCustomerSelect({ customers }: YegisCustomerSelectProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.tax_id?.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone?.includes(search)
  );

  const handleSelectCustomer = (customerId: string) => {
    router.push(`/yegis/new/${customerId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Müşteri Seçin</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Müşteri adı, vergi no veya telefon ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {search ? "Müşteri bulunamadı" : "Müşteri bulunamadı"}
              </p>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleSelectCustomer(customer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        {customer.tax_id && (
                          <p>Vergi No: {customer.tax_id}</p>
                        )}
                        {customer.tax_office && (
                          <p>Vergi Dairesi: {customer.tax_office}</p>
                        )}
                        {customer.phone && (
                          <p>Telefon: {customer.phone}</p>
                        )}
                        {customer.address && (
                          <p>Adres: {customer.address}</p>
                        )}
                        {(customer.city || customer.district) && (
                          <p>
                            {customer.city}
                            {customer.district && ` / ${customer.district}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 ml-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

