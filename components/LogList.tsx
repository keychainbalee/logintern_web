"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";
import { invalidateCache } from "@/lib/cache";

export interface LogItem {
  id: string;
  date: string;
  workMode: "WFO" | "WFA";
  startTime: string;
  endTime: string;
  activityDesc: string;
  documentationUrl?: string | null;
  createdAt: string;
}

interface LogListProps {
  logs: LogItem[];
  onRefresh: () => void;
}

export function LogList({ logs, onRefresh }: LogListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "WFO" | "WFA">("ALL");
  const [filterMonth, setFilterMonth] = useState<string>("ALL");
  const [filterYear, setFilterYear] = useState<string>("ALL");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const filteredLogs = logs.filter((log) => {
    const d = new Date(log.date);
    const logMonth = String(d.getMonth() + 1).padStart(2, "0");
    const logYear = String(d.getFullYear());

    const matchesSearch =
      log.activityDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.date.includes(searchTerm);
    const matchesMode = filterMode === "ALL" || log.workMode === filterMode;
    const matchesMonth = filterMonth === "ALL" || logMonth === filterMonth;
    const matchesYear = filterYear === "ALL" || logYear === filterYear;

    return matchesSearch && matchesMode && matchesMonth && matchesYear;
  });

  const totalLogs = logs.length;
  const wfoCount = logs.filter((l) => l.workMode === "WFO").length;
  const wfaCount = logs.filter((l) => l.workMode === "WFA").length;

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus notulensi catatan harian ini?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/logs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Gagal menghapus log");
      }

      invalidateCache("/api/logs");
      toast.success("Catatan notulensi harian berhasil dihapus!");
      onRefresh();
    } catch (err) {
      toast.error("Gagal menghapus log catatan harian.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 text-zinc-100 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100">Daftar Notulensi Magang</h2>
          <p className="text-xs text-zinc-400">Filter dan kelola seluruh riwayat notulensi Anda</p>
        </div>

        <Link
          href={`/logs/export?workMode=${filterMode}&month=${filterMonth}&year=${filterYear}`}
          className="px-4 py-2.5 bg-green-600 hover:bg-green-800 text-white border border-green-500/30 font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 w-fit"
        >
          <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <span>Simpan Recap Spreadsheet</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Hasil Filter
          </p>
          <p className="text-2xl font-bold tracking-tight text-zinc-50 mt-1">
            {filteredLogs.length} <span className="text-xs font-normal text-zinc-500">/ {totalLogs}</span>
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Total WFO
          </p>
          <p className="text-2xl font-bold tracking-tight text-emerald-400 mt-1">
            {wfoCount}
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Total WFA
          </p>
          <p className="text-2xl font-bold tracking-tight text-blue-400 mt-1">
            {wfaCount}
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari keterangan aktivitas atau tanggal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "ALL"
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Semua Mode
            </button>
            <button
              onClick={() => setFilterMode("WFO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "WFO"
                  ? "bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              WFO
            </button>
            <button
              onClick={() => setFilterMode("WFA")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "WFA"
                  ? "bg-zinc-800 text-blue-400 border border-zinc-700 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              WFA
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800/60">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Filter Bulan
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              <option value="ALL">Semua Bulan</option>
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Filter Tahun
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              <option value="ALL">Semua Tahun</option>
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-semibold text-zinc-200">Tidak ada notulensi yang sesuai filter</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Coba reset atau ubah pilihan filter Mode Kerja, Bulan, atau Tahun Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-200 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 font-semibold text-zinc-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Keterangan Aktivitas</th>
                  <th className="py-3 px-4">Dokumentasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredLogs.map((log) => {
                  const formattedDate = format(new Date(log.date), "dd MMM yyyy", { locale: idLocale });

                  return (
                    <tr key={log.id} className="hover:bg-zinc-950/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-zinc-100 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            log.workMode === "WFO"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {log.workMode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                        {log.startTime} - {log.endTime}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-zinc-300">
                        {log.activityDesc}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.documentationUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedImage(log.documentationUrl!)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 border border-zinc-700 transition-all"
                          >
                            Ada Foto
                          </button>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                        <Link
                          href={`/logs/${log.id}`}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-100 transition-colors inline-block"
                        >
                          Detail
                        </Link>

                        <Link
                          href={`/logs/${log.id}/edit`}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300 transition-colors inline-block"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-destructive hover:text-white border border-zinc-800 text-[11px] font-semibold text-zinc-400 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-100">Pratinjau Dokumentasi</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg"
              >
                Tutup
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Dokumentasi Notulensi"
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
