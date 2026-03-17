import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ArrowRightLeft, Users, FileText, Settings, X, Activity, UserCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Tổng quan", path: "/" },
  { icon: Package, label: "Kho thuốc & Vật tư", path: "/inventory" },
  { icon: ArrowRightLeft, label: "Giao dịch", path: "/transactions" },
  { icon: Users, label: "Nhà cung cấp", path: "/suppliers" },
  { icon: FileText, label: "Báo cáo", path: "/reports" },
  { icon: UserCircle, label: "Tác giả", path: "/author" },
  { icon: Settings, label: "Cài đặt", path: "/settings" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <Activity className="h-6 w-6" />
            <span className="font-bold text-lg tracking-tight text-slate-900">MediCare Pro</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-sm">Hỗ trợ AI</span>
            </div>
            <p className="text-xs text-emerald-50 mb-3 opacity-90">
              Phân tích dữ liệu kho thông minh với Gemini AI.
            </p>
            <NavLink to="/ai-assistant">
              <Button size="sm" className="w-full bg-white text-emerald-700 hover:bg-slate-50 border-0">
                Mở Trợ lý AI
              </Button>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
