"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { fetchWithCache, invalidateCache } from "@/lib/cache";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [log, setLog] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchLogDetailAndProfile = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const [logData, profData] = await Promise.all([
        fetchWithCache(`/api/logs/${id}`),
        fetchWithCache("/api/user/profile"),
      ]);

      if (logData) {
        setLog(logData);
      } else {
        router.push("/logs");
      }

      if (profData) {
        setUserProfile(profData);
      }
    } catch (err) {
      console.error("Gagal mengambil detail log:", err);
    } finally {
      setLoading(false);
    }
  }, [session, id, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLogDetailAndProfile();
    }
  }, [status, fetchLogDetailAndProfile]);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus notulensi ini?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/logs/${id}`, { method: "DELETE" });
      if (res.ok) {
        invalidateCache("/api/logs");
        toast.success("Catatan notulensi harian berhasil dihapus!");
        router.push("/logs");
      }
    } catch (err) {
      toast.error("Gagal menghapus log.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadImage = () => {
    if (!log?.documentationUrl) return;

    try {
      const a = document.createElement("a");
      a.href = log.documentationUrl;

      let extension = "jpg";
      if (log.documentationUrl.startsWith("data:image/png")) {
        extension = "png";
      } else if (log.documentationUrl.startsWith("data:image/webp")) {
        extension = "webp";
      }

      const logDateFormatted = format(new Date(log.date), "yyyy-MM-dd");
      const filename = `Dokumentasi_Magang_${logDateFormatted}.${extension}`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("Foto dokumentasi berhasil diunduh!");
    } catch (err) {
      console.error("Gagal mengunduh foto:", err);
      toast.error("Gagal mengunduh foto dokumentasi.");
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-xs text-zinc-400">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-100 rounded-full animate-spin" />
            <p>Memuat Detail Notulensi...</p>
          </div>
        </main>
      </div>
    );
  }

  if (status === "unauthenticated" || !log) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans text-xs">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4 max-w-sm">
          <p className="font-bold text-zinc-100 text-sm">Notulensi Tidak Ditemukan</p>
          <Link href="/logs" className="inline-block px-4 py-2 bg-zinc-100 text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200">
            Kembali ke Riwayat Logs
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = format(new Date(log.date), "EEEE, dd MMMM yyyy", { locale: idLocale });

  const displayCompany = log.companyName || userProfile?.companyName || "-";
  const displayMentor = log.mentorName || userProfile?.mentorName || "-";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto overflow-y-auto">
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full uppercase">
              Detail Notulensi Harian
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 mt-2">
              {formattedDate}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/logs/${id}/edit`}
              className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl shadow-xs transition-all"
            >
              Edit Notulensi
            </Link>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:bg-destructive hover:text-white text-zinc-400 text-xs font-semibold rounded-xl transition-all"
            >
              Hapus
            </button>

            <Link
              href="/logs"
              className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-all"
            >
              ← Kembali
            </Link>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase">Mode Kerja</span>
            <p className="text-base font-bold text-zinc-100">{log.workMode === "WFO" ? "WFO (Office)" : "WFA (Flexible)"}</p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase">Jam Kerja</span>
            <p className="text-base font-bold text-zinc-100">{log.startTime} - {log.endTime} WIB</p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase">Perusahaan</span>
            <p className="text-sm font-bold text-zinc-100">{displayCompany}</p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase">Mentor</span>
            <p className="text-sm font-bold text-zinc-100">{displayMentor}</p>
          </div>
        </div>

        {/* Full Activity Description */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Keterangan Aktivitas Harian
          </h2>
          <p className="text-xs text-zinc-100 leading-relaxed whitespace-pre-wrap bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono">
            {log.activityDesc}
          </p>
        </div>

        {/* Documentation Image & Download Button */}
        {log.documentationUrl && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Foto Dokumentasi
              </h2>

              <button
                onClick={handleDownloadImage}
                className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Unduh Foto Dokumentasi</span>
              </button>
            </div>

            <div className="border border-zinc-800 bg-zinc-950 rounded-xl p-2 max-w-2xl">
              <img
                src={log.documentationUrl}
                alt="Dokumentasi Notulensi"
                className="w-full h-auto max-h-[500px] object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
