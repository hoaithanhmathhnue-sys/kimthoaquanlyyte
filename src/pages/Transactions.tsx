import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { ArrowDownToLine, ArrowUpFromLine, Search, Filter, Plus } from "lucide-react";
import { formatDate } from "../lib/utils";

export function Transactions() {
  const { transactions, batches, medicines, users } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const transactionData = useMemo(() => {
    return transactions.map((t) => {
      const batch = batches.find((b) => b.id === t.batchId);
      const medicine = medicines.find((m) => m.id === batch?.medicineId);
      const user = users.find((u) => u.id === t.userId);

      return {
        ...t,
        medicineName: medicine?.name || "Unknown",
        batchNumber: batch?.batchNumber || "Unknown",
        userName: user?.name || "Unknown",
      };
    }).filter(item => {
      const matchesSearch = item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "ALL" || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, batches, medicines, users, searchTerm, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Giao dịch</h1>
          <p className="text-sm text-slate-500">Lịch sử nhập, xuất, cấp phát thuốc và vật tư.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <ArrowDownToLine className="mr-2 h-4 w-4" /> Nhập kho
          </Button>
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <ArrowUpFromLine className="mr-2 h-4 w-4" /> Xuất kho
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Tìm tên thuốc, số lô..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">Tất cả loại giao dịch</option>
                <option value="IMPORT">Nhập kho</option>
                <option value="EXPORT">Xuất kho</option>
                <option value="DISPENSE">Cấp phát</option>
                <option value="TRANSFER">Điều chuyển</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Thuốc/Vật tư</TableHead>
                <TableHead>Số lô</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Không tìm thấy dữ liệu phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                transactionData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(item.date, "DD/MM/YYYY HH:mm")}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.type === 'IMPORT' ? 'bg-emerald-100 text-emerald-800' :
                        item.type === 'EXPORT' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'DISPENSE' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {item.type === 'IMPORT' ? 'Nhập' : 
                         item.type === 'EXPORT' ? 'Xuất' : 
                         item.type === 'DISPENSE' ? 'Cấp phát' : 'Điều chuyển'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{item.medicineName}</TableCell>
                    <TableCell className="font-mono text-slate-500">{item.batchNumber}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={item.type === 'IMPORT' ? 'text-emerald-600' : 'text-blue-600'}>
                        {item.type === 'IMPORT' ? '+' : '-'}{item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{item.userName}</TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">
                      {item.note || item.patientName || item.department}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
