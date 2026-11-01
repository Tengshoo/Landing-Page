import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Locate FFmpeg & FFprobe binary reliably on Windows / ARM64 / x64
function findFfmpeg(): { ffmpegPath: string; ffprobePath?: string } {
  const localAppData = process.env.LOCALAPPDATA || '';
  const wingetBase = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
  
  if (fs.existsSync(wingetBase)) {
    const packages = fs.readdirSync(wingetBase);
    for (const pkg of packages) {
      if (pkg.toLowerCase().includes('ffmpeg')) {
        const pkgDir = path.join(wingetBase, pkg);
        // Look recursively or inside subfolders
        const subdirs = fs.readdirSync(pkgDir);
        for (const sub of subdirs) {
          const candidateBin = path.join(pkgDir, sub, 'bin', 'ffmpeg.exe');
          const candidateProbe = path.join(pkgDir, sub, 'bin', 'ffprobe.exe');
          if (fs.existsSync(candidateBin)) {
            return {
              ffmpegPath: candidateBin,
              ffprobePath: fs.existsSync(candidateProbe) ? candidateProbe : undefined
            };
          }
        }
      }
    }
  }

  // Fallback to Playwright ffmpeg or system PATH
  const pwFfmpeg = path.join(localAppData, 'ms-playwright', 'ffmpeg-1013', 'ffmpeg-win64.exe');
  if (fs.existsSync(pwFfmpeg)) {
    return { ffmpegPath: pwFfmpeg };
  }

  return { ffmpegPath: 'ffmpeg' };
}

const { ffmpegPath, ffprobePath } = findFfmpeg();
ffmpeg.setFfmpegPath(ffmpegPath);
if (ffprobePath) {
  ffmpeg.setFfprobePath(ffprobePath);
}

// 2. Generate Aesthetic Transparent Overlay (Top hook card + Bottom watermark pill)
function getOverlayHtml(hookText: string, watermarkText: string = 'Cuba demo di memoira.art'): string {
  return `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1920px;
      background: transparent;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      position: relative;
      overflow: hidden;
    }
    .hook-wrap {
      position: absolute;
      top: 90px;
      left: 48px;
      right: 48px;
      display: flex;
      justify-content: center;
    }
    .hook-card {
      width: 100%;
      background: rgba(18, 14, 11, 0.94);
      border: 2px solid rgba(212, 175, 55, 0.5);
      border-radius: 36px;
      padding: 36px 44px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(212, 175, 55, 0.15);
      text-align: center;
    }
    .hook-title {
      color: #ffffff;
      font-size: 38px;
      font-weight: 800;
      line-height: 1.38;
      letter-spacing: -0.01em;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
    }
    .watermark-wrap {
      position: absolute;
      bottom: 75px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
    }
    .watermark-pill {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: rgba(18, 14, 11, 0.92);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      border-radius: 9999px;
      padding: 18px 42px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
    }
    .watermark-text {
      color: #f7eed9;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
  </style>
</head>
<body>
  <div class="hook-wrap">
    <div class="hook-card">
      <div class="hook-title">${hookText}</div>
    </div>
  </div>
  <div class="watermark-wrap">
    <div class="watermark-pill">
      <span class="watermark-text">🔗 ${watermarkText}</span>
    </div>
  </div>
</body>
</html>`;
}

export interface VideoGenOptions {
  targetUrl: string;
  hookText: string;
  outputName?: string;
  watermarkText?: string;
  bgmPath?: string;
}

/**
 * Main function to record mobile web view and post-process with FFmpeg into 9:16 MP4.
 */
export async function generatePromoVideo(options: VideoGenOptions): Promise<string> {
  const {
    targetUrl,
    hookText,
    outputName = `promo-${Date.now()}.mp4`,
    watermarkText = 'Cuba demo di memoira.art',
  } = options;

  console.log('\n======================================================');
  console.log(`🎬 MEMOIRA PROMO VIDEO GENERATOR`);
  console.log(`🌐 Target URL: ${targetUrl}`);
  console.log(`💬 Hook: "${hookText}"`);
  console.log(`📁 Output: ${outputName}`);
  console.log('======================================================\n');

  // Setup directories
  const rawDir = path.join(__dirname, 'raw-videos');
  const tempDir = path.join(__dirname, 'temp');
  const outputDir = path.join(__dirname, 'output-mp4');
  const publicPromoDir = path.join(__dirname, '..', 'promo');
  const assetsPromoDir = path.join(__dirname, '..', 'assets', 'promo');

  [rawDir, tempDir, outputDir, publicPromoDir, assetsPromoDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Step 1: Launch Playwright & Record Mobile Screen
  console.log('📱 [1/3] Membuka Chromium (Mobile Viewport 390x844, 9:16)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: rawDir
    }
  });

  const page = await context.newPage();

  console.log(`⏳ Memuat turun halaman: ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });

  // Handle any splash screens, welcome buttons, or audio toggles
  try {
    const enterButtons = page.locator('button:has-text("Enter"), button:has-text("Masuk"), button:has-text("Buka"), a:has-text("Open Gallery"), a:has-text("Live Wall")');
    if (await enterButtons.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('👆 Menekan butang navigasi / galeri...');
      await enterButtons.first().click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
    }
  } catch (err) {}

  // Pause at the Hero header for 2 seconds
  console.log('⏱️ Menunggu 2 saat di bahagian Hero/Header...');
  await page.waitForTimeout(2000);

  // If this is the demo gallery and there is an "Open Gallery & Live Wall" link, transition to the live wall
  if (targetUrl.includes('atifismagallery.memoira.art')) {
    try {
      const liveWallLink = page.locator('a[href*="/wall/"], a:has-text("Open Gallery & Live Wall")').first();
      if (await liveWallLink.isVisible({ timeout: 1500 }).catch(() => false)) {
        console.log('🖼️ Membuka Live Wall & Grid Galeri Tetamu...');
        await liveWallLink.click().catch(() => {});
        await page.waitForTimeout(1500);
      }
    } catch (e) {}
  }

  // Human-like smooth scroll down over 10-12 seconds
  console.log('📜 Melakukan smooth scrolling berperingkat (10-12 saat)...');
  const scrollSteps = 24;
  const isLandingPage = targetUrl.includes('memoira.art') && !targetUrl.includes('atifismagallery');
  const scrollAmount = isLandingPage ? 280 : 120;

  for (let i = 0; i < scrollSteps; i++) {
    await page.evaluate((top) => {
      window.scrollBy({ top, behavior: 'smooth' });
    }, scrollAmount);
    await page.waitForTimeout(450);
  }

  // Pause at the wishes / pricing area for 2 seconds
  console.log('✨ Berhenti seketika di ruangan ucapan / pakej selama 2 saat...');
  await page.waitForTimeout(2000);

  // Close context to finish writing the .webm video file
  await context.close();
  const rawVideoPath = await page.video()?.path();
  console.log(`✅ Rakaman mentah siap: ${rawVideoPath}`);

  // Step 2: Render Transparent 1080x1920 Overlay Image
  console.log('🎨 [2/3] Menghasilkan overlay kad hook & watermark resolusi 1080x1920...');
  const overlayHtml = getOverlayHtml(hookText, watermarkText);
  const overlayPage = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await overlayPage.setContent(overlayHtml, { waitUntil: 'networkidle' });
  const overlayPath = path.join(tempDir, `overlay-${Date.now()}.png`);
  await overlayPage.screenshot({ path: overlayPath, omitBackground: true });
  await overlayPage.close();
  await browser.close();

  // Step 3: FFmpeg Post-Processing (Transcode, Scale 9:16, Overlay & Optional BGM)
  console.log('🎞️ [3/3] Memproses video dengan FFmpeg (H.264, 60fps, 1080x1920)...');
  const finalMp4Path = path.join(outputDir, outputName);
  const bgmFile = options.bgmPath || [
    path.join(__dirname, 'bgm.mp3'),
    path.join(__dirname, '..', 'bgm.mp3'),
    path.join(__dirname, 'assets', 'bgm.mp3')
  ].find(f => fs.existsSync(f));

  if (!rawVideoPath || !fs.existsSync(rawVideoPath)) {
    throw new Error(`Fail rakaman mentah tidak dijumpai di ${rawVideoPath}`);
  }

  // Get video duration via ffprobe or default 15s
  let duration = 15;
  try {
    const probeCmd = `"${ffmpegPath}" -i "${rawVideoPath}" 2>&1`;
    const probeOutput = execSync(probeCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const match = probeOutput.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d+)/);
    if (match) {
      duration = parseFloat(match[1]) * 3600 + parseFloat(match[2]) * 60 + parseFloat(match[3]);
    }
  } catch (err) {}

  // Construct FFmpeg command
  // Video filter: scale mobile viewport smoothly to 1080x2337, crop center 1080x1920, overlay graphic card
  let filterComplex = `[0:v]scale=1080:2337,crop=1080:1920:0:0[bg];[bg][1:v]overlay=0:0[v]`;
  let ffmpegArgs = [
    '-y',
    '-i', rawVideoPath,
    '-i', overlayPath
  ];

  if (bgmFile && fs.existsSync(bgmFile)) {
    console.log(`🎵 Menggabungkan muzik latar: ${bgmFile}`);
    const fadeStart = Math.max(0, duration - 2);
    ffmpegArgs.push('-i', bgmFile);
    filterComplex += `;[2:a]afade=t=out:st=${fadeStart}:d=2[a]`;
    ffmpegArgs.push('-filter_complex', filterComplex, '-map', '[v]', '-map', '[a]', '-shortest');
  } else {
    ffmpegArgs.push('-filter_complex', filterComplex, '-map', '[v]');
  }

  ffmpegArgs.push(
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-r', '60',
    '-crf', '22',
    '-preset', 'medium',
    finalMp4Path
  );

  console.log(`⚡ Menjalankan transcode: ${path.basename(finalMp4Path)}...`);
  execSync(`"${ffmpegPath}" ${ffmpegArgs.map(a => `"${a}"`).join(' ')}`, { stdio: 'inherit' });

  // Cleanup temp overlay
  try {
    if (fs.existsSync(overlayPath)) fs.unlinkSync(overlayPath);
  } catch (e) {}

  // Copy to web hosting public directories
  const promoCopy1 = path.join(publicPromoDir, outputName);
  const promoCopy2 = path.join(assetsPromoDir, outputName);
  fs.copyFileSync(finalMp4Path, promoCopy1);
  fs.copyFileSync(finalMp4Path, promoCopy2);

  const stats = fs.statSync(finalMp4Path);
  console.log(`\n🎉 Siap! Fail dijana: ${finalMp4Path} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`🌐 Salinan sedia untuk web:`);
  console.log(`   - ${promoCopy1}`);
  console.log(`   - ${promoCopy2}\n`);

  return finalMp4Path;
}

// 4. CLI Execution / Batch 3 Promo Generator
async function run() {
  const args = process.argv.slice(2);

  if (args.length >= 2) {
    const targetUrl = args[0];
    const hookText = args[1];
    const outputName = args[2] || `promo-${Date.now()}.mp4`;
    await generatePromoVideo({ targetUrl, hookText, outputName });
    return;
  }

  console.log('🚀 Menjana 3 Video Promosi Memoira untuk Buffer & Threads...');

  const queue = [
    {
      outputName: 'promo-1.mp4',
      targetUrl: 'https://atifismagallery.memoira.art',
      hookText: 'Buku guestbook selalu kosong? Guna QR Gallery ni je atas meja makan 📸'
    },
    {
      outputName: 'promo-2.mp4',
      targetUrl: 'https://atifismagallery.memoira.art',
      hookText: 'Tak payah tunggu 2 bulan, malam lepas majlis dah boleh scroll gambar candid tetamu 🤍'
    },
    {
      outputName: 'promo-3.mp4',
      targetUrl: 'https://memoira.art',
      hookText: 'Digital Guestbook & Live Photo Gallery untuk pengantin 2026/2027 ✨'
    }
  ];

  for (const item of queue) {
    await generatePromoVideo(item);
  }

  console.log('\n======================================================');
  console.log('✨ KETIGA-TIGA PROMO VIDEO TELAH BERJAYA DIJANA!');
  console.log('1. promo-1.mp4 (Atif & Isma Demo Gallery)');
  console.log('2. promo-2.mp4 (Candid Moments Relive Demo)');
  console.log('3. promo-3.mp4 (Memoira Landing Page Showcase)');
  console.log('======================================================\n');
}

// Run if called directly
run().catch((err) => {
  console.error('❌ Ralat semasa menjana video:', err);
  process.exit(1);
});
