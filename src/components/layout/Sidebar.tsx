"use client";

import Link from "next/link";
import Image from "next/image";
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

  const roleBadge =
    role === "admin"
      ? "bg-upn-red-100 text-upn-red-700 border border-upn-red-600/30"
      : role === "juri"
        ? "bg-blue-50 text-blue-700 border border-blue-200"
        : "bg-upn-green-100 text-upn-green-800 border border-upn-green-400/40";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 min-h-screen bg-canvas-parchment border-r border-hairline flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-hairline">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink leading-tight">UPN "Veteran" Jawa Timur</p>
            <p className="text-[10px] text-upn-green-700 leading-tight font-medium">Dies Natalis ke-67</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-hairline">
        <div className="bg-white border border-hairline rounded-xl p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-ink truncate">{userName}</p>
              <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-semibold", roleBadge)}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-white border border-hairline text-ink shadow-sm"
                  : "text-ink-muted-48 hover:text-ink hover:bg-white/60"
              )}
            >
              <span
                className={clsx(
                  "transition-colors",
                  isActive ? "text-upn-green-700" : "text-ink-muted-48 group-hover:text-upn-green-700"
                )}
              >
                {item.icon}
              </span>
              {item.label}
              {isActive && <ChevronRight size={13} className="ml-auto text-ink-muted-48" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-hairline">
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-upn-red-700 hover:bg-upn-red-100 transition-all duration-150"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
