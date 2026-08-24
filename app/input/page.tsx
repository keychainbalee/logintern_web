"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { LogForm } from "@/components/LogForm";

export default function InputPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (!data.isOnboarded) {
          router.push("/onboarding");
          return;
        }
      }
    } catch (err) {
      console.error("Gagal memuat profil:", err);
    } finally {
      setLoading(false);
    }
  }, [session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-zinc-700 border-t-zinc-100 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Memuat Halaman Input...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans text-xs">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4 max-w-sm">
          <p className="font-bold text-zinc-100 text-sm">Akses Ditolak</p>
          <p className="text-zinc-400">Silakan login untuk mengisi form input kegiatan magang.</p>
          <Link href="/" className="inline-block px-4 py-2 bg-zinc-100 text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200">
            Kembali ke Homepage
          </Link>
        </div>
      </div>
    );
  }

  const handleFormSuccess = () => {
    setTimeout(() => {
      router.push("/overview");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto overflow-y-auto">
        {/* Top Header */}
        <div className="border-b border-zinc-800/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Input Notulensi Magang Harian
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Isi data aktivitas magang harian Anda dengan lengkap beserta foto/dokumen pendukung.
            </p>
          </div>

          <Link
            href="/overview"
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-semibold rounded-xl transition-all w-fit"
          >
            ← Kembali ke Overview
          </Link>
        </div>

        {/* Input Form Box */}
        <div className="max-w-2xl w-full">
          <LogForm onSuccess={handleFormSuccess} />
        </div>
      </main>
    </div>
  );
}
