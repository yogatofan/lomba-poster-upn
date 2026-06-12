// Cloudinary Onboarding Test Script
const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary (Inline credentials)
cloudinary.config({
  cloud_name: 'dq87gd4oc',
  api_key: '755882265558417',
  api_secret: 'LdOQDlLb5RPks3bq4Jrn4bqxZGc'
});

async function runTest() {
  console.log('⏳ Memulai pengujian Cloudinary...');
  
  try {
    // 2. Upload an image from demo domain
    const sampleImageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    console.log(`📤 Mengunggah gambar sampel dari: ${sampleImageUrl}`);
    
    const uploadResult = await cloudinary.uploader.upload(sampleImageUrl, {
      folder: 'lomba_poster_upn_test'
    });

    console.log('✅ Gambar berhasil diunggah!');
    console.log(`🔗 Secure URL: ${uploadResult.secure_url}`);
    console.log(`🆔 Public ID: ${uploadResult.public_id}`);

    // 3. Get image details (metadata)
    console.log('\n📊 Detail Gambar:');
    console.log(`   - Lebar (Width): ${uploadResult.width}px`);
    console.log(`   - Tinggi (Height): ${uploadResult.height}px`);
    console.log(`   - Format: ${uploadResult.format}`);
    console.log(`   - Ukuran File: ${uploadResult.bytes} bytes`);

    // 4. Transform the image
    // Generate URL with f_auto (auto format) and q_auto (auto quality)
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      // f_auto: memilih format terbaik secara otomatis sesuai browser target (misal WebP/AVIF)
      fetch_format: 'auto',
      // q_auto: mengompresi kualitas gambar secara optimal tanpa mengurangi visual secara signifikan
      quality: 'auto',
      secure: true
    });

    console.log('\n════════════════════════════════════════');
    console.log('✅ PENGUJIAN SELESAI!');
    console.log('════════════════════════════════════════');
    console.log('Done! Click link below to see optimized version of the image. Check the size and the format.');
    console.log(`🔗 Transformed URL: ${transformedUrl}\n`);

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat pengujian Cloudinary:', error);
    process.exit(1);
  }
}

runTest();
