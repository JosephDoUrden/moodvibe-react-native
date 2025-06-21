#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SOUNDS_DIR = path.join(__dirname, "../assets/sounds");

// File size limit for GitHub (in MB)
const GITHUB_LIMIT_MB = 50;

// Compression settings for ambient sounds
const COMPRESSION_SETTINGS = {
  bitrate: "128k", // Good quality for ambient sounds
  sampleRate: "44100", // Standard sample rate
  channels: "2", // Stereo
};

console.log("🎵 MoodVibe Audio Optimizer");
console.log("================================");

function checkFFmpeg() {
  try {
    execSync("which ffmpeg", { stdio: "ignore" });
    console.log("✅ FFmpeg found");
    return true;
  } catch (error) {
    console.log("❌ FFmpeg not found. Please install it first:");
    console.log("   macOS: brew install ffmpeg");
    console.log("   Ubuntu: sudo apt install ffmpeg");
    console.log("   Windows: Download from https://ffmpeg.org/");
    return false;
  }
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2); // Size in MB
  } catch (error) {
    return 0;
  }
}

function optimizeAudioFile(fileName) {
  const inputPath = path.join(SOUNDS_DIR, fileName);
  const backupPath = path.join(SOUNDS_DIR, `${fileName}.backup`);
  const tempPath = path.join(SOUNDS_DIR, `${fileName}.temp`);

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return;
  }

  const originalSize = getFileSize(inputPath);
  console.log(`\n🔧 Optimizing ${fileName} (${originalSize} MB)...`);

  try {
    // Create backup
    fs.copyFileSync(inputPath, backupPath);
    console.log(`   📋 Backup created: ${fileName}.backup`);

    // Compress audio file
    const ffmpegCommand = `ffmpeg -i "${inputPath}" -b:a ${COMPRESSION_SETTINGS.bitrate} -ar ${COMPRESSION_SETTINGS.sampleRate} -ac ${COMPRESSION_SETTINGS.channels} -y "${tempPath}"`;

    console.log(`   ⚙️  Compressing...`);
    execSync(ffmpegCommand, { stdio: "pipe" });

    // Replace original with compressed version
    fs.renameSync(tempPath, inputPath);

    const newSize = getFileSize(inputPath);
    const reduction = (((originalSize - newSize) / originalSize) * 100).toFixed(
      1
    );

    console.log(
      `   ✅ Optimized: ${originalSize} MB → ${newSize} MB (${reduction}% reduction)`
    );

    // Clean up backup if size is acceptable
    if (newSize < 50) {
      fs.unlinkSync(backupPath);
      console.log(`   🗑️  Backup removed (optimization successful)`);
    } else {
      console.log(`   ⚠️  File still large (${newSize} MB). Backup kept.`);
    }
  } catch (error) {
    console.error(`   ❌ Error optimizing ${fileName}:`, error.message);

    // Restore from backup if compression failed
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, inputPath);
      fs.unlinkSync(backupPath);
      console.log(`   🔄 Restored from backup`);
    }
  }
}

function checkAllFileSizes() {
  console.log("\n📊 Current file sizes:");
  console.log("=====================");

  const files = fs
    .readdirSync(SOUNDS_DIR)
    .filter((file) => file.endsWith(".mp3") && !file.includes(".backup"));

  files.forEach((file) => {
    const size = getFileSize(path.join(SOUNDS_DIR, file));
    const status = size > 50 ? "🔴" : size > 25 ? "🟡" : "🟢";
    console.log(`${status} ${file}: ${size} MB`);
  });
}

function main() {
  console.log("Checking system requirements...");

  if (!checkFFmpeg()) {
    process.exit(1);
  }

  if (!fs.existsSync(SOUNDS_DIR)) {
    console.log(`❌ Sounds directory not found: ${SOUNDS_DIR}`);
    process.exit(1);
  }

  // Show current file sizes
  checkAllFileSizes();

  // Find and optimize large files automatically
  console.log("\n🎯 Finding and optimizing large files...");
  console.log("==========================================");

  const files = fs
    .readdirSync(SOUNDS_DIR)
    .filter((file) => file.endsWith(".mp3") && !file.includes(".backup"));

  const largeFiles = files.filter((file) => {
    const size = parseFloat(getFileSize(path.join(SOUNDS_DIR, file)));
    return size > GITHUB_LIMIT_MB;
  });

  if (largeFiles.length === 0) {
    console.log("✅ No files exceed GitHub's 50MB limit. All good!");
  } else {
    console.log(
      `Found ${largeFiles.length} file(s) exceeding ${GITHUB_LIMIT_MB}MB:`
    );
    largeFiles.forEach((file) => {
      const size = getFileSize(path.join(SOUNDS_DIR, file));
      console.log(`🔴 ${file}: ${size} MB`);
    });

    largeFiles.forEach((file) => {
      optimizeAudioFile(file);
    });
  }

  // Show final results
  console.log("\n🎉 Optimization complete!");
  checkAllFileSizes();

  console.log("\n📝 Next steps:");
  console.log("1. Test the optimized audio files in your app");
  console.log("2. If quality is good, commit and push to GitHub");
  console.log("3. If not satisfied, restore from .backup files");
}

if (require.main === module) {
  main();
}

module.exports = { optimizeAudioFile, checkAllFileSizes };
