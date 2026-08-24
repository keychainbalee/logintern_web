"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [mentorName, setMentorName] = useState("");

  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFullName(data.fullName || "");
        setUsername(data.username || "");
        setBirthPlace(data.birthPlace || "");
        setBirthDate(data.birthDate ? data.birthDate.split("T")[0] : "");
        setInstitution(data.institution || "");
        setMajor(data.major || "");
        setCompanyName(data.companyName || "");
        setMentorName(data.mentorName || "");
      }
    } catch (err) {
      console.error("Gagal memuat profil:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
          companyName,
          mentorName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil");
      }

      toast.success("Perubahan profil berhasil disimpan!");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-zinc-700 border-t-zinc-100 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Memuat Pengaturan...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans text-xs">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4 max-w-sm">
          <p className="font-bold text-zinc-100 text-sm">Akses Ditolak</p>
          <p className="text-zinc-400">Silakan login untuk membuka pengaturan akun.</p>
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

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto overflow-y-auto">
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            Pengaturan Akun & Profil Magang
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Perbarui data diri, username, instansi pendidikan, perusahaan, dan mentor Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xs">
          <div className="border-b border-zinc-800 pb-3">
            <span className="text-xs font-bold text-zinc-100">Data Profil Peserta</span>
          </div>

          {/* Email Google (Readonly) */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Email Google (Terverifikasi)
            </label>
            <input
              type="text"
              value={session?.user?.email || ""}
              readOnly
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 cursor-not-allowed"
            />
          </div>

          {/* Nama Lengkap & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>
          </div>

          {/* TTL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
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
                style={{ colorScheme: "dark" }}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>
          </div>

          {/* Sekolah & Jurusan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Sekolah / Universitas
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Jurusan / Program Studi
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>
          </div>

          {/* Nama Perusahaan & Mentor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nama Perusahaan / Tempat Magang
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nama Mentor / Pembimbing Magang
              </label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                "Perbarui Profil"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
