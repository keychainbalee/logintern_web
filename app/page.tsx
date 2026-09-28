"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { fetchWithCache } from "@/lib/cache";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleUserRedirect = useCallback(async () => {
    if (!session?.user) return;
    try {
      const data = await fetchWithCache("/api/user/profile");
      if (!data.isOnboarded) {
        router.push("/onboarding");
      } else {
        router.push("/overview");
      }
    } catch (err) {
      router.push("/overview");
    }
  }, [session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      handleUserRedirect();
    }
  }, [status, handleUserRedirect]);

  // Loading Screen khusus di page.tsx saja
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 font-sans selection:bg-zinc-800 selection:text-zinc-50">
        <div className="flex flex-col items-center text-center space-y-5 max-w-sm">
          {/* Application Name & Tagline */}
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
              LogIntern
            </h1>
            <p className="text-xs text-zinc-400 font-medium">
              Notulensi Catatan Harian Magang Anda
            </p>
          </div>

          {/* Loading Buffering Loop Animation */}
          <div className="w-52 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80 relative">
            <div className="h-full bg-zinc-100 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] w-full opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100 to-transparent w-full animate-pulse" />
          </div>

          {/* Loading Message */}
          <p className="text-[11px] font-medium text-zinc-400 tracking-wide animate-pulse">
            Menghubungkan Autentikasi Google & Memuat LogIntern...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-50">
      {/* Top Bar */}
      <header className="border-b border-zinc-800/80 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo/LogIntern.svg"
              alt="LogIntern Logo"
              className="w-8 h-8 object-contain rounded-xl"
            />
            <span className="font-bold tracking-tight text-base text-zinc-100">LogIntern</span>
          </div>
        </div>
      </header>

      {/* Hero Body */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center space-y-8">

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 leading-tight">
          Catat Aktivitas Magang Harian <br />
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Dokumentasikan kehadiran (WFO/WFA), rincian pekerjaan, dan bukti foto kegiatan langsung lewat kamera atau dokumen pendukung.
        </p>

        <div className="pt-2 flex justify-center">
          <button
            onClick={() => signIn("google")}
            className="group relative inline-flex items-center gap-3 px-6 py-3 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Google</span>
          </button>
        </div>

        {/* Feature Grid Zinc */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left">
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-zinc-100">Mode Kerja WFA & WFO</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Atur lokasi kerja harian Anda dengan mudah beserta rincian jam kerja.
            </p>
          </div>

          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-zinc-100">Kamera & Berkas</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ambil foto dokumentasi langsung lewat kamera perangkat atau unggah file pendukung.
            </p>
          </div>

          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-zinc-100">Aman & Terintegrasi</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Autentikasi Google OAuth instan terhubung dengan database profil magang.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-4 text-center text-xs text-zinc-500">
        © 2026 LogIntern — Daily Internship Notetaking System.
      </footer>
    </div>
  );
}
