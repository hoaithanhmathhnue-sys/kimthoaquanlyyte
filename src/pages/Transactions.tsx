import React, { useState, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";
import { ArrowDownToLine, ArrowUpFromLine, Search, Filter, FileUp, FileDown, Download } from "lucide-react";
import { formatDate, generateId } from "../lib/utils";
import { generateImportTemplate, parseImportExcel, exportInventoryToExcel } from "../services/excelService";

export function Transactions() {
  const { transactions, batches, medicines, categories, suppliers, users, addTransaction, addBatch, addMedicine } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import form state
  const [importForm, setImportForm] = useState({
    medicineId: "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    quantity: 0,
    importPrice: 0,
    supplierId: "",
    note: "",
  });

  // Export form state
  const [exportForm, setExportForm] = useState({
    batchId: "",
    quantity: 0,
    department: "",
    note: "",
  });

  const transactionData = useMemo(() => {
    return transactions.map((t) => {
      const batch = batches.find((b) => b.id === t.batchId);
      const medicine = medicines.find((m) => m.id === batch?.medicineId);
      const user = users.find((u) => u.id === t.userId);

      return {
        ...t,
        medicineName: medicine?.name || "Unknown",
        batchNumber: batch?.batchNumber || "Unknown",
        userName: user?.name || "Admin",
      };
    }).filter(item => {
      const matchesSearch = item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "ALL" || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, batches, medicines, users, searchTerm, typeFilter]);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    const batchId = "b" + generateId();
    
    // Create new batch
    addBatch({
      id: batchId,
      medicineId: importForm.medicineId,
      batchNumber: importForm.batchNumber,
      manufactureDate: importForm.manufactureDate,
      expiryDate: importForm.expiryDate,
      quantity: Number(importForm.quantity),
      supplierId: importForm.supplierId,
      importPrice: Number(importForm.importPrice),
      createdAt: new Date().toISOString(),
    });

    // Create import transaction
    addTransaction({
      id: "t" + generateId(),
      type: "IMPORT",
      batchId,
      quantity: Number(importForm.quantity),
      date: new Date().toISOString(),
      userId: "u1",
      note: importForm.note || "Nhập kho",
    });

    setIsImportOpen(false);
    setImportForm({ medicineId: "", batchNumber: "", manufactureDate: "", expiryDate: "", quantity: 0, importPrice: 0, supplierId: "", note: "" });
  };

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find(b => b.id === exportForm.batchId);
    if (!batch || batch.quantity < exportForm.quantity) {
      alert("Số lượng xuất vượt quá tồn kho của lô hàng!");
      return;
    }

    addTransaction({
      id: "t" + generateId(),
      type: "EXPORT",
      batchId: exportForm.batchId,
      quantity: Number(exportForm.quantity),
      date: new Date().toISOString(),
      userId: "u1",
      department: exportForm.department,
      note: exportForm.note || "Xuất kho",
    });

    setIsExportOpen(false);
    setExportForm({ batchId: "", quantity: 0, department: "", note: "" });
  };

  // Build batch options with medicine name for export
  const batchOptions = useMemo(() => {
    return batches.filter(b => b.quantity > 0).map(b => {
      const med = medicines.find(m => m.id === b.medicineId);
      return { ...b, medicineName: med?.name || "Unknown" };
    });
  }, [batches, medicines]);

  const handleDownloadTemplate = () => {
    generateImportTemplate();
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseImportExcel(file);
      let importedCount = 0;
      for (const row of rows) {
        if (!row.medicineName || !row.batchNumber || row.quantity <= 0) continue;

        // Find or create medicine
        let med = medicines.find(m => m.name.toLowerCase() === row.medicineName.toLowerCase());
        if (!med) {
          const newId = "m" + generateId();
          addMedicine({
            id: newId,
            name: row.medicineName,
            categoryId: categories[0]?.id || "c1",
            unit: "Đơn vị",
            minStock: 100,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          med = { id: newId, name: row.medicineName, categoryId: categories[0]?.id || "c1", unit: "Đơn vị", minStock: 100, createdAt: "", updatedAt: "" };
        }

        // Find supplier
        const sup = suppliers.find(s => s.name.toLowerCase() === row.supplierName.toLowerCase());

        const batchId = "b" + generateId();
        addBatch({
          id: batchId,
          medicineId: med.id,
          batchNumber: row.batchNumber,
          manufactureDate: row.manufactureDate || new Date().toISOString(),
          expiryDate: row.expiryDate || new Date().toISOString(),
          quantity: row.quantity,
          supplierId: sup?.id || suppliers[0]?.id || "s1",
          importPrice: row.importPrice,
          createdAt: new Date().toISOString(),
        });

        addTransaction({
          id: "t" + generateId(),
          type: "IMPORT",
          batchId,
          quantity: row.quantity,
          date: new Date().toISOString(),
          userId: "u1",
          note: `Nhập từ Excel: ${row.medicineName}`,
        });
        importedCount++;
      }
      alert(`Đã nhập thành công ${importedCount} lô hàng từ file Excel!`);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportExcel = () => {
    const inventoryData = medicines.map(m => {
      const mBatches = batches.filter(b => b.medicineId === m.id);
      const totalQty = mBatches.reduce((s, b) => s + b.quantity, 0);
      const cat = categories.find(c => c.id === m.categoryId);
      return {
        name: m.name,
        categoryName: cat?.name || "Khác",
        unit: m.unit,
        totalQuantity: totalQty,
        minStock: m.minStock,
        status: totalQty === 0 ? "Hết hàng" : totalQty < m.minStock ? "Sắp hết" : "Còn hàng",
      };
    });
    exportInventoryToExcel(inventoryData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Giao dịch</h1>
          <p className="text-sm text-slate-500">Lịch sử nhập, xuất, cấp phát thuốc và vật tư.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsImportOpen(true)}>
            <ArrowDownToLine className="mr-2 h-4 w-4" /> Nhập kho
          </Button>
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsExportOpen(true)}>
            <ArrowUpFromLine className="mr-2 h-4 w-4" /> Xuất kho
          </Button>
          <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="mr-2 h-4 w-4" /> Nhập từ Excel
          </Button>
          <Button variant="outline" className="text-slate-600 border-slate-200 hover:bg-slate-50" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" /> Tải file mẫu
          </Button>
          <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={handleExportExcel}>
            <FileDown className="mr-2 h-4 w-4" /> Xuất Excel
          </Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelImport} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Tìm tên thuốc, số lô..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

      {/* Modal Nhập kho */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Nhập kho mới">
        <form onSubmit={handleImport} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Thuốc/Vật tư</label>
            <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={importForm.medicineId} onChange={e => setImportForm({...importForm, medicineId: e.target.value})}>
              <option value="" disabled>Chọn thuốc/vật tư</option>
              {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Số lô</label>
              <Input required value={importForm.batchNumber} onChange={e => setImportForm({...importForm, batchNumber: e.target.value})} placeholder="VD: AMX202403" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nhà cung cấp</label>
              <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={importForm.supplierId} onChange={e => setImportForm({...importForm, supplierId: e.target.value})}>
                <option value="" disabled>Chọn NCC</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ngày sản xuất</label>
              <Input type="date" required value={importForm.manufactureDate} onChange={e => setImportForm({...importForm, manufactureDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ngày hết hạn</label>
              <Input type="date" required value={importForm.expiryDate} onChange={e => setImportForm({...importForm, expiryDate: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Số lượng</label>
              <Input type="number" required min="1" value={importForm.quantity || ""} onChange={e => setImportForm({...importForm, quantity: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Giá nhập (VND/đơn vị)</label>
              <Input type="number" required min="0" value={importForm.importPrice || ""} onChange={e => setImportForm({...importForm, importPrice: Number(e.target.value)})} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Ghi chú</label>
            <Input value={importForm.note} onChange={e => setImportForm({...importForm, note: e.target.value})} placeholder="Ghi chú..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Nhập kho</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Xuất kho */}
      <Modal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} title="Xuất kho">
        <form onSubmit={handleExport} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Chọn lô hàng</label>
            <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={exportForm.batchId} onChange={e => setExportForm({...exportForm, batchId: e.target.value})}>
              <option value="" disabled>Chọn lô hàng</option>
              {batchOptions.map(b => (
                <option key={b.id} value={b.id}>{b.medicineName} — Lô: {b.batchNumber} (Tồn: {b.quantity})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Số lượng xuất</label>
              <Input type="number" required min="1" value={exportForm.quantity || ""} onChange={e => setExportForm({...exportForm, quantity: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Khoa/Phòng nhận</label>
              <Input required value={exportForm.department} onChange={e => setExportForm({...exportForm, department: e.target.value})} placeholder="VD: Khoa Nội" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Ghi chú</label>
            <Input value={exportForm.note} onChange={e => setExportForm({...exportForm, note: e.target.value})} placeholder="Ghi chú..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsExportOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Xuất kho</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
