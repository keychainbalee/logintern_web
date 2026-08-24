"use client";

import { useState, useRef, useEffect } from "react";

interface DocumentationPickerProps {
  value: string;
  onChange: (url: string) => void;
}

export function DocumentationPicker({ value, onChange }: DocumentationPickerProps) {
  const [mode, setMode] = useState<"file" | "camera">("file");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Gagal membuka kamera:", err);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      onChange(dataUrl);
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setMode("file");
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === "file"
              ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Pilih Berkas
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("camera");
            startCamera();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === "camera"
              ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Kamera Langsung
        </button>
      </div>

      {/* Selected Preview Area */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 max-w-sm">
          <img
            src={value}
            alt="Dokumentasi Preview"
            className="w-full h-44 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 bg-destructive text-white text-xs font-semibold rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Hapus Foto
            </button>
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-zinc-900/90 border border-zinc-700 rounded-md text-[10px] text-zinc-200">
            Dokumen Siap
          </div>
        </div>
      ) : (
        <div>
          {/* File Picker View */}
          {mode === "file" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-zinc-950/50 group text-center"
            >
              <p className="text-xs font-semibold text-zinc-200">
                Klik untuk mengunggah foto / berkas dokumentasi
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Format: JPG, PNG, WEBP (Maksimal 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Camera Stream View */}
          {mode === "camera" && (
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center min-h-[220px] p-2">
              {isCameraActive ? (
                <div className="relative w-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-56 object-cover rounded-xl border border-zinc-800"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl shadow-lg transition-all"
                    >
                      Ambil Foto
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Refresh Kamera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <p className="text-xs text-zinc-400">Kamera belum aktif</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Buka Kamera
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
