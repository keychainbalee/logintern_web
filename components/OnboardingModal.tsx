"use client";

import { useState } from "react";

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          username,
          birthPlace,
          birthDate,
          institution,
          major,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan data profil");
      }

      onComplete();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-4">
          <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md uppercase">
            Onboarding Profil
          </span>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 mt-2">
            Lengkapi Profil Peserta Magang
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Harap isi data diri Anda dengan lengkap sebelum mengakses aplikasi.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Contoh: Muhammad Budi Utomo"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Contoh: budi_intern"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
            />
          </div>

          {/* TTL (Tempat & Tanggal Lahir) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                required
                placeholder="Contoh: Jakarta"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>
          </div>

          {/* Sekolah / Universitas */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Sekolah / Universitas
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
              placeholder="Contoh: Universitas Indonesia"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
            />
          </div>

          {/* Jurusan */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Jurusan / Program Studi
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
              placeholder="Contoh: Teknik Informatika"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                "Simpan Profil & Lanjutkan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
