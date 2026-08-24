"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { LogList, LogItem } from "@/components/LogList";
import { fetchWithCache, invalidateCache } from "@/lib/cache";

export default function LogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogsAndProfile = useCallback(async (forceRefresh = false) => {
    if (!session?.user) return;
    setLoading(true);
    try {
      if (forceRefresh) {
        invalidateCache("/api/logs");
        invalidateCache("/api/user/profile");
      }

      const [logsData, profData] = await Promise.all([
        fetchWithCache("/api/logs"),
        fetchWithCache("/api/user/profile"),
      ]);

      if (profData && !profData.isOnboarded) {
        router.push("/onboarding");
        return;
      }

      if (logsData) {
        setLogs(logsData);
      }
    } catch (err) {
      console.error("Gagal mengambil log:", err);
    } finally {
      setLoading(false);
    }
  }, [session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLogsAndProfile();
    }
  }, [status, fetchLogsAndProfile]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-xs text-zinc-400">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-100 rounded-full animate-spin" />
            <p>Memuat Riwayat Notulensi...</p>
          </div>
        </main>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans text-xs">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4 max-w-sm">
          <p className="font-bold text-zinc-100 text-sm">Akses Ditolak</p>
          <p className="text-zinc-400">Silakan login untuk mengakses halaman ini.</p>
          <Link href="/" className="inline-block px-4 py-2 bg-zinc-100 text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200">
            Kembali ke Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl w-full mx-auto overflow-y-auto">
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Riwayat Notulensi Harian Magang
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Seluruh riwayat aktivitas magang yang telah tersimpan.
            </p>
          </div>

          <Link
            href="/input"
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl shadow-xs transition-all w-fit"
          >
            + Tambah Input Baru
          </Link>
        </div>

        <LogList logs={logs} onRefresh={() => fetchLogsAndProfile(true)} />
      </main>
    </div>
  );
}
