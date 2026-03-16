import React from "react";
import { Menu, Search, Bell, Settings } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuthStore } from "../store/authStore";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="search"
              placeholder="Tìm kiếm thuốc, vật tư..."
              className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-2">
        <NavLink to="/settings">
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 text-slate-600 border-slate-200">
            <Settings className="h-4 w-4" />
            <span>Cài đặt API Key</span>
          </Button>
        </NavLink>
        <Button variant="ghost" size="icon" className="relative text-slate-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-900">{profile?.name || 'Loading...'}</span>
            <span className="text-xs text-slate-500 capitalize">{profile?.role?.replace('_', ' ')}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
            {profile?.name?.charAt(0) || '?'}
          </div>
          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
