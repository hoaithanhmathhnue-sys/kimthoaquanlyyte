import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FileDown, Printer } from "lucide-react";
import { Button } from "../components/ui/Button";
import { exportReportToExcel } from "../services/excelService";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Reports() {
  const { medicines, categories, batches } = useApp();

  const categoryData = useMemo(() => {
    return categories.map(cat => {
      const catMedicines = medicines.filter(m => m.categoryId === cat.id);
      const totalItems = catMedicines.length;
      return { name: cat.name, value: totalItems };
    }).filter(d => d.value > 0);
  }, [medicines, categories]);

  const inventoryData = useMemo(() => {
    return medicines.map(medicine => {
      const medicineBatches = batches.filter(b => b.medicineId === medicine.id);
      const totalQuantity = medicineBatches.reduce((sum, b) => sum + b.quantity, 0);
      const category = categories.find(c => c.id === medicine.categoryId);
      return {
        name: medicine.name,
        categoryName: category?.name || "Khác",
        unit: medicine.unit,
        totalQuantity,
        minStock: medicine.minStock,
        status: totalQuantity === 0 ? "Hết hàng" : totalQuantity < medicine.minStock ? "Sắp hết" : "Còn hàng",
      };
    });
  }, [medicines, batches, categories]);

  const expiringCount = useMemo(() => {
    return batches.filter(b => {
      const days = (new Date(b.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return days > 0 && days <= 90;
    }).length;
  }, [batches]);

  const handleExportExcel = () => {
    exportReportToExcel(inventoryData, batches.length, expiringCount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Báo cáo & Thống kê</h1>
          <p className="text-sm text-slate-500">Tổng hợp dữ liệu xuất nhập tồn và tình hình kho.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-slate-600 border-slate-200 hover:bg-slate-50" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> In báo cáo
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleExportExcel}>
            <FileDown className="mr-2 h-4 w-4" /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-xl font-bold">BÁO CÁO TỒN KHO VẬT TƯ Y TẾ</h1>
        <p className="text-sm text-gray-500">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
        <Card className="print:shadow-none print:border">
          <CardHeader>
            <CardTitle>Cơ cấu danh mục thuốc & vật tư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full print:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border">
          <CardHeader>
            <CardTitle>Báo cáo tồn kho theo lô</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <h4 className="font-medium text-slate-900">Tổng số lô hàng</h4>
                  <p className="text-2xl font-bold text-emerald-600">{batches.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  📦
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <h4 className="font-medium text-slate-900">Lô hàng sắp hết hạn</h4>
                  <p className="text-2xl font-bold text-amber-600">{expiringCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  ⚠️
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <h4 className="font-medium text-slate-900">Mặt hàng dưới tồn tối thiểu</h4>
                  <p className="text-2xl font-bold text-red-600">{inventoryData.filter(d => d.status === 'Sắp hết' || d.status === 'Hết hàng').length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  🔴
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print-only table */}
      <div className="hidden print:block">
        <Card className="shadow-none border">
          <CardHeader>
            <CardTitle>Chi tiết tồn kho</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Tên</th>
                  <th className="text-left py-2 px-2">Danh mục</th>
                  <th className="text-left py-2 px-2">ĐVT</th>
                  <th className="text-right py-2 px-2">Tồn kho</th>
                  <th className="text-right py-2 px-2">Tối thiểu</th>
                  <th className="text-left py-2 px-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-1.5 px-2">{item.name}</td>
                    <td className="py-1.5 px-2">{item.categoryName}</td>
                    <td className="py-1.5 px-2">{item.unit}</td>
                    <td className="py-1.5 px-2 text-right">{item.totalQuantity}</td>
                    <td className="py-1.5 px-2 text-right">{item.minStock}</td>
                    <td className="py-1.5 px-2">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
