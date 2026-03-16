import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Key, Eye, EyeOff, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const { resetData } = useApp();

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục dữ liệu mẫu? Toàn bộ dữ liệu hiện tại sẽ bị xóa.")) {
      resetData();
      alert("Đã khôi phục dữ liệu mẫu thành công!");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cài đặt hệ thống</h1>
        <p className="text-sm text-slate-500">Quản lý cấu hình ứng dụng và API Key.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-emerald-600" />
            Cấu hình Gemini AI API Key
          </CardTitle>
          <CardDescription>
            Nhập API Key của Google Gemini để sử dụng tính năng Trợ lý AI. Key sẽ được lưu an toàn trong trình duyệt của bạn (LocalStorage).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium text-slate-700">API Key</label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Nếu để trống, hệ thống sẽ sử dụng API Key mặc định từ biến môi trường (nếu có).
            </p>
          </div>
          
          {saved && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-md border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Đã lưu cấu hình thành công!
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-slate-100 pt-6">
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Save className="mr-2 h-4 w-4" /> Lưu cấu hình
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-red-100 shadow-red-100/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Vùng nguy hiểm
          </CardTitle>
          <CardDescription>
            Các thao tác không thể hoàn tác.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
            <div>
              <h4 className="font-medium text-slate-900">Khôi phục dữ liệu mẫu</h4>
              <p className="text-sm text-slate-500">Xóa toàn bộ dữ liệu hiện tại và tải lại dữ liệu demo ban đầu.</p>
            </div>
            <Button variant="destructive" onClick={handleReset}>
              Khôi phục
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
