#!/usr/bin/env node

/**
 * MoodVibe Audio Setup Script
 *
 * This script helps set up and verify audio files for the MoodVibe app.
 * Run this after adding your audio files to the assets/sounds directory.
 */

const fs = require("fs");
const path = require("path");

const SOUNDS_DIR = path.join(__dirname, "..", "assets", "sounds");
const REQUIRED_FILES = [
  "ocean_waves.mp3",
  "rain_light.mp3",
  "forest_birds.mp3",
  "white_noise.mp3",
  "coffee_shop.mp3",
  "brown_noise.mp3",
  "rain_thunder.mp3",
  "night_crickets.mp3",
  "fireplace.mp3",
  "flowing_water.mp3",
  "city_rain.mp3",
  "wind_chimes.mp3",
  "tibetan_bowls.mp3",
  "ambient_drone.mp3",
  "om_chanting.mp3",
  "gentle_piano.mp3",
  "deep_breathing.mp3",
  "alpha_waves.mp3",
];

function checkAudioFiles() {
  console.log("🎵 MoodVibe Audio Setup Checker\n");

  // Check if sounds directory exists
  if (!fs.existsSync(SOUNDS_DIR)) {
    console.log("📁 Creating assets/sounds directory...");
    fs.mkdirSync(SOUNDS_DIR, { recursive: true });
  }

  // Check each required file
  const missingFiles = [];
  const existingFiles = [];
  const fileSizes = {};

  REQUIRED_FILES.forEach((filename) => {
    const filePath = path.join(SOUNDS_DIR, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      fileSizes[filename] = sizeMB;
      existingFiles.push(filename);
      console.log(`✅ ${filename} (${sizeMB} MB)`);
    } else {
      missingFiles.push(filename);
      console.log(`❌ ${filename} - Missing`);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`✅ Found: ${existingFiles.length} files`);
  console.log(`❌ Missing: ${missingFiles.length} files`);

  if (missingFiles.length > 0) {
    console.log(`\n🔍 Missing audio files:`);
    missingFiles.forEach((file) => console.log(`   - ${file}`));
    console.log(`\n💡 Tips for finding audio files:`);
    console.log(`   - Freesound.org (CC0 license)`);
    console.log(`   - YouTube Audio Library`);
    console.log(`   - BBC Sound Effects Archive`);
    console.log(`   - Zapsplat (requires account)`);
  }

  // Check file sizes
  const largeSizes = Object.entries(fileSizes).filter(
    ([_, size]) => parseFloat(size) > 5
  );
  if (largeSizes.length > 0) {
    console.log(`\n⚠️  Large files (>5MB):`);
    largeSizes.forEach(([file, size]) =>
      console.log(`   - ${file}: ${size} MB`)
    );
    console.log(`   Consider compressing for smaller app size.`);
  }

  // Calculate total size
  const totalSize = Object.values(fileSizes).reduce(
    (sum, size) => sum + parseFloat(size),
    0
  );
  console.log(`\n📦 Total audio size: ${totalSize.toFixed(2)} MB`);

  return { existingFiles, missingFiles, totalSize };
}

function generateAudioServiceUpdate() {
  console.log("\n🔧 Next: Update AudioService static mapping...\n");

  const updateCode = `
// Update the getAudioAsset() method in AudioService.ts:
private getAudioAsset(fileName: string) {
  const audioAssets: { [key: string]: any } = {
    'ocean_waves.mp3': require('../../assets/sounds/ocean_waves.mp3'),
    'rain_light.mp3': require('../../assets/sounds/rain_light.mp3'),
    'forest_birds.mp3': require('../../assets/sounds/forest_birds.mp3'),
    'white_noise.mp3': require('../../assets/sounds/white_noise.mp3'),
    'coffee_shop.mp3': require('../../assets/sounds/coffee_shop.mp3'),
    'brown_noise.mp3': require('../../assets/sounds/brown_noise.mp3'),
    'rain_thunder.mp3': require('../../assets/sounds/rain_thunder.mp3'),
    'night_crickets.mp3': require('../../assets/sounds/night_crickets.mp3'),
    'fireplace.mp3': require('../../assets/sounds/fireplace.mp3'),
    'flowing_water.mp3': require('../../assets/sounds/flowing_water.mp3'),
    'city_rain.mp3': require('../../assets/sounds/city_rain.mp3'),
    'wind_chimes.mp3': require('../../assets/sounds/wind_chimes.mp3'),
    'tibetan_bowls.mp3': require('../../assets/sounds/tibetan_bowls.mp3'),
    'ambient_drone.mp3': require('../../assets/sounds/ambient_drone.mp3'),
    'om_chanting.mp3': require('../../assets/sounds/om_chanting.mp3'),
    'gentle_piano.mp3': require('../../assets/sounds/gentle_piano.mp3'),
    'deep_breathing.mp3': require('../../assets/sounds/deep_breathing.mp3'),
    'alpha_waves.mp3': require('../../assets/sounds/alpha_waves.mp3'),
  };
  return audioAssets[fileName] || null;
}`;

  console.log(
    "Replace the 'null' values in getAudioAsset() method with actual require() calls:"
  );
  console.log(updateCode);
}

function showNextSteps(results) {
  console.log("\n🚀 Next Steps:\n");

  if (results.missingFiles.length === 0) {
    console.log("✅ All audio files ready! You can now:");
    console.log("   1. Update AudioService.ts with real audio loading");
    console.log("   2. Test the app with: npx expo start --clear");
    console.log("   3. Begin implementing sound mixing features");
  } else {
    console.log("📝 To continue:");
    console.log("   1. Add the missing audio files to assets/sounds/");
    console.log("   2. Run this script again to verify");
    console.log("   3. Update AudioService.ts when all files are ready");
  }

  console.log("\n🎯 Sprint 3 Roadmap:");
  console.log("   Phase 1: ✅ Audio File Integration");
  console.log("   Phase 2: 🔄 Multi-sound Playback");
  console.log("   Phase 3: 🎛️ Sound Mixing Interface");
  console.log("   Phase 4: 💾 Custom Mix Saving");
}

// Main execution
function main() {
  const results = checkAudioFiles();

  if (results.existingFiles.length > 0) {
    generateAudioServiceUpdate();
  }

  showNextSteps(results);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkAudioFiles, REQUIRED_FILES };
