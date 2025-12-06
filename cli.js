#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Parse command-line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const config = {
        streamKey: null,
        videos: [],
        audio: null,
        muteVideo: false,
        duration: 0,
        bitrate: 3000,
        fps: 30,
        configFile: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case '--key':
            case '-k':
                config.streamKey = nextArg;
                i++;
                break;
            case '--video':
            case '-v':
                config.videos = nextArg.split(',').map(v => v.trim());
                i++;
                break;
            case '--audio':
            case '-a':
                config.audio = nextArg;
                i++;
                break;
            case '--mute-video':
                config.muteVideo = true;
                break;
            case '--duration':
            case '-d':
                config.duration = parseInt(nextArg, 10);
                i++;
                break;
            case '--bitrate':
            case '-b':
                config.bitrate = parseInt(nextArg, 10);
                i++;
                break;
            case '--fps':
            case '-f':
                config.fps = parseInt(nextArg, 10);
                i++;
                break;
            case '--config':
            case '-c':
                config.configFile = nextArg;
                i++;
                break;
            case '--help':
            case '-h':
                showHelp();
                process.exit(0);
                break;
            default:
                if (arg.startsWith('-')) {
                    console.error(`Unknown option: ${arg}`);
                    showHelp();
                    process.exit(1);
                }
        }
    }

    return config;
}

function showHelp() {
    console.log(`
🎬 YouTube 24/7 Live Streaming - CLI Mode

Usage:
  npm run cli -- [options]
  node cli.js [options]

Options:
  --key, -k <key>        YouTube stream key (required)
  --video, -v <files>    Video file(s), comma-separated (required)
  --audio, -a <file>     Audio file for replacement (optional)
  --mute-video           Mute original video audio
  --duration, -d <hours> Stream duration in hours, 0 = infinite (default: 0)
  --bitrate, -b <kbps>   Video bitrate in kbps (default: 3000)
  --fps, -f <fps>        Frame rate (default: 30)
  --config, -c <file>    Load config from JSON file
  --help, -h             Show this help message

Examples:
  # Single video, infinite loop
  npm run cli -- --key "YOUR_KEY" --video "video.mp4"

  # Multiple videos with audio replacement
  npm run cli -- --key "YOUR_KEY" --video "v1.mp4,v2.mp4" --audio "bgm.mp3" --mute-video

  # Stream for 24 hours
  npm run cli -- --key "YOUR_KEY" --video "video.mp4" --duration 24

  # Using config file
  npm run cli -- --config stream.json

  # Custom bitrate and FPS
  npm run cli -- --key "YOUR_KEY" --video "video.mp4" --bitrate 1500 --fps 25

Config File Format (JSON):
  {
    "streamKey": "YOUR_STREAM_KEY",
    "videos": ["video1.mp4", "video2.mp4"],
    "audio": "bgm.mp3",
    "muteVideo": true,
    "duration": 0,
    "bitrate": 3000,
    "fps": 30
  }
`);
}

function loadConfigFile(configPath) {
    try {
        const absolutePath = path.resolve(configPath);
        if (!fs.existsSync(absolutePath)) {
            console.error(`❌ Config file not found: ${absolutePath}`);
            process.exit(1);
        }

        const configData = fs.readFileSync(absolutePath, 'utf8');
        const config = JSON.parse(configData);

        return {
            streamKey: config.streamKey || null,
            videos: config.videos || [],
            audio: config.audio || null,
            muteVideo: config.muteVideo || false,
            duration: config.duration || 0,
            bitrate: config.bitrate || 3000,
            fps: config.fps || 30,
            configFile: configPath
        };
    } catch (error) {
        console.error(`❌ Error loading config file: ${error.message}`);
        process.exit(1);
    }
}

function validateConfig(config) {
    const errors = [];

    if (!config.streamKey) {
        errors.push('Stream key is required (--key or streamKey in config file)');
    }

    if (!config.videos || config.videos.length === 0) {
        errors.push('At least one video file is required (--video or videos in config file)');
    }

    // Validate video files exist
    for (const video of config.videos) {
        const videoPath = path.resolve(video);
        if (!fs.existsSync(videoPath)) {
            errors.push(`Video file not found: ${videoPath}`);
        }
    }

    // Validate audio file if provided
    if (config.audio) {
        const audioPath = path.resolve(config.audio);
        if (!fs.existsSync(audioPath)) {
            errors.push(`Audio file not found: ${audioPath}`);
        }
    }

    if (errors.length > 0) {
        console.error('❌ Configuration errors:\n');
        errors.forEach(err => console.error(`  - ${err}`));
        console.error('\nUse --help for usage information.\n');
        process.exit(1);
    }
}

function log(message, type = 'info') {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const prefix = {
        info: '📝',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        stream: '🎬'
    }[type] || '📝';

    console.log(`[${timestamp}] ${prefix} ${message}`);
}

function startStream(config) {
    log('Starting YouTube Live Stream...', 'stream');
    log(`Stream Key: ${config.streamKey.substring(0, 8)}...`, 'info');
    log(`Videos: ${config.videos.length} file(s)`, 'info');
    log(`Bitrate: ${config.bitrate}k, FPS: ${config.fps}`, 'info');

    if (config.audio) {
        log(`Audio: ${path.basename(config.audio)} (Video muted: ${config.muteVideo})`, 'info');
    }

    if (config.duration > 0) {
        log(`Duration: ${config.duration} hour(s)`, 'info');
    } else {
        log('Duration: Infinite (24/7 loop)', 'info');
    }

    const rtmpUrl = `rtmp://a.rtmp.youtube.com/live2/${config.streamKey}`;

    // Create uploads directory if not exists
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create playlist file
    const playlistPath = path.join(uploadsDir, 'playlist-cli.txt');
    const playlistContent = config.videos
        .map(v => {
            const absolutePath = path.resolve(v);
            return `file '${absolutePath.replace(/'/g, "'\\\\''")}'`;
        })
        .join('\n');

    fs.writeFileSync(playlistPath, playlistContent);
    log(`Playlist created: ${config.videos.join(', ')}`, 'success');

    // Build FFmpeg command
    const ffmpegArgs = [];

    // Input: playlist with loop
    ffmpegArgs.push('-f', 'concat');
    ffmpegArgs.push('-safe', '0');
    ffmpegArgs.push('-stream_loop', '-1'); // Infinite loop
    ffmpegArgs.push('-re'); // Read input at native frame rate
    ffmpegArgs.push('-i', playlistPath);

    // Audio input if provided
    if (config.muteVideo && config.audio) {
        const audioPath = path.resolve(config.audio);
        ffmpegArgs.push('-stream_loop', '-1');
        ffmpegArgs.push('-i', audioPath);
        ffmpegArgs.push('-map', '0:v'); // Video from first input
        ffmpegArgs.push('-map', '1:a'); // Audio from second input
    } else if (config.muteVideo) {
        ffmpegArgs.push('-an'); // No audio
    }

    // Video encoding settings
    const bufsize = config.bitrate * 2; // Bufsize = 2x bitrate

    ffmpegArgs.push('-c:v', 'libx264');
    ffmpegArgs.push('-preset', 'veryfast');
    ffmpegArgs.push('-maxrate', `${config.bitrate}k`);
    ffmpegArgs.push('-bufsize', `${bufsize}k`);
    ffmpegArgs.push('-pix_fmt', 'yuv420p');
    ffmpegArgs.push('-g', '50');
    ffmpegArgs.push('-r', `${config.fps}`); // Frame rate

    // Audio encoding settings (if not muted)
    if (!config.muteVideo || config.audio) {
        ffmpegArgs.push('-c:a', 'aac');
        ffmpegArgs.push('-b:a', '128k');
        ffmpegArgs.push('-ar', '44100');
    }

    // Output format and URL
    ffmpegArgs.push('-f', 'flv');
    ffmpegArgs.push(rtmpUrl);

    log('Starting FFmpeg process...', 'stream');

    // Start FFmpeg process
    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

    let streamStarted = false;
    let lastProgressUpdate = Date.now();

    // Handle FFmpeg output
    ffmpegProcess.stderr.on('data', (data) => {
        const output = data.toString();

        // Check if stream has started
        if (!streamStarted && output.includes('Stream mapping:')) {
            streamStarted = true;
            log('Stream is now LIVE! 🎉', 'success');
        }

        // Show progress updates every 30 seconds
        if (output.includes('frame=') && Date.now() - lastProgressUpdate > 30000) {
            const frameMatch = output.match(/frame=\s*(\d+)/);
            const fpsMatch = output.match(/fps=\s*([\d.]+)/);
            const bitrateMatch = output.match(/bitrate=\s*([\d.]+\w+)/);

            if (frameMatch && fpsMatch && bitrateMatch) {
                log(`Streaming: ${frameMatch[1]} frames, ${fpsMatch[1]} fps, ${bitrateMatch[1]}`, 'stream');
                lastProgressUpdate = Date.now();
            }
        }

        // Show errors
        if (output.includes('Error') || output.includes('error')) {
            log(output.trim(), 'error');
        }
    });

    ffmpegProcess.on('close', (code) => {
        if (code === 0) {
            log('Stream ended successfully', 'success');
        } else {
            log(`Stream ended with code ${code}`, 'warning');
        }
        process.exit(code);
    });

    ffmpegProcess.on('error', (error) => {
        log(`FFmpeg error: ${error.message}`, 'error');
        process.exit(1);
    });

    // Handle duration limit
    if (config.duration > 0) {
        const durationMs = config.duration * 60 * 60 * 1000; // Convert hours to ms
        log(`Stream will stop automatically after ${config.duration} hour(s)`, 'info');

        setTimeout(() => {
            log('Duration limit reached, stopping stream...', 'warning');
            ffmpegProcess.kill('SIGINT');
        }, durationMs);
    }

    // Graceful shutdown
    process.on('SIGINT', () => {
        log('\nReceived SIGINT, stopping stream gracefully...', 'warning');
        ffmpegProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
        log('\nReceived SIGTERM, stopping stream gracefully...', 'warning');
        ffmpegProcess.kill('SIGINT');
    });
}

// Main execution
function main() {
    console.log('🎬 YouTube 24/7 Live Streaming - CLI Mode\n');

    let config = parseArgs();

    // Load config file if specified
    if (config.configFile) {
        const fileConfig = loadConfigFile(config.configFile);
        // Command-line args override config file
        config = {
            ...fileConfig,
            ...Object.fromEntries(
                Object.entries(config).filter(([key, value]) =>
                    key !== 'configFile' && value !== null && (Array.isArray(value) ? value.length > 0 : true)
                )
            )
        };
        log(`Loaded config from: ${config.configFile}`, 'success');
    }

    // Validate configuration
    validateConfig(config);

    // Start streaming
    startStream(config);
}

main();
