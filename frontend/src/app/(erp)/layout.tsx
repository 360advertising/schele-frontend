"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, Users, Folder, Building, FileText, Receipt, FileSignature, Wrench, DollarSign, LogOut } from "lucide-react";

// DEMO MODE – ERP Layout with sidebar and topbar for authenticated pages
export default function ErpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/clients", label: "Clienți", icon: Users },
    { href: "/contracts", label: "Contracte", icon: FileSignature },
    { href: "/projects", label: "Proiecte", icon: Folder },
    { href: "/scaffolds", label: "Schele", icon: Building },
    { href: "/components", label: "Componente", icon: Wrench },
    { href: "/pricings", label: "Tarifare", icon: DollarSign },
    { href: "/work-reports", label: "Procese verbale", icon: FileText },
    { href: "/proformas", label: "Proforme", icon: Receipt },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col border-r border-slate-700 shadow-lg">
        <div className="p-6 border-b border-slate-700">
          <Link href="/dashboard" className="flex items-center justify-start">
            <div className="bg-white rounded-lg p-2">
              <img
                src="https://www.schela.com/wp-content/uploads/2015/07/logo-schele.gif"
                alt="Schele Logo"
                className="h-10 max-h-[40px] w-auto object-contain"
              />
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-slate-700 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <link.icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Deconectare</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {user?.name || "Administrator"}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {user?.role || "ADMIN"}
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
