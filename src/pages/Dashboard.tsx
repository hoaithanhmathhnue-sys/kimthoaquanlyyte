import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Activity } from "lucide-react";
import { formatCurrency, formatDate } from "../lib/utils";
import dayjs from "dayjs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export function Dashboard() {
  const { medicines, batches, transactions } = useApp();

  const stats = useMemo(() => {
    const totalMedicines = medicines.length;
    const lowStockCount = medicines.filter((m) => {
      const totalQuantity = batches
        .filter((b) => b.medicineId === m.id)
        .reduce((sum, b) => sum + b.quantity, 0);
      return totalQuantity < m.minStock;
    }).length;

    const expiringSoonCount = batches.filter((b) => {
      const daysToExpiry = dayjs(b.expiryDate).diff(dayjs(), "day");
      return daysToExpiry > 0 && daysToExpiry <= 90; // Expiring in 90 days
    }).length;

    const totalImportValue = batches.reduce((sum, b) => sum + b.quantity * b.importPrice, 0);

    return { totalMedicines, lowStockCount, expiringSoonCount, totalImportValue };
  }, [medicines, batches]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5).map((t) => {
      const batch = batches.find((b) => b.id === t.batchId);
      const medicine = medicines.find((m) => m.id === batch?.medicineId);
      return { ...t, medicineName: medicine?.name || "Unknown", batchNumber: batch?.batchNumber };
    });
  }, [transactions, batches, medicines]);

  const transactionData = useMemo(() => {
    // Group by last 7 days
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, "day").format("DD/MM");
      const dayTransactions = transactions.filter((t) => dayjs(t.date).format("DD/MM") === date);
      
      const importQty = dayTransactions.filter((t) => t.type === "IMPORT").reduce((sum, t) => sum + t.quantity, 0);
      const exportQty = dayTransactions.filter((t) => t.type !== "IMPORT").reduce((sum, t) => sum + t.quantity, 0);
      
      data.push({ name: date, Nhập: importQty, Xuất: exportQty });
    }
    return data;
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tổng quan</h1>
          <p className="text-sm text-slate-500">Theo dõi tình hình kho thuốc và vật tư y tế.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng danh mục</CardTitle>
            <Package className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedicines}</div>
            <p className="text-xs text-slate-500">Thuốc & vật tư đang quản lý</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.lowStockCount}</div>
            <p className="text-xs text-slate-500">Dưới mức tồn kho tối thiểu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hạn</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiringSoonCount}</div>
            <p className="text-xs text-slate-500">Hết hạn trong 90 ngày tới</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị kho</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalImportValue)}</div>
            <p className="text-xs text-slate-500">Dựa trên giá nhập lô hàng</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Lưu lượng Nhập/Xuất 7 ngày qua</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Nhập" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Xuất" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center">
                  <div className={`mr-4 rounded-full p-2 ${t.type === 'IMPORT' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {t.type === 'IMPORT' ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{t.medicineName}</p>
                    <p className="text-xs text-slate-500">
                      Lô: {t.batchNumber} • {t.type === 'IMPORT' ? 'Nhập' : 'Xuất'} {t.quantity}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">{formatDate(t.date)}</div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="text-center text-sm text-slate-500 py-4">Chưa có giao dịch nào</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
