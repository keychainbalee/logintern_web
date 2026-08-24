"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { LogItem } from "@/components/LogList";
import { fetchWithCache } from "@/lib/cache";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function OverviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndLogs = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const [profData, logsData] = await Promise.all([
        fetchWithCache("/api/user/profile"),
        fetchWithCache("/api/logs"),
      ]);

      if (profData) {
        setProfile(profData);
        if (!profData.isOnboarded) {
          router.push("/onboarding");
          return;
        }
      }

      if (logsData) {
        setLogs(logsData);
      }
    } catch (err) {
      console.error("Gagal memuat overview:", err);
    } finally {
      setLoading(false);
    }
  }, [session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileAndLogs();
    }
  }, [status, fetchProfileAndLogs]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-xs text-zinc-400">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-100 rounded-full animate-spin" />
            <p>Memuat Overview...</p>
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
          <p className="text-zinc-400">Silakan login menggunakan akun Google Anda.</p>
          <Link href="/" className="inline-block px-4 py-2 bg-zinc-100 text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200">
            Kembali ke Homepage
          </Link>
        </div>
      </div>
    );
  }

  const totalLogs = logs.length;
  const wfoLogs = logs.filter((l) => l.workMode === "WFO").length;
  const wfaLogs = logs.filter((l) => l.workMode === "WFA").length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl w-full mx-auto overflow-y-auto">
        {/* Header Title */}
        <div className="border-b border-zinc-800/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Selamat Datang, {profile?.fullName || session?.user?.name || "Peserta Magang"}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Ringkasan statistik notulensi dan data profil magang Anda.
            </p>
          </div>

          <Link
            href="/input"
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl shadow-xs transition-all w-fit"
          >
            + Tambah Input Harian
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-bold text-zinc-100">Profil Peserta Magang</span>
            <Link href="/settings" className="text-xs text-zinc-400 hover:text-zinc-100 font-medium">
              Edit Profil →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Nama Lengkap</span>
              <span className="font-semibold text-zinc-100">{profile?.fullName || "-"}</span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Username</span>
              <span className="font-semibold text-zinc-100">@{profile?.username || "-"}</span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Tempat, Tanggal Lahir</span>
              <span className="font-semibold text-zinc-100">
                {profile?.birthPlace || "-"}, {profile?.birthDate ? format(new Date(profile.birthDate), "dd MMMM yyyy", { locale: id }) : "-"}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Sekolah / Universitas</span>
              <span className="font-semibold text-zinc-100">{profile?.institution || "-"}</span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Jurusan</span>
              <span className="font-semibold text-zinc-100">{profile?.major || "-"}</span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Nama Perusahaan</span>
              <span className="font-semibold text-zinc-100">{profile?.companyName || "-"}</span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Nama Mentor</span>
              <span className="font-semibold text-zinc-100">{profile?.mentorName || "-"}</span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Status Akun</span>
              <span className="font-semibold text-emerald-400 block mt-0.5">
                Terverifikasi Google
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Total Akumulasi Log</span>
            <p className="text-3xl font-bold text-zinc-50">{totalLogs}</p>
            <p className="text-xs text-zinc-500">Catatan aktivitas tersimpan</p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Kehadiran WFO</span>
            <p className="text-3xl font-bold text-emerald-400">{wfoLogs}</p>
            <p className="text-xs text-zinc-500">Hari kerja di kantor</p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Kehadiran WFA</span>
            <p className="text-3xl font-bold text-blue-400">{wfaLogs}</p>
            <p className="text-xs text-zinc-500">Hari kerja fleksibel</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-bold text-zinc-100">Riwayat Notulensi Terbaru</span>
            <div className="flex items-center gap-3">
              <Link href="/input" className="text-xs font-semibold text-zinc-100 hover:underline">
                + Input Baru
              </Link>
              <Link href="/logs" className="text-xs text-zinc-400 hover:text-zinc-100">
                Lihat Semua →
              </Link>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-zinc-400">Belum ada aktivitas magang yang disimpan</p>
              <Link
                href="/input"
                className="inline-block px-4 py-2 bg-zinc-100 text-zinc-950 font-semibold text-xs rounded-xl hover:bg-zinc-200"
              >
                + Isi Notulensi Pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-zinc-100">
                      {format(new Date(log.date), "EEEE, dd MMMM yyyy", { locale: id })}
                    </div>
                    <div className="text-xs text-zinc-400 truncate max-w-md">
                      {log.activityDesc}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.workMode === "WFO"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {log.workMode}
                    </span>
                    <div className="text-[11px] text-zinc-500">
                      {log.startTime} - {log.endTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
