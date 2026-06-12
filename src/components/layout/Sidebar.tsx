"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  Star,
  BarChart3,
  Settings,
  Trophy,
  LogOut,
  ChevronRight,
  Gavel,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const pesertaNav: NavItem[] = [
  { href: "/peserta/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/peserta/daftar", label: "Pendaftaran", icon: <FileText size={18} /> },
  { href: "/peserta/upload", label: "Upload Poster", icon: <Upload size={18} /> },
];

const juriNav: NavItem[] = [
  { href: "/juri/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
];

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/peserta", label: "Data Peserta", icon: <Users size={18} /> },
  { href: "/admin/juri", label: "Kelola Juri", icon: <Gavel size={18} /> },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: <Trophy size={18} /> },
  { href: "/admin/settings", label: "Pengaturan", icon: <Settings size={18} /> },
];

interface SidebarProps {
  role: "peserta" | "juri" | "admin";
  userName: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems =
    role === "peserta" ? pesertaNav : role === "juri" ? juriNav : adminNav;

  const roleLabel =
    role === "peserta" ? "Peserta" : role === "juri" ? "Juri" : "Admin";

  const roleColor =
    role === "admin"
      ? "bg-upn-red-800/30 text-red-400 border-upn-red-700/30"
      : role === "juri"
      ? "bg-blue-800/30 text-blue-400 border-blue-700/30"
      : "bg-upn-green-800/30 text-green-400 border-upn-green-700/30";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 min-h-screen glass border-r border-white/8 flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          {/* Logo Placeholder */}
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-upn-green-900/50">
            UPN
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Lomba Poster</p>
            <p className="text-[10px] text-green-400/70 leading-tight">Dies Natalis UPN</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/8">
        <div className="glass-green rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <span className={clsx("text-[10px] px-2 py-0.5 rounded-full border font-medium", roleColor)}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-upn-green-700/20 text-green-300 border border-upn-green-600/30"
                  : "text-green-300/60 hover:text-green-200 hover:bg-white/5"
              )}
            >
              <span
                className={clsx(
                  "transition-colors",
                  isActive ? "text-green-400" : "text-green-500/50 group-hover:text-green-400"
                )}
              >
                {item.icon}
              </span>
              {item.label}
              {isActive && <ChevronRight size={14} className="ml-auto text-green-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/8">
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-upn-red-900/20 transition-all duration-150"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
