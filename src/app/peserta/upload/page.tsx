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
      <div className="glass rounded-2xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Pendaftaran Ditutup</h2>
        <p className="text-sm text-green-400/60">Upload poster tidak dapat dilakukan.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-green rounded-2xl p-8 text-center animate-fade-in-scale">
        <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Poster Berhasil Diupload!</h2>
        <p className="text-sm text-green-400/60">Karya Anda telah terkirim. Mengarahkan ke dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Upload className="w-6 h-6 text-green-400" />
          {submission?.file_url ? "Reupload Poster" : "Upload Poster"}
        </h1>
        <p className="text-sm text-green-400/60 mt-1">
          {submission?.file_url
            ? "Upload file baru untuk menggantikan poster sebelumnya"
            : "Upload karya poster Anda dalam format JPG atau PNG"}
        </p>
      </div>

      {/* Info karya */}
      {submission && (
        <div className="glass rounded-2xl p-4 flex items-start gap-3">
          <ImageIcon className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">{submission.judul_karya}</p>
            <p className="text-xs text-green-400/60 mt-0.5">{submission.sub_tema}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-red rounded-xl p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="glass rounded-2xl p-6 space-y-4">
        {/* Poster lama */}
        {submission?.file_url && !preview && (
          <div>
            <p className="text-sm font-medium text-green-300 mb-2 flex items-center gap-2">
              <RefreshCw size={14} />
              Poster Saat Ini
            </p>
            <div className="relative rounded-xl overflow-hidden bg-dark-700 aspect-video max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={submission.file_url}
                alt="Poster saat ini"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-green-400/50 mt-2">
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
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
              dragging
                ? "border-upn-green-500 bg-upn-green-800/15"
                : "border-white/15 hover:border-upn-green-600/50 hover:bg-upn-green-900/5"
            }`}
          >
            <input
              id="input-file-upload"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragging ? "text-green-400" : "text-green-600/50"}`} />
            <p className="text-sm font-semibold text-green-200">
              {dragging ? "Lepaskan file di sini" : "Klik atau seret file ke sini"}
            </p>
            <p className="text-xs text-green-400/50 mt-1">JPG, JPEG, PNG — Maks. 2MB</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-dark-700 aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview poster" className="w-full h-full object-cover" />
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 glass p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <CheckCircle2 size={14} />
              <span>{selectedFile?.name}</span>
              <span className="text-green-400/40">·</span>
              <span>{selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) + " MB" : ""}</span>
            </div>
          </div>
        )}

        {fileError && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <FileWarning size={14} />
            {fileError}
          </div>
        )}

        {/* Aturan */}
        <div className="glass-green rounded-xl p-3 text-xs text-green-300/70 space-y-1">
          <p className="font-semibold text-green-300">Ketentuan File:</p>
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
