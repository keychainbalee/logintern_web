"use client";

import { useState } from "react";
import { DocumentationPicker } from "./DocumentationPicker";
import { toast } from "sonner";
import { invalidateCache } from "@/lib/cache";

interface LogFormProps {
  onSuccess: () => void;
}

export function LogForm({ onSuccess }: LogFormProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [workMode, setWorkMode] = useState<"WFO" | "WFA">("WFO");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [activityDesc, setActivityDesc] = useState("");
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
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
        throw new Error(data.error || "Gagal menyimpan log");
      }

      invalidateCache("/api/logs");
      toast.success("Catatan notulensi harian berhasil diunggah!");

      setActivityDesc("");
      setDocumentationUrl("");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mengunggah log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs text-zinc-100 space-y-5 font-sans">
      <div className="border-b border-zinc-800/80 pb-4">
        <h2 className="text-base font-bold tracking-tight text-zinc-100">
          Form Notulensi Harian Magang
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Isi aktivitas harian Anda beserta bukti dokumentasi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Keterangan Aktivitas
          </label>
          <textarea
            rows={4}
            value={activityDesc}
            onChange={(e) => setActivityDesc(e.target.value)}
            required
            placeholder="Jelaskan rincian aktivitas, meeting, atau pekerjaan hari ini..."
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Dokumentasi (Kamera / Unggah Foto)
          </label>
          <DocumentationPicker
            value={documentationUrl}
            onChange={(url) => setDocumentationUrl(url)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
          ) : (
            "Simpan & Unggah Notulensi Harian"
          )}
        </button>
      </form>
    </div>
  );
}
