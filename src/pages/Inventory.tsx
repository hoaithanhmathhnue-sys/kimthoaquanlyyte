import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";
import { Plus, Search, Filter, Edit, Trash2, AlertCircle } from "lucide-react";
import { formatDate, generateId } from "../lib/utils";
import dayjs from "dayjs";

export function Inventory() {
  const { medicines, categories, batches, addMedicine, updateMedicine, deleteMedicine } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<{ id: string; name: string; categoryId: string; unit: string; minStock: number } | null>(null);
  const [newMedicine, setNewMedicine] = useState({ name: "", categoryId: "", unit: "", minStock: 0 });

  const inventoryData = useMemo(() => {
    return medicines.map((medicine) => {
      const medicineBatches = batches.filter((b) => b.medicineId === medicine.id);
      const totalQuantity = medicineBatches.reduce((sum, b) => sum + b.quantity, 0);
      const category = categories.find((c) => c.id === medicine.categoryId);
      
      const hasExpiring = medicineBatches.some(b => {
        const daysToExpiry = dayjs(b.expiryDate).diff(dayjs(), "day");
        return daysToExpiry > 0 && daysToExpiry <= 90;
      });

      return {
        ...medicine,
        categoryName: category?.name || "Khác",
        totalQuantity,
        status: totalQuantity === 0 ? "Hết hàng" : totalQuantity < medicine.minStock ? "Sắp hết" : "Còn hàng",
        hasExpiring
      };
    }).filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [medicines, batches, categories, searchTerm, selectedCategory]);

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedicine.name || !newMedicine.categoryId || !newMedicine.unit) return;
    
    addMedicine({
      id: "m" + generateId(),
      name: newMedicine.name,
      categoryId: newMedicine.categoryId,
      unit: newMedicine.unit,
      minStock: Number(newMedicine.minStock),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    setIsAddModalOpen(false);
    setNewMedicine({ name: "", categoryId: "", unit: "", minStock: 0 });
  };

  const handleEdit = (item: typeof inventoryData[0]) => {
    setEditingMedicine({
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      unit: item.unit,
      minStock: item.minStock,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;
    updateMedicine(editingMedicine.id, {
      name: editingMedicine.name,
      categoryId: editingMedicine.categoryId,
      unit: editingMedicine.unit,
      minStock: editingMedicine.minStock,
    });
    setIsEditModalOpen(false);
    setEditingMedicine(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mục này?")) {
      deleteMedicine(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kho Thuốc & Vật Tư</h1>
          <p className="text-sm text-slate-500">Quản lý danh mục, tồn kho và cảnh báo.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Tìm tên thuốc, vật tư..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên thuốc/Vật tư</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead className="text-right">Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Không tìm thấy dữ liệu phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                inventoryData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {item.hasExpiring && (
                          <AlertCircle className="h-4 w-4 text-red-500" title="Có lô sắp hết hạn" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right font-mono">{item.totalQuantity}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.status === 'Còn hàng' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Sắp hết' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Thêm mới */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Thêm Thuốc/Vật tư mới">
        <form onSubmit={handleAddMedicine} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên thuốc/vật tư</label>
            <Input 
              required 
              value={newMedicine.name} 
              onChange={e => setNewMedicine({...newMedicine, name: e.target.value})} 
              placeholder="VD: Paracetamol 500mg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Danh mục</label>
            <select 
              required
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={newMedicine.categoryId}
              onChange={e => setNewMedicine({...newMedicine, categoryId: e.target.value})}
            >
              <option value="" disabled>Chọn danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Đơn vị tính</label>
              <Input 
                required 
                value={newMedicine.unit} 
                onChange={e => setNewMedicine({...newMedicine, unit: e.target.value})} 
                placeholder="VD: Viên, Hộp..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tồn kho tối thiểu</label>
              <Input 
                type="number" 
                required 
                min="0"
                value={newMedicine.minStock} 
                onChange={e => setNewMedicine({...newMedicine, minStock: Number(e.target.value)})} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Lưu lại</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingMedicine(null); }} title="Chỉnh sửa Thuốc/Vật tư">
        {editingMedicine && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tên thuốc/vật tư</label>
              <Input 
                required 
                value={editingMedicine.name} 
                onChange={e => setEditingMedicine({...editingMedicine, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Danh mục</label>
              <select 
                required
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={editingMedicine.categoryId}
                onChange={e => setEditingMedicine({...editingMedicine, categoryId: e.target.value})}
              >
                <option value="" disabled>Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Đơn vị tính</label>
                <Input 
                  required 
                  value={editingMedicine.unit} 
                  onChange={e => setEditingMedicine({...editingMedicine, unit: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tồn kho tối thiểu</label>
                <Input 
                  type="number" 
                  required 
                  min="0"
                  value={editingMedicine.minStock} 
                  onChange={e => setEditingMedicine({...editingMedicine, minStock: Number(e.target.value)})} 
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingMedicine(null); }}>Hủy</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Cập nhật</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
