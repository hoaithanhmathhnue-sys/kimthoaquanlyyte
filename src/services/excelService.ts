import * as XLSX from 'xlsx';

interface InventoryRow {
  name: string;
  categoryName: string;
  unit: string;
  totalQuantity: number;
  minStock: number;
  status: string;
}

interface ImportRow {
  medicineName: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  importPrice: number;
  supplierName: string;
}

/** Xuất danh sách tồn kho ra Excel */
export function exportInventoryToExcel(data: InventoryRow[]) {
  const ws = XLSX.utils.json_to_sheet(data.map(d => ({
    'Tên thuốc/Vật tư': d.name,
    'Danh mục': d.categoryName,
    'Đơn vị': d.unit,
    'Tồn kho': d.totalQuantity,
    'Tồn tối thiểu': d.minStock,
    'Trạng thái': d.status,
  })));

  // Adjust column widths
  ws['!cols'] = [
    { wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tồn kho');
  XLSX.writeFile(wb, `Ton_kho_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/** Xuất báo cáo thống kê ra Excel */
export function exportReportToExcel(
  inventoryData: InventoryRow[],
  batchCount: number,
  expiringCount: number,
) {
  // Sheet 1: inventory
  const ws1 = XLSX.utils.json_to_sheet(inventoryData.map(d => ({
    'Tên thuốc/Vật tư': d.name,
    'Danh mục': d.categoryName,
    'Đơn vị': d.unit,
    'Tồn kho': d.totalQuantity,
    'Tồn tối thiểu': d.minStock,
    'Trạng thái': d.status,
  })));
  ws1['!cols'] = [
    { wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
  ];

  // Sheet 2: summary
  const summaryData = [
    { 'Chỉ tiêu': 'Tổng số loại thuốc/vật tư', 'Giá trị': inventoryData.length },
    { 'Chỉ tiêu': 'Tổng số lô hàng', 'Giá trị': batchCount },
    { 'Chỉ tiêu': 'Lô sắp hết hạn (90 ngày)', 'Giá trị': expiringCount },
    { 'Chỉ tiêu': 'Mặt hàng sắp hết', 'Giá trị': inventoryData.filter(d => d.status === 'Sắp hết').length },
    { 'Chỉ tiêu': 'Mặt hàng hết hàng', 'Giá trị': inventoryData.filter(d => d.status === 'Hết hàng').length },
  ];
  const ws2 = XLSX.utils.json_to_sheet(summaryData);
  ws2['!cols'] = [{ wch: 35 }, { wch: 15 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Chi tiết tồn kho');
  XLSX.utils.book_append_sheet(wb, ws2, 'Tổng hợp');
  XLSX.writeFile(wb, `Bao_cao_kho_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/** Tạo file Excel mẫu cho nhập kho */
export function generateImportTemplate() {
  const templateData = [
    {
      'Tên thuốc/Vật tư': 'Paracetamol 500mg',
      'Số lô': 'PAR202403',
      'Ngày sản xuất (DD/MM/YYYY)': '01/01/2024',
      'Ngày hết hạn (DD/MM/YYYY)': '01/01/2026',
      'Số lượng': 1000,
      'Giá nhập (VND)': 500,
      'Nhà cung cấp': 'Công ty Dược phẩm Trung ương 1',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 22 }, { wch: 22 }, { wch: 12 }, { wch: 15 }, { wch: 35 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Nhập kho');
  XLSX.writeFile(wb, 'Mau_nhap_kho.xlsx');
}

/** Parse file Excel nhập kho */
export function parseImportExcel(file: File): Promise<ImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        const rows: ImportRow[] = raw.map((r) => ({
          medicineName: String(r['Tên thuốc/Vật tư'] || ''),
          batchNumber: String(r['Số lô'] || ''),
          manufactureDate: String(r['Ngày sản xuất (DD/MM/YYYY)'] || ''),
          expiryDate: String(r['Ngày hết hạn (DD/MM/YYYY)'] || ''),
          quantity: Number(r['Số lượng'] || 0),
          importPrice: Number(r['Giá nhập (VND)'] || 0),
          supplierName: String(r['Nhà cung cấp'] || ''),
        }));

        resolve(rows);
      } catch (err) {
        reject(new Error('Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng.'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file.'));
    reader.readAsArrayBuffer(file);
  });
}
