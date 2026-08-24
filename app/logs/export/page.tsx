"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { fetchWithCache } from "@/lib/cache";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import * as XLSX from "xlsx";

function ExportRecapContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected filter query params from LogList
  const initialMode = searchParams.get("workMode") || "ALL";
  const initialMonth = searchParams.get("month") || "ALL";
  const initialYear = searchParams.get("year") || "ALL";

  const [logs, setLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Export options state
  const [exportScope, setExportScope] = useState<"ALL" | "FILTERED">("FILTERED");
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const monthsList = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const yearsList = ["2024", "2025", "2026", "2027"];

  const fetchData = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const [logsData, profData] = await Promise.all([
        fetchWithCache("/api/logs"),
        fetchWithCache("/api/user/profile"),
      ]);

      if (logsData) setLogs(logsData);
      if (profData) setProfile(profData);
    } catch (err) {
      console.error("Gagal memuat data export:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  // Compute filtered logs count
  const getFilteredLogs = () => {
    if (exportScope === "ALL") return logs;

    return logs.filter((log) => {
      const d = new Date(log.date);
      const logMonth = String(d.getMonth() + 1).padStart(2, "0");
      const logYear = String(d.getFullYear());

      const matchMode = selectedMode === "ALL" || log.workMode === selectedMode;
      const matchMonth = selectedMonth === "ALL" || logMonth === selectedMonth;
      const matchYear = selectedYear === "ALL" || logYear === selectedYear;

      return matchMode && matchMonth && matchYear;
    });
  };

  const targetLogs = getFilteredLogs();

  const handleDownloadExcel = () => {
    if (targetLogs.length === 0) {
      toast.error("Tidak ada data notulensi yang sesuai dengan kriteria export.");
      return;
    }

    try {
      const formattedData = targetLogs.map((log, index) => {
        const logDate = new Date(log.date);
        const hari = format(logDate, "EEEE", { locale: idLocale });
        const tanggalFormatted = format(logDate, "dd MMMM yyyy", { locale: idLocale });

        // Amankan string dokumentasi agar tidak melebihi batas sel Excel (32,767 karakter)
        let docValue = "-";
        if (log.documentationUrl) {
          if (log.documentationUrl.startsWith("data:")) {
            docValue = "Ada Foto Dokumentasi (Base64)";
          } else if (log.documentationUrl.length > 500) {
            docValue = log.documentationUrl.slice(0, 500) + "...";
          } else {
            docValue = log.documentationUrl;
          }
        }

        // Amankan string deskripsi aktivitas (maksimal 30.000 karakter per sel Excel)
        const safeActivity = (log.activityDesc || "").length > 30000
          ? (log.activityDesc || "").slice(0, 30000) + "..."
          : (log.activityDesc || "");

        return {
          No: index + 1,
          Hari: hari,
          Tanggal: tanggalFormatted,
          "Mode Kerja": log.workMode,
          "Jam Mulai": log.startTime,
          "Jam Selesai": log.endTime,
          Perusahaan: log.companyName || profile?.companyName || "-",
          Mentor: log.mentorName || profile?.mentorName || "-",
          "Keterangan Aktivitas": safeActivity,
          Dokumentasi: docValue,
        };
      });

      // Create Worksheet & Workbook using SheetJS (XLSX)
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      // Auto width for columns
      const colWidths = [
        { wch: 5 },  // No
        { wch: 12 }, // Hari
        { wch: 18 }, // Tanggal
        { wch: 12 }, // Mode Kerja
        { wch: 12 }, // Jam Mulai
        { wch: 12 }, // Jam Selesai
        { wch: 25 }, // Perusahaan
        { wch: 20 }, // Mentor
        { wch: 50 }, // Keterangan Aktivitas
        { wch: 30 }, // Dokumentasi
      ];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Recap Notulensi");

      // Generate filename based on export scope
      let filename = "Recap_Notulensi_Magang_LogIntern.xlsx";
      if (exportScope === "FILTERED") {
        const monthLabel = monthsList.find((m) => m.value === selectedMonth)?.label || selectedMonth;
        filename = `Recap_Notulensi_${selectedMode}_${monthLabel}_${selectedYear}.xlsx`;
      }

      // Download .xlsx file
      XLSX.writeFile(workbook, filename);
      toast.success(`Berkas spreadsheet "${filename}" berhasil diunduh!`);
    } catch (err) {
      console.error("Gagal mendownload Excel:", err);
      toast.error("Terjadi kesalahan saat mengunduh berkas spreadsheet.");
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-xs text-zinc-400">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-100 rounded-full animate-spin" />
            <p>Menyiapkan Halaman Export...</p>
          </div>
        </main>
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
            <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full uppercase">
              Export Spreadsheet (.xlsx)
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 mt-2">
              Simpan & Unduh Recap Notulensi
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Pilih opsi unduh data notulensi kegiatan harian Anda ke format Spreadsheet Excel.
            </p>
          </div>

          <Link
            href="/logs"
            className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-all w-fit"
          >
            ← Kembali ke Riwayat
          </Link>
        </div>

        {/* Export Options Form Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
          {/* Scope Selector: All vs Filtered */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
              1. Pilih Skala Unduhan Data
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Filtered */}
              <div
                onClick={() => setExportScope("FILTERED")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  exportScope === "FILTERED"
                    ? "bg-zinc-800/80 border-zinc-100 ring-1 ring-zinc-100 shadow-xs"
                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="scope"
                    checked={exportScope === "FILTERED"}
                    onChange={() => setExportScope("FILTERED")}
                    className="accent-zinc-100"
                  />
                  <span className="text-xs font-bold text-zinc-100">
                    Sesuai Filter yang Dipilih
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 pl-5">
                  Unduh data yang telah difilter berdasarkan Mode Kerja, Bulan, atau Tahun tertentu.
                </p>
              </div>

              {/* Option B: All */}
              <div
                onClick={() => setExportScope("ALL")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  exportScope === "ALL"
                    ? "bg-zinc-800/80 border-zinc-100 ring-1 ring-zinc-100 shadow-xs"
                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="scope"
                    checked={exportScope === "ALL"}
                    onChange={() => setExportScope("ALL")}
                    className="accent-zinc-100"
                  />
                  <span className="text-xs font-bold text-zinc-100">
                    Semua Data Notulensi (All Time)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 pl-5">
                  Unduh seluruh akumulasi catatan harian magang dari awal hingga sekarang.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Customization (If FILTERED option is selected) */}
          {exportScope === "FILTERED" && (
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-4">
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                2. Sesuaikan Filter Data
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Filter Mode Kerja */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Mode Kerja
                  </label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  >
                    <option value="ALL">Semua Mode (WFO & WFA)</option>
                    <option value="WFO">WFO (Office)</option>
                    <option value="WFA">WFA (Flexible)</option>
                  </select>
                </div>

                {/* Filter Bulan */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Bulan Log
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  >
                    <option value="ALL">Semua Bulan</option>
                    {monthsList.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Tahun */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Tahun Log
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  >
                    <option value="ALL">Semua Tahun</option>
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Target Summary Badge */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400">Total Baris Data Siap Diunduh:</span>
              <p className="text-lg font-bold text-zinc-100 mt-0.5">
                {targetLogs.length} Baris Catatan Harian
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                targetLogs.length > 0
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}
            >
              {targetLogs.length > 0 ? "Siap Unduh" : "Data Kosong"}
            </span>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadExcel}
            disabled={targetLogs.length === 0}
            className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Unduh Berkas Spreadsheet (.xlsx)</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ExportRecapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center text-xs">Memuat Export...</div>}>
      <ExportRecapContent />
    </Suspense>
  );
}
