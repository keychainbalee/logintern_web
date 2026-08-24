"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Overview", href: "/overview" },
    { label: "Input Kegiatan", href: "/input" },
    { label: "Riwayat Notulensi", href: "/logs" },
    { label: "Pengaturan Akun", href: "/settings" },
  ];

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-xs border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Buka Menu Navigasi"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 fill-none stroke-current text-zinc-100" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <img
              src="/logo/LogIntern.svg"
              alt="LogIntern Logo"
              className="w-7 h-7 object-contain rounded-xl"
            />
            <span className="font-bold tracking-tight text-sm text-zinc-100">LogIntern</span>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between shrink-0 text-zinc-100 select-none transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo/LogIntern.svg"
                  alt="LogIntern Logo"
                  className="w-8 h-8 object-contain rounded-xl"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold tracking-tight text-base text-zinc-100">
                      LogIntern
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Notulensi Catatan Harian Magang
              </p>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-zinc-400 hover:text-zinc-100 text-xs font-semibold p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
            >
              ✕
            </button>
          </div>

          <nav className="p-3 space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-zinc-800 text-zinc-50 border border-zinc-700/80 font-semibold shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800/80 space-y-3">
          {session?.user && (
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <p className="text-xs font-semibold text-zinc-100 truncate">
                {session.user.name || "Peserta Magang"}
              </p>
              <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                {session.user.email}
              </p>
            </div>
          )}

          <button
            onClick={() => signOut()}
            className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-medium rounded-xl transition-all"
          >
            Keluar Akun
          </button>
        </div>
      </aside>
    </>
  );
}
