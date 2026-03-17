import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { generateId } from "../lib/utils";

const emptySupplier = { name: "", contactPerson: "", phone: "", address: "", email: "" };

export function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState(emptySupplier);
  const [editId, setEditId] = useState("");

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier({ id: "s" + generateId(), ...form });
    setIsAddOpen(false);
    setForm(emptySupplier);
  };

  const openEdit = (s: typeof suppliers[0]) => {
    setEditId(s.id);
    setForm({ name: s.name, contactPerson: s.contactPerson, phone: s.phone, address: s.address, email: s.email });
    setIsEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupplier(editId, form);
    setIsEditOpen(false);
    setForm(emptySupplier);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      deleteSupplier(id);
    }
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, submitLabel: string) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Tên nhà cung cấp</label>
        <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Công ty Dược phẩm..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Người liên hệ</label>
          <Input required value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} placeholder="Nguyễn Văn A" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
          <Input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0901234567" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="contact@company.com" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
        <Input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="123 Đường ABC, TP.HCM" />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); setForm(emptySupplier); }}>Hủy</Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">{submitLabel}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nhà cung cấp</h1>
          <p className="text-sm text-slate-500">Quản lý đối tác cung cấp thuốc và vật tư y tế.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setForm(emptySupplier); setIsAddOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Thêm nhà cung cấp
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input placeholder="Tìm nhà cung cấp..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên nhà cung cấp</TableHead>
                <TableHead>Người liên hệ</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">Không tìm thấy nhà cung cấp.</TableCell>
                </TableRow>
              ) : (
                filtered.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEdit(supplier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(supplier.id)}>
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

      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setForm(emptySupplier); }} title="Thêm nhà cung cấp mới">
        {renderForm(handleAdd, "Lưu lại")}
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setForm(emptySupplier); }} title="Chỉnh sửa nhà cung cấp">
        {renderForm(handleEdit, "Cập nhật")}
      </Modal>
    </div>
  );
}
