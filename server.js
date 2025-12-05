const express = require('express');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
const videosDir = path.join(uploadsDir, 'videos');
const audioDir = path.join(uploadsDir, 'audio');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

[uploadsDir, videosDir, audioDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let type = 'videos';
    if (req.path.includes('audio')) type = 'audio';
    else if (req.path.includes('thumbnail')) type = 'thumbnails';

    cb(null, path.join(uploadsDir, type));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000 * 1024 * 1024 } // 5GB max file size
});

// Stream state
let streamState = {
  isStreaming: false,
  ffmpegProcess: null,
  config: null,
  startTime: null,
  currentVideo: null,
  videoList: [],
  audioFile: null,
  streamKey: '',
  shouldReconnect: true,
  reconnectAttempts: 0,
  maxReconnectAttempts: 10
};

// API Routes

// Upload video file
app.post('/api/upload/video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const videoInfo = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    thumbnail: null
  };

  // Generate thumbnail
  const thumbnailFilename = `thumb-${req.file.filename}.jpg`;
  const thumbnailPath = path.join(uploadsDir, 'thumbnails', thumbnailFilename);

  ffmpeg(req.file.path)
    .screenshots({
      timestamps: ['50%'],
      filename: thumbnailFilename,
      folder: path.join(uploadsDir, 'thumbnails'),
      size: '320x180'
    })
    .on('end', () => {
      videoInfo.thumbnail = thumbnailFilename;
      // Update in list if needed (reference is kept)
    });

  streamState.videoList.push(videoInfo);

  res.json({
    success: true,
    file: videoInfo,
    message: 'Video uploaded successfully'
  });
});

// Upload custom thumbnail
app.post('/api/upload/thumbnail/:videoFilename', upload.single('thumbnail'), (req, res) => {
  const { videoFilename } = req.params;
  const video = streamState.videoList.find(v => v.filename === videoFilename);

  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Update video thumbnail
  video.thumbnail = req.file.filename;

  res.json({
    success: true,
    thumbnail: req.file.filename,
    message: 'Thumbnail updated'
  });
});

// Upload audio file
app.post('/api/upload/audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Remove old audio file if exists
  if (streamState.audioFile && fs.existsSync(streamState.audioFile.path)) {
    fs.unlinkSync(streamState.audioFile.path);
  }

  streamState.audioFile = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size
  };

  res.json({
    success: true,
    file: streamState.audioFile,
    message: 'Audio uploaded successfully'
  });
});

// Get uploaded files
app.get('/api/files', (req, res) => {
  res.json({
    videos: streamState.videoList,
    audio: streamState.audioFile
  });
});

// Remove video from list
app.delete('/api/video/:filename', (req, res) => {
  const { filename } = req.params;
  const videoIndex = streamState.videoList.findIndex(v => v.filename === filename);

  if (videoIndex === -1) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const video = streamState.videoList[videoIndex];

  // Delete file
  if (fs.existsSync(video.path)) {
    fs.unlinkSync(video.path);
  }

  streamState.videoList.splice(videoIndex, 1);

  res.json({ success: true, message: 'Video removed' });
});

// Remove audio file
app.delete('/api/audio', (req, res) => {
  if (!streamState.audioFile) {
    return res.status(404).json({ error: 'No audio file' });
  }

  if (fs.existsSync(streamState.audioFile.path)) {
    fs.unlinkSync(streamState.audioFile.path);
  }

  streamState.audioFile = null;

  res.json({ success: true, message: 'Audio removed' });
});

// Start stream
app.post('/api/stream/start', (req, res) => {
  const { streamKey, duration, muteVideo, loopMode, bitrate, fps } = req.body;

  if (!streamKey) {
    return res.status(400).json({ error: 'Stream key is required' });
  }

  if (streamState.videoList.length === 0) {
    return res.status(400).json({ error: 'No videos uploaded' });
  }

  if (streamState.isStreaming) {
    return res.status(400).json({ error: 'Stream already running' });
  }

  streamState.config = {
    streamKey,
    duration: duration || 0, // 0 means infinite
    muteVideo: muteVideo || false,
    loopMode: loopMode || 'infinite',
    bitrate: bitrate || 3000, // Default to 3000k (1080p)
    fps: fps || 30 // Default to 30fps
  };

  streamState.streamKey = streamKey;
  streamState.shouldReconnect = true;
  streamState.reconnectAttempts = 0;

  startStream();

  res.json({
    success: true,
    message: 'Stream started',
    config: streamState.config
  });
});

// Stop stream
app.post('/api/stream/stop', (req, res) => {
  streamState.shouldReconnect = false;
  stopStream();

  res.json({
    success: true,
    message: 'Stream stopped'
  });
});

// Get stream status
app.get('/api/stream/status', (req, res) => {
  const status = {
    isStreaming: streamState.isStreaming,
    currentVideo: streamState.currentVideo,
    startTime: streamState.startTime,
    elapsedTime: streamState.startTime ? Date.now() - streamState.startTime : 0,
    videoCount: streamState.videoList.length,
    hasAudio: streamState.audioFile !== null,
    config: streamState.config
  };

  res.json(status);
});

// Internet Speed Test Endpoint
app.get('/api/speedtest', async (req, res) => {
  try {
    const startTime = Date.now();
    // Download a small file from a reliable CDN (e.g. 1MB test file)
    // Using a public test file from Cloudflare or similar
    const testUrl = 'https://speed.cloudflare.com/__down?bytes=1000000'; // 1MB

    const https = require('https');

    https.get(testUrl, (response) => {
      let downloaded = 0;

      response.on('data', (chunk) => {
        downloaded += chunk.length;
      });

      response.on('end', () => {
        const duration = (Date.now() - startTime) / 1000; // seconds
        const bits = downloaded * 8;
        const bps = bits / duration;
        const mbps = bps / (1024 * 1024);

        res.json({
          success: true,
          speed: mbps.toFixed(2),
          unit: 'Mbps'
        });
      });
    }).on('error', (err) => {
      res.status(500).json({ error: 'Speed test failed' });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FFmpeg Functions

function startStream() {
  if (streamState.isStreaming) {
    return;
  }

  streamState.isStreaming = true;
  streamState.startTime = Date.now();

  const rtmpUrl = `rtmp://a.rtmp.youtube.com/live2/${streamState.config.streamKey}`;

  // Create playlist file for multiple videos
  const playlistPath = path.join(uploadsDir, 'playlist.txt');
  const playlistContent = streamState.videoList
    .map(v => `file '${v.path.replace(/'/g, "'\\''")}'`)
    .join('\n');

  fs.writeFileSync(playlistPath, playlistContent);

  // Build FFmpeg command
  const ffmpegArgs = [];

  // Input: playlist with loop
  ffmpegArgs.push('-f', 'concat');
  ffmpegArgs.push('-safe', '0');
  ffmpegArgs.push('-stream_loop', '-1'); // Infinite loop
  ffmpegArgs.push('-re'); // Read input at native frame rate
  ffmpegArgs.push('-i', playlistPath);

  // Audio input if provided
  if (streamState.config.muteVideo && streamState.audioFile) {
    ffmpegArgs.push('-stream_loop', '-1');
    ffmpegArgs.push('-i', streamState.audioFile.path);
    ffmpegArgs.push('-map', '0:v'); // Video from first input
    ffmpegArgs.push('-map', '1:a'); // Audio from second input
  } else if (streamState.config.muteVideo) {
    ffmpegArgs.push('-an'); // No audio
  }

  // Video encoding settings
  const bitrate = streamState.config.bitrate || 3000;
  const bufsize = bitrate * 2; // Bufsize = 2x bitrate

  ffmpegArgs.push('-c:v', 'libx264');
  ffmpegArgs.push('-preset', 'veryfast');
  ffmpegArgs.push('-maxrate', `${bitrate}k`);
  ffmpegArgs.push('-bufsize', `${bufsize}k`);
  ffmpegArgs.push('-pix_fmt', 'yuv420p');
  ffmpegArgs.push('-g', '50');
  ffmpegArgs.push('-r', `${streamState.config.fps}`); // Frame rate

  // Audio encoding settings (if not muted)
  if (!streamState.config.muteVideo || streamState.audioFile) {
    ffmpegArgs.push('-c:a', 'aac');
    ffmpegArgs.push('-b:a', '128k');
    ffmpegArgs.push('-ar', '44100');
  }

  // Output format and URL
  ffmpegArgs.push('-f', 'flv');
  ffmpegArgs.push(rtmpUrl);

  console.log('Starting FFmpeg with args:', ffmpegArgs.join(' '));

  // Start FFmpeg process
  const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

  streamState.ffmpegProcess = ffmpegProcess;
  streamState.currentVideo = streamState.videoList[0]?.originalName || 'Unknown';

  // Handle FFmpeg output
  ffmpegProcess.stderr.on('data', (data) => {
    const output = data.toString();
    // console.log('FFmpeg:', output);

    // Broadcast status to clients
    io.emit('stream-update', {
      isStreaming: true,
      currentVideo: streamState.currentVideo,
      elapsedTime: Date.now() - streamState.startTime
    });
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
    streamState.isStreaming = false;
    streamState.ffmpegProcess = null;

    io.emit('stream-update', {
      isStreaming: false,
      message: `Stream ended with code ${code}`
    });

    // Auto-reconnect if enabled
    if (streamState.shouldReconnect && streamState.reconnectAttempts < streamState.maxReconnectAttempts) {
      streamState.reconnectAttempts++;
      console.log(`Attempting to reconnect (${streamState.reconnectAttempts}/${streamState.maxReconnectAttempts})...`);

      setTimeout(() => {
        if (streamState.shouldReconnect) {
          startStream();
        }
      }, 5000); // Wait 5 seconds before reconnecting
    }
  });

  ffmpegProcess.on('error', (error) => {
    console.error('FFmpeg error:', error);
    streamState.isStreaming = false;

    io.emit('stream-error', {
      error: error.message
    });
  });

  // Handle duration limit
  if (streamState.config.duration > 0) {
    const durationMs = streamState.config.duration * 60 * 60 * 1000; // Convert hours to ms
    setTimeout(() => {
      streamState.shouldReconnect = false;
      stopStream();
      io.emit('stream-update', {
        isStreaming: false,
        message: 'Stream duration limit reached'
      });
    }, durationMs);
  }
}

function stopStream() {
  if (streamState.ffmpegProcess) {
    streamState.ffmpegProcess.kill('SIGINT');
    streamState.ffmpegProcess = null;
  }

  streamState.isStreaming = false;
  streamState.startTime = null;
  streamState.currentVideo = null;

  io.emit('stream-update', {
    isStreaming: false,
    message: 'Stream stopped'
  });
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send current status
  socket.emit('stream-update', {
    isStreaming: streamState.isStreaming,
    currentVideo: streamState.currentVideo,
    startTime: streamState.startTime
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 YouTube Live Streaming Server running on http://localhost:${PORT}`);
  console.log(`📹 Upload videos and start streaming!`);
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  streamState.shouldReconnect = false;
  stopStream();
  process.exit(0);
});
