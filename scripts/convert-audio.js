#!/usr/bin/env node

/**
 * Audio File Converter and Renamer
 * Converts WAV/FLAC files to MP3 and renames them properly
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);
const SOUNDS_DIR = path.join(__dirname, "..", "assets", "sounds");

// Mapping of current files to target names
const FILE_MAPPINGS = [
  {
    pattern: /birds.*forest|forest.*birds/i,
    target: "forest_birds.mp3",
    description: "Forest Birds",
  },
  {
    pattern: /white.*noise|white-noise/i,
    target: "white_noise.mp3",
    description: "White Noise",
  },
  {
    pattern: /brown.*noise|brown-noise/i,
    target: "brown_noise.mp3",
    description: "Brown Noise",
  },
  {
    pattern: /waves|ocean|lake.*waves/i,
    target: "ocean_waves.mp3",
    description: "Ocean Waves",
  },
  {
    pattern: /rain.*light|light.*rain/i,
    target: "rain_light.mp3",
    description: "Light Rain",
  },
  {
    pattern: /fireplace|fire.*room/i,
    target: "fireplace.mp3",
    description: "Fireplace",
  },
  // New files added by user
  {
    pattern: /tibetan.*singing.*bowls|phluidbox.*tibetan/i,
    target: "tibetan_bowls.mp3",
    description: "Tibetan Bowls",
  },
  {
    pattern: /gentle.*piano.*music|orangefreesounds.*gentle.*piano/i,
    target: "gentle_piano.mp3",
    description: "Gentle Piano",
  },
  {
    pattern: /ohm.*voices|ellenmentor.*ohm/i,
    target: "om_chanting.mp3",
    description: "Om Chanting",
  },
  {
    pattern: /coffee.*shop.*binaural|speedenza.*coffee/i,
    target: "coffee_shop.mp3",
    description: "Coffee Shop",
  },
  {
    pattern: /loud.*rain.*thunders|spok13.*loud.*rain/i,
    target: "rain_thunder.mp3",
    description: "Rain Thunder",
  },
  {
    pattern: /thunder.*rain.*traffic.*city|klankbeeld.*thunder.*rain/i,
    target: "city_rain.mp3",
    description: "City Rain",
  },
  {
    pattern: /deep.*breathing|robinhood76.*deep.*breathing/i,
    target: "deep_breathing.mp3",
    description: "Deep Breathing",
  },
  {
    pattern: /crickets.*birdsong|felixblume.*crickets/i,
    target: "night_crickets.mp3",
    description: "Night Crickets",
  },
  {
    pattern: /binaural.*beats.*alpha|wim.*binaural.*beats/i,
    target: "alpha_waves.mp3",
    description: "Alpha Waves",
  },
  {
    pattern: /wind.*chimes.*quintet|philip_goddard.*wind.*chimes/i,
    target: "wind_chimes.mp3",
    description: "Wind Chimes",
  },
  {
    pattern: /ambient.*drone|cvltiv8r.*ambient.*drone/i,
    target: "ambient_drone.mp3",
    description: "Ambient Drone",
  },
  {
    pattern: /dam.*flowing.*water|thelastoneonearth.*flowing.*water/i,
    target: "flowing_water.mp3",
    description: "Flowing Water",
  },
];

async function checkFFmpeg() {
  try {
    await execAsync("ffmpeg -version");
    return true;
  } catch (error) {
    return false;
  }
}

async function convertFile(inputPath, outputPath) {
  try {
    const cmd = `ffmpeg -i "${inputPath}" -acodec mp3 -ab 192k -y "${outputPath}"`;
    console.log(
      `Converting: ${path.basename(inputPath)} → ${path.basename(outputPath)}`
    );
    await execAsync(cmd);
    return true;
  } catch (error) {
    console.error(`Failed to convert ${inputPath}:`, error.message);
    return false;
  }
}

async function identifyAndConvertFiles() {
  console.log("🎵 Audio File Converter\n");

  // Check if ffmpeg is available
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    console.log("❌ FFmpeg not found. Installing...\n");
    console.log("Installing FFmpeg via Homebrew:");
    console.log("brew install ffmpeg\n");

    try {
      console.log("Running: brew install ffmpeg...");
      await execAsync("brew install ffmpeg");
      console.log("✅ FFmpeg installed successfully!\n");
    } catch (error) {
      console.error("❌ Failed to install FFmpeg automatically.");
      console.log("\nPlease install FFmpeg manually:");
      console.log("1. Install Homebrew: https://brew.sh");
      console.log("2. Run: brew install ffmpeg");
      console.log("3. Run this script again");
      return;
    }
  }

  // Get all audio files in directory
  const files = fs
    .readdirSync(SOUNDS_DIR)
    .filter((file) => /\.(wav|flac|mp3|m4a|aac)$/i.test(file));

  console.log(`Found ${files.length} audio files:\n`);

  const conversions = [];

  for (const file of files) {
    const filePath = path.join(SOUNDS_DIR, file);
    let matched = false;

    // Try to match file to our targets
    for (const mapping of FILE_MAPPINGS) {
      if (mapping.pattern.test(file)) {
        const targetPath = path.join(SOUNDS_DIR, mapping.target);

        // Skip if target already exists and is newer
        if (fs.existsSync(targetPath)) {
          const sourceStats = fs.statSync(filePath);
          const targetStats = fs.statSync(targetPath);
          if (targetStats.mtime > sourceStats.mtime) {
            console.log(`✅ ${mapping.description}: Already converted`);
            matched = true;
            break;
          }
        }

        conversions.push({
          source: filePath,
          target: targetPath,
          description: mapping.description,
          needsConversion: !file.endsWith(".mp3"),
        });

        matched = true;
        break;
      }
    }

    if (!matched) {
      console.log(`❓ Unknown file: ${file}`);
    }
  }

  if (conversions.length === 0) {
    console.log("✅ All files already converted!");
    return;
  }

  console.log(`\n🔄 Converting ${conversions.length} files...\n`);

  for (const conversion of conversions) {
    if (conversion.needsConversion) {
      const success = await convertFile(conversion.source, conversion.target);
      if (success) {
        console.log(`✅ ${conversion.description}: Converted successfully`);

        // Remove original file after successful conversion
        try {
          fs.unlinkSync(conversion.source);
          console.log(
            `🗑️  Removed original: ${path.basename(conversion.source)}`
          );
        } catch (error) {
          console.warn(`⚠️  Could not remove original file: ${error.message}`);
        }
      }
    } else {
      // Just rename if already MP3
      try {
        fs.renameSync(conversion.source, conversion.target);
        console.log(`✅ ${conversion.description}: Renamed`);
      } catch (error) {
        console.error(
          `❌ Failed to rename ${conversion.source}:`,
          error.message
        );
      }
    }
  }

  console.log("\n🎉 Conversion complete!\n");

  // Run the audio checker
  console.log("Running audio verification...\n");
  exec("npm run setup-audio", (error, stdout) => {
    if (error) {
      console.error("Error running setup-audio:", error);
    } else {
      console.log(stdout);
    }
  });
}

// Run if called directly
if (require.main === module) {
  identifyAndConvertFiles().catch(console.error);
}

module.exports = { identifyAndConvertFiles };
