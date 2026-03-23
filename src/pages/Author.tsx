import React from "react";
import { Card, CardContent } from "../components/ui/Card";
import { GraduationCap, MapPin, Stethoscope, Mail } from "lucide-react";

export function Author() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tác giả</h1>
        <p className="text-sm text-slate-500">Thông tin về người phát triển ứng dụng.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 h-40 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
              <img
                src="/avatar.PNG"
                alt="Tác giả: Dương Minh Trí"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <CardContent className="pt-20 pb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Tác giả: Dương Minh Trí</h2>
          <p className="text-emerald-600 font-medium text-sm mb-6">Sinh viên — Nhà phát triển ứng dụng</p>

          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Thông tin về tác giả</p>
                <p className="text-sm font-semibold text-slate-800">Sinh viên ngành y</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Trường đào tạo</p>
                <p className="text-sm font-semibold text-slate-800">Đại học Y khoa Phan Châu Trinh</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Địa chỉ</p>
                <p className="text-sm font-semibold text-slate-800">Số 9 Nguyễn Gia Thiều, phường Điện Bàn Đông, thành phố Đà Nẵng</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Ứng dụng MediCare Pro — Quản lý vật tư y tế thông minh
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Phát triển bởi tác giả Dương Minh Trí © {new Date().getFullYear()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
