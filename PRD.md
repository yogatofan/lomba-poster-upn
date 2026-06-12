# Product Requirements Document (PRD)
## Aplikasi Pendaftaran & Penilaian Lomba Poster Pencegahan Kekerasan Seksual
### Dies Natalis 67 UPN "Veteran" Jawa Timur — Rekor MURI

---

## 1. Latar Belakang

UPN "Veteran" Jawa Timur menyelenggarakan lomba poster bertema pencegahan kekerasan seksual sebagai bagian dari rangkaian Dies Natalis, dengan target Rekor MURI untuk kategori jumlah peserta. Dibutuhkan aplikasi web untuk menampung pendaftaran peserta, pengumpulan karya (poster), serta proses penilaian oleh juri secara digital dan transparan.

## 2. Tujuan

- Memudahkan mahasiswa mendaftar dan mengunggah karya poster secara online.
- Mendokumentasikan data peserta secara rapi sebagai bukti pendukung pengajuan Rekor MURI.
- Memfasilitasi juri untuk menilai karya berdasarkan indikator yang telah ditetapkan, dengan kalkulasi skor otomatis.
- Menyediakan rekap/leaderboard hasil penilaian untuk panitia.

## 3. Lingkup (Scope)

### Termasuk dalam scope:
- Registrasi & login untuk peserta dan juri.
- Form pendaftaran lomba (data diri + pemilihan sub-tema).
- Upload poster (1 file per peserta, maks. 2MB).
- Form penilaian juri dengan 4 indikator berbobot.
- Dashboard admin: rekap peserta, export data, leaderboard.

### Tidak termasuk dalam scope (v1):
- Kompresi/optimasi gambar otomatis di sisi server.
- Pembayaran/biaya pendaftaran.
- Notifikasi email otomatis (opsional untuk versi lanjutan).
- Sistem banding/komplain nilai.

## 4. Tech Stack

| Komponen | Teknologi | Catatan |
|---|---|---|
| Frontend & Backend (API Routes) | Next.js | Hosting di Vercel (free tier) |
| Database & Auth | Supabase (PostgreSQL + Auth) | Free tier |
| Storage Poster | Cloudinary | Free tier, batas upload diatur di sisi aplikasi |
| Hosting | Vercel | Free tier |

## 5. Batasan Teknis Penting

- **Ukuran file upload poster: maksimal 2MB**, divalidasi di sisi client (sebelum upload) dan sisi server (API route) — tanpa kompresi otomatis.
- Format file yang diterima: **JPG, JPEG, PNG**. (PDF tidak disarankan karena ukuran file cenderung besar dan sulit dikontrol di bawah 2MB).
- Validasi ukuran file dilakukan **sebelum** file dikirim ke Cloudinary, untuk menghindari beban request ke Vercel serverless function (limit ~4.5MB per request).
- Jika peserta upload ulang (revisi), file lama di Cloudinary otomatis dihapus (replace) agar kuota storage tidak menumpuk.

## 6. Role & Hak Akses

| Role | Hak Akses |
|---|---|
| **Peserta** | Registrasi, login, isi data diri, pilih sub-tema, upload/reupload poster, lihat status karya sendiri |
| **Juri** | Login, lihat daftar karya (anonim/tanpa nama peserta), isi skor 4 indikator, lihat skor total otomatis, beri catatan |
| **Admin/Panitia** | Login, kelola akun juri, monitor jumlah pendaftar, buka/tutup pendaftaran, export data peserta, lihat leaderboard hasil akhir |

## 7. Sub-Tema Lomba

Peserta wajib memilih salah satu dari 5 sub-tema berikut saat mendaftar:

1. Kenali, Cegah, dan Lawan Kekerasan Seksual
2. Berani Bicara, Berani Melapor
3. Stop Normalisasi Pelecehan Seksual
4. Bijak Bermedia Sosial, Cegah Kekerasan Seksual Digital
5. Teman Peduli, Kampus Terlindungi

## 8. Indikator Penilaian Juri

| Indikator Penilaian | Deskripsi | Bobot (%) |
|---|---|---|
| Kesesuaian Tema | Poster relevan dengan sub-tema pencegahan kekerasan seksual. | 25% |
| Orisinalitas Ide | Gagasan segar, bukan plagiasi, pendekatan unik. | 25% |
| Desain & Estetika | Komposisi warna, layout, tipografi, elemen visual seimbang. | 30% |
| Pesan & Call to Action | Pesan jelas, mudah dipahami, mengajak audiens bertindak. | 20% |

**Rumus skor total:**
```
Total Skor = (0.25 × Skor Kesesuaian Tema)
            + (0.25 × Skor Orisinalitas Ide)
            + (0.30 × Skor Desain & Estetika)
            + (0.20 × Skor Pesan & Call to Action)
```
Setiap indikator dinilai dengan skala 1-100. Skor total per juri dihitung otomatis oleh sistem. Skor akhir peserta = rata-rata total skor dari seluruh juri.

## 9. Skema Database (Supabase / PostgreSQL)

### Tabel `profiles` (extends Supabase Auth `users`)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK, FK ke auth.users) | |
| full_name | text | Nama lengkap |
| role | text | 'peserta' / 'juri' / 'admin' |
| created_at | timestamp | |

### Tabel `participants`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| profile_id | uuid (FK ke profiles.id) | |
| npm | text | |
| program_studi | text | |
| fakultas | text | |
| no_hp | text | |

### Tabel `submissions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| participant_id | uuid (FK ke participants.id) | |
| sub_tema | text | salah satu dari 5 sub-tema |
| judul_karya | text | |
| file_url | text | URL Cloudinary |
| file_public_id | text | ID Cloudinary (untuk hapus saat reupload) |
| status | text | 'submitted' / 'revisi' |
| submitted_at | timestamp | |

### Tabel `scores`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| submission_id | uuid (FK ke submissions.id) | |
| juri_id | uuid (FK ke profiles.id) | |
| skor_tema | numeric | 1-100 |
| skor_orisinalitas | numeric | 1-100 |
| skor_desain | numeric | 1-100 |
| skor_pesan | numeric | 1-100 |
| total_skor | numeric | hasil kalkulasi otomatis |
| catatan | text | opsional |
| created_at | timestamp | |

### Tabel `settings`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| pendaftaran_dibuka | boolean | |
| tanggal_mulai | timestamp | |
| tanggal_selesai | timestamp | |

## 10. Alur Pengguna (User Flow)

### 10.1 Peserta
1. Registrasi akun (email + password via Supabase Auth).
2. Lengkapi data diri: nama, NPM, program studi, fakultas, no. HP.
3. Pilih 1 sub-tema dari 5 pilihan.
4. Upload poster (validasi maks. 2MB, format JPG/PNG, ditampilkan error jika melebihi batas).
5. Submit karya → status "Terkirim".
6. Dapat melakukan reupload sebelum periode pendaftaran ditutup (file lama otomatis diganti).

### 10.2 Juri
1. Login dengan akun yang dibuat admin.
2. Melihat daftar karya yang masuk (nama peserta disembunyikan, hanya menampilkan kode submission & sub-tema).
3. Memilih karya untuk dinilai → mengisi form 4 indikator (skala 1-100).
4. Sistem menampilkan preview total skor sebelum disimpan.
5. Submit nilai → progress "X dari Y karya telah dinilai" terupdate.
6. Dapat mengedit nilai yang sudah diberikan selama periode penilaian masih berjalan.

### 10.3 Admin
1. Login dengan akun admin.
2. Dashboard menampilkan: total peserta, jumlah karya per sub-tema, status pendaftaran (buka/tutup).
3. Kelola akun juri (tambah/hapus).
4. Buka/tutup periode pendaftaran dan penilaian.
5. Export data peserta (nama, NPM, fakultas, sub-tema, waktu daftar) ke CSV/Excel — untuk dokumentasi Rekor MURI.
6. Lihat leaderboard: ranking peserta berdasarkan rata-rata total skor dari seluruh juri.

## 11. Validasi Upload File (Detail Teknis)

1. **Validasi client-side**: saat peserta memilih file, JavaScript memeriksa `file.size` sebelum mengizinkan submit. Jika > 2MB, tampilkan pesan error dan tolak upload tanpa mengirim ke server.
2. **Validasi server-side (API route Next.js)**: sebagai lapisan kedua, API route memeriksa ulang `Content-Length` / ukuran file yang diterima sebelum diteruskan ke Cloudinary. Jika melebihi 2MB, kembalikan response error 413.
3. **Format**: hanya menerima `image/jpeg` dan `image/png`, divalidasi melalui MIME type.
4. **Cloudinary upload preset**: dikonfigurasi dengan batas maksimum file size 2MB sebagai lapisan validasi tambahan di sisi storage.
5. **Reupload**: sebelum upload file baru, sistem menghapus `file_public_id` lama dari Cloudinary via API, lalu menyimpan `file_url` dan `file_public_id` yang baru.

## 12. Halaman Aplikasi (Page List)

| Path | Akses | Deskripsi |
|---|---|---|
| `/login`, `/register` | Publik | Autentikasi |
| `/peserta/dashboard` | Peserta | Status pendaftaran & karya |
| `/peserta/daftar` | Peserta | Form data diri + pilih sub-tema |
| `/peserta/upload` | Peserta | Upload/reupload poster |
| `/juri/dashboard` | Juri | Daftar karya & progress penilaian |
| `/juri/nilai/[id]` | Juri | Form penilaian per karya |
| `/admin/dashboard` | Admin | Statistik & monitoring |
| `/admin/peserta` | Admin | Daftar peserta + export |
| `/admin/juri` | Admin | Kelola akun juri |
| `/admin/leaderboard` | Admin | Hasil akhir & ranking |
| `/admin/settings` | Admin | Buka/tutup periode |

## 13. Pertimbangan Keamanan & Privasi

- Penilaian dilakukan secara anonim (juri tidak melihat nama peserta) untuk menjaga objektivitas.
- Row Level Security (RLS) Supabase diaktifkan: peserta hanya bisa melihat/mengedit data miliknya sendiri, juri hanya bisa melihat submission dan nilai yang relevan, admin memiliki akses penuh.
- Disclaimer/panduan konten poster ditampilkan di halaman pendaftaran, mengingat sensitivitas tema kekerasan seksual (karya harus edukatif, tidak eksploitatif/grafis).

## 14. Estimasi Penggunaan Free Tier

| Layanan | Free Tier | Estimasi Kebutuhan (asumsi 300 peserta) |
|---|---|---|
| Cloudinary Storage | 25 GB | Maks. 300 × 2MB = 600 MB (jauh di bawah limit) |
| Supabase Database | 500 MB | Cukup untuk ribuan baris data peserta & skor |
| Supabase Auth | 50.000 MAU | Lebih dari cukup |
| Vercel Functions | 100 GB-Hours/bulan | Cukup untuk traffic skala lomba kampus |

## 15. Roadmap Pengembangan (Disarankan)

1. **Fase 1**: Setup project Next.js + Supabase (auth, database, RLS) + integrasi Cloudinary.
2. **Fase 2**: Modul peserta (registrasi, pendaftaran, upload poster + validasi 2MB).
3. **Fase 3**: Modul juri (daftar karya, form penilaian, kalkulasi skor otomatis).
4. **Fase 4**: Modul admin (dashboard, export data, leaderboard, settings).
5. **Fase 5**: Testing end-to-end, deploy ke Vercel, dokumentasi penggunaan untuk panitia.

## 16. Catatan Tambahan untuk PIC

- Data peserta yang ter-export (nama, NPM, fakultas, waktu daftar) bisa langsung digunakan sebagai bukti pendukung pengajuan Rekor MURI.
- Disarankan menetapkan batas waktu pendaftaran yang jelas, mengingat fitur "buka/tutup periode" di pengaturan admin akan mengunci form pendaftaran & upload setelah deadline.
- Akun juri sebaiknya dibuat manual oleh admin (bukan self-register) untuk menghindari penyalahgunaan.
