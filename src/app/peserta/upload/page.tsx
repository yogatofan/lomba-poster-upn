"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  FileWarning,
  RefreshCw,
} from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pendaftaranDibuka, setPendaftaranDibuka] = useState(true);
  const [submission, setSubmission] = useState<{
    id: string;
    file_url: string | null;
    file_public_id: string | null;
    status: string;
    judul_karya: string;
    sub_tema: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from("settings")
        .select("pendaftaran_dibuka")
        .single();
      setPendaftaranDibuka(settings?.pendaftaran_dibuka ?? true);

      const { data: participant } = await supabase
        .from("participants")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!participant) {
        router.push("/peserta/daftar");
        return;
      }

      const { data: sub } = await supabase
        .from("submissions")
        .select("id, file_url, file_public_id, status, judul_karya, sub_tema")
        .eq("participant_id", participant.id)
        .single();

      setSubmission(sub);
      setLoading(false);
    }
    load();
  }, []);

  function validateFile(file: File): string {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Format file tidak valid. Gunakan JPG atau PNG.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimal 2MB.`;
    }
    return "";
  }

  function handleFileSelect(file: File) {
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      setSelectedFile(null);
      setPreview(null);
      return;
    }
    setFileError("");
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  function clearFile() {
    setSelectedFile(null);
    setPreview(null);
    setFileError("");
  }

  async function handleUpload() {
    if (!selectedFile || !submission) return;
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("submissionId", submission.id);
      if (submission.file_public_id) {
        formData.append("oldPublicId", submission.file_public_id);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload gagal. Silakan coba lagi.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/peserta/dashboard"), 2000);
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="shimmer h-8 w-48 rounded-xl" />
        <div className="shimmer h-80 rounded-2xl" />
      </div>
    );
  }

  if (!pendaftaranDibuka) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-upn-red-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ink mb-2">Pendaftaran Ditutup</h2>
        <p className="text-sm text-ink-muted-48">Upload poster tidak dapat dilakukan saat ini.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-green rounded-2xl p-8 text-center animate-fade-in-scale max-w-md mx-auto mt-12 border border-upn-green-600/20">
        <CheckCircle2 className="w-14 h-14 text-upn-green-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ink mb-2">Poster Berhasil Diupload!</h2>
        <p className="text-sm text-ink-muted-48">Karya Anda telah terkirim. Mengarahkan ke dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-ink flex items-center gap-2">
          <Upload className="w-6 h-6 text-upn-green-700" />
          {submission?.file_url ? "Reupload Poster" : "Upload Poster"}
        </h1>
        <p className="text-sm text-ink-muted-48 mt-1">
          {submission?.file_url
            ? "Upload file baru untuk menggantikan poster sebelumnya"
            : "Upload karya poster Anda dalam format JPG atau PNG"}
        </p>
      </div>

      {/* Info karya */}
      {submission && (
        <div className="card p-4 flex items-start gap-3">
          <ImageIcon className="w-4 h-4 text-upn-green-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink leading-snug">{submission.judul_karya}</p>
            <p className="text-xs text-ink-muted-48 mt-0.5">{submission.sub_tema}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-red rounded-xl p-4 flex items-start gap-2 border border-upn-red-700/20">
          <AlertCircle className="w-4 h-4 text-upn-red-700 shrink-0 mt-0.5" />
          <p className="text-sm text-upn-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="card space-y-4">
        {/* Poster lama */}
        {submission?.file_url && !preview && (
          <div>
            <p className="text-sm font-medium text-ink-muted-80 mb-2 flex items-center gap-2">
              <RefreshCw size={14} className="text-upn-green-700" />
              Poster Saat Ini
            </p>
            <div className="relative rounded-xl overflow-hidden bg-canvas-parchment aspect-video max-w-sm border border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={submission.file_url}
                alt="Poster saat ini"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-ink-muted-48 mt-2">
              File baru akan menggantikan poster di atas secara permanen.
            </p>
          </div>
        )}

        {/* Drop zone */}
        {!preview ? (
          <div
            id="upload-dropzone"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer ${
              dragging
                ? "border-upn-green-600 bg-upn-green-50/50"
                : "border-hairline bg-canvas-parchment hover:border-upn-green-600 hover:bg-upn-green-50/20"
            }`}
          >
            <input
              id="input-file-upload"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragging ? "text-upn-green-700" : "text-ink-muted-48/50"}`} />
            <p className="text-sm font-semibold text-ink">
              {dragging ? "Lepaskan file di sini" : "Klik atau seret file ke sini"}
            </p>
            <p className="text-xs text-ink-muted-48 mt-1">JPG, JPEG, PNG — Maks. 2MB</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-canvas-parchment aspect-video border border-hairline max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview poster" className="w-full h-full object-contain" />
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 card bg-white p-1 hover:bg-canvas-parchment transition-colors rounded-lg text-ink flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-upn-green-700 font-semibold">
              <CheckCircle2 size={14} />
              <span>{selectedFile?.name}</span>
              <span className="text-ink-muted-48/40">·</span>
              <span>{selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) + " MB" : ""}</span>
            </div>
          </div>
        )}

        {fileError && (
          <div className="flex items-center gap-2 text-sm text-upn-red-700">
            <FileWarning size={14} />
            {fileError}
          </div>
        )}

        {/* Aturan */}
        <div className="card bg-upn-green-50/50 border border-upn-green-100 p-3 text-xs text-ink-muted-80 space-y-1">
          <p className="font-bold text-upn-green-800">Ketentuan File:</p>
          <p>• Format: JPG, JPEG, atau PNG saja (bukan PDF)</p>
          <p>• Ukuran maksimal: 2MB per file</p>
          <p>• Resolusi disarankan: minimal 1080×1080px atau A3 (portrait/landscape)</p>
          <p>• Konten harus edukatif, tidak grafis/eksploitatif</p>
        </div>

        <Button
          id="btn-upload-submit"
          onClick={handleUpload}
          fullWidth
          loading={uploading}
          disabled={!selectedFile}
          size="lg"
        >
          {uploading ? "Mengupload..." : submission?.file_url ? "Ganti Poster" : "Upload Poster"}
        </Button>
      </div>
    </div>
  );
}
