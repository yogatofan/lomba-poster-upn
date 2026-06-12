import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
    }

    // Check pendaftaran still open
    const { data: settings } = await supabase
      .from("settings")
      .select("pendaftaran_dibuka")
      .single();
    if (!settings?.pendaftaran_dibuka) {
      return NextResponse.json(
        { error: "Pendaftaran telah ditutup. Upload tidak dapat dilakukan." },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const submissionId = formData.get("submissionId") as string | null;
    const oldPublicId = formData.get("oldPublicId") as string | null;

    if (!file || !submissionId) {
      return NextResponse.json({ error: "File dan submission ID wajib diisi." }, { status: 400 });
    }

    // Validate file type (server-side)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak valid. Gunakan JPG atau PNG." },
        { status: 400 }
      );
    }

    // Validate file size (server-side — guard against Vercel 4.5MB limit)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file melebihi batas 2MB (${(file.size / 1024 / 1024).toFixed(2)}MB).` },
        { status: 413 }
      );
    }

    // Verify submission belongs to this user
    const { data: submission } = await supabase
      .from("submissions")
      .select("id, participant_id, participants(profile_id)")
      .eq("id", submissionId)
      .single();

    if (!submission) {
      return NextResponse.json({ error: "Submission tidak ditemukan." }, { status: 404 });
    }

    const participant = submission.participants as unknown as { profile_id: string } | null;
    if (participant?.profile_id !== user.id) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    // Delete old Cloudinary file if exists
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch {
        // Non-fatal: proceed even if delete fails
        console.warn("Gagal menghapus file lama Cloudinary:", oldPublicId);
      }
    }

    // Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "lomba-poster-upn",
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png"],
          max_bytes: MAX_FILE_SIZE,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; public_id: string });
        }
      );
      uploadStream.end(buffer);
    });

    // Update submission in database
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        file_url: uploadResult.secure_url,
        file_public_id: uploadResult.public_id,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateError) {
      return NextResponse.json({ error: "Gagal menyimpan data upload." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      file_url: uploadResult.secure_url,
      file_public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
