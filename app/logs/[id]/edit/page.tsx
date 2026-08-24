"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { DocumentationPicker } from "@/components/DocumentationPicker";
import { toast } from "sonner";

export default function LogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [workMode, setWorkMode] = useState<"WFO" | "WFA">("WFO");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [activityDesc, setActivityDesc] = useState("");
  const [documentationUrl, setDocumentationUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchLogDetail = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/logs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDate(data.date ? data.date.split("T")[0] : "");
        setWorkMode(data.workMode || "WFO");
        setStartTime(data.startTime || "08:00");
        setEndTime(data.endTime || "17:00");
        setActivityDesc(data.activityDesc || "");
        setDocumentationUrl(data.documentationUrl || "");
      } else {
        router.push("/logs");
      }
    } catch (err) {
      console.error("Gagal memuat log:", err);
    } finally {
      setLoading(false);
    }
  }, [session, id, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLogDetail();
    }
  }, [status, fetchLogDetail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/logs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          workMode,
          startTime,
          endTime,
          activityDesc,
          documentationUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui notulensi");
      }

      toast.success("Catatan notulensi harian berhasil diperbarui!");
      setTimeout(() => {
        router.push(`/logs/${id}`);
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mengedit log");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-zinc-700 border-t-zinc-100 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Memuat Halaman Edit...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans text-xs">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4 max-w-sm">
          <p className="font-bold text-zinc-100 text-sm">Akses Ditolak</p>
          <Link href="/logs" className="inline-block px-4 py-2 bg-zinc-100 text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200">
            Kembali ke Riwayat Logs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto overflow-y-auto">
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Edit Notulensi Harian
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Ubah rincian kegiatan, jam kerja, atau foto dokumentasi.
            </p>
          </div>

          <Link
            href={`/logs/${id}`}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-semibold rounded-xl transition-all w-fit"
          >
            ← Batal Edit
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4 max-w-2xl shadow-xs">
          {/* Tanggal & Mode Kerja */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tanggal Log
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ colorScheme: "dark" }}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Mode Kerja (WFO / WFA)
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setWorkMode("WFO")}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    workMode === "WFO"
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  WFO
                </button>
                <button
                  type="button"
                  onClick={() => setWorkMode("WFA")}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    workMode === "WFA"
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  WFA
                </button>
              </div>
            </div>
          </div>

          {/* Jam Mulai & Jam Selesai */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Jam Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={{ colorScheme: "dark" }}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Jam Selesai
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={{ colorScheme: "dark" }}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>
          </div>

          {/* Keterangan Aktivitas */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Keterangan Aktivitas
            </label>
            <textarea
              rows={4}
              value={activityDesc}
              onChange={(e) => setActivityDesc(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all resize-y"
            />
          </div>

          {/* Dokumentasi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Dokumentasi Foto
            </label>
            <DocumentationPicker
              value={documentationUrl}
              onChange={(url) => setDocumentationUrl(url)}
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                "Simpan Perubahan"
              )}
            </button>

            <Link
              href={`/logs/${id}`}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-semibold rounded-xl"
            >
              Batal
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
