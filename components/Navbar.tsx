"use client";

import { useSession, signOut, signIn } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="bg-black border-b border-neutral-800 text-white font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-widest text-base">LOGINTERN</span>
        </div>

        {/* User Auth */}
        <div>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-300">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300 uppercase"
              >
                [ KELUAR ]
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase hover:bg-neutral-200"
            >
              [ MASUK DENGAN GOOGLE ]
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
