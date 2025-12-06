# 🎬 YouTube & Facebook 24/7 Live Streaming Application

Aplikasi web untuk streaming video ke YouTube Live atau Facebook Live secara 24/7 dengan fitur loop otomatis, penggantian audio, dan kontrol durasi.

## ✨ Fitur Utama

- 🎯 **Multi-Platform** - Stream ke YouTube Live atau Facebook Live
- 🔄 **Loop 24/7** - Stream single atau multiple video secara berulang tanpa henti
- 🎵 **Audio Replacement** - Mute audio video dan ganti dengan file audio pilihan Anda
- ⏱️ **Duration Control** - Set durasi streaming (X jam) atau infinite loop 24/7
- 📊 **Real-time Monitoring** - Status streaming real-time dengan WebSocket
- 🔄 **Auto-reconnect** - Otomatis reconnect jika koneksi terputus
- 🎨 **Modern Web Interface** - GUI yang indah dan mudah digunakan
- 💻 **CLI Mode** - Command-line interface untuk VPS/server deployment
- 📱 **Responsive Design** - Bekerja di desktop, tablet, dan mobile

## 📑 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Web GUI Mode](#-web-gui-mode)
- [CLI Mode](#-cli-mode)
- [VPS Deployment](#️-vps-deployment)
- [Configuration](#️-configuration)
- [Troubleshooting](#-troubleshooting)
- [Tips & Best Practices](#-tips--best-practices)

---

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda sudah install:

### 1. Node.js (v14 atau lebih baru)
```bash
node --version
```

### 2. FFmpeg (sangat penting!)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg -y
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**  
Download dari [ffmpeg.org](https://ffmpeg.org/download.html)

**Verifikasi instalasi:**
```bash
ffmpeg -version
```

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/yt-live.git
cd yt-live

# 2. Install dependencies
npm install

# 3. Start web server
npm start

# 4. Buka browser
# http://localhost:3000
```

### VPS Deployment (Quick)

```bash
# 1. Clone & install
git clone https://github.com/YOUR_USERNAME/yt-live.git
cd yt-live
npm install

# 2. Setup config
cp stream.example.json stream.json
nano stream.json  # Edit dengan stream key Anda

# 3. Start dengan PM2
sudo npm install -g pm2
npm run pm2:start
```

---

## 🎨 Web GUI Mode

### 1. Pilih Platform Streaming

Pilih platform streaming Anda:
- **YouTube Live** - untuk streaming ke YouTube
- **Facebook Live** - untuk streaming ke Facebook

### 2. Dapatkan Stream Key

#### YouTube Stream Key:

1. Buka [YouTube Studio](https://studio.youtube.com/)
2. Pilih menu **Live Streaming** atau **Go Live**
3. Pilih **Stream** (bukan Webcam)
4. Copy **Stream Key** Anda
5. ⚠️ **Penting:** Jangan share stream key ke siapa pun!

#### Facebook Stream Key:

1. Buka [Facebook Live Producer](https://www.facebook.com/live/producer)
2. Pilih halaman/profil yang ingin digunakan untuk streaming
3. Pilih **"Streaming Software"** atau **"Use Stream Key"**
4. Copy **Stream Key** yang diberikan
5. ⚠️ **Penting:** Jangan share stream key ke siapa pun!

### 3. Upload Video

1. Klik atau drag & drop video files ke upload zone
2. Anda bisa upload multiple videos untuk playlist
3. Video akan di-loop secara berurutan

**Format video yang didukung:**  
MP4, AVI, MKV, MOV, FLV, WebM, dan lainnya

### 3. (Opsional) Ganti Audio

1. Centang **"Mute Video Audio"**
2. Upload file audio (MP3, WAV, dll)
3. Audio file akan di-loop mengikuti video

### 4. Mulai Streaming

1. Masukkan **YouTube Stream Key** Anda
2. Set durasi streaming:
   - **0 atau centang "Infinite Loop"** = streaming 24/7 tanpa batas
   - **Masukkan angka** = streaming X jam lalu otomatis stop
3. Klik tombol **"Start Streaming"**
4. Buka [YouTube Live Dashboard](https://studio.youtube.com/channel/UC/livestreaming/manage)
5. Stream Anda akan muncul!

### 5. Monitor & Stop

- **Status Indicator** di header menunjukkan apakah stream sedang live
- **Stream Stats** menampilkan status, video yang sedang diputar, waktu elapsed
- Klik **"Stop Streaming"** kapan saja untuk menghentikan stream

---

## 💻 CLI Mode

CLI mode memungkinkan Anda menjalankan streaming dari terminal tanpa perlu web interface. Sangat berguna untuk VPS/server deployment.

### Basic Usage

```bash
# Stream to YouTube (default)
npm run cli -- --key "YOUR_YT_KEY" --video "video.mp4"

# Stream to Facebook
npm run cli -- --platform facebook --key "YOUR_FB_KEY" --video "video.mp4"

# Multiple videos to YouTube
npm run cli -- --key "YOUR_KEY" --video "video1.mp4,video2.mp4"

# Facebook dengan audio replacement
npm run cli -- --platform facebook --key "YOUR_KEY" --video "video.mp4" --audio "bgm.mp3" --mute-video

# Stream selama 24 jam ke YouTube
npm run cli -- --key "YOUR_KEY" --video "video.mp4" --duration 24

# Custom bitrate dan FPS untuk Facebook
npm run cli -- --platform facebook --key "YOUR_KEY" --video "video.mp4" --bitrate 1500 --fps 25
```

### Menggunakan Config File

Buat file `stream.json`:

```json
{
  "platform": "youtube",
  "streamKey": "YOUR_STREAM_KEY",
  "videos": ["video1.mp4", "video2.mp4"],
  "audio": "bgm.mp3",
  "muteVideo": true,
  "duration": 0,
  "bitrate": 3000,
  "fps": 30
}
```

Jalankan:
```bash
npm run cli -- --config stream.json
```

### CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--key` | `-k` | Stream key (required) | - |
| `--platform` | `-p` | Platform: youtube or facebook | youtube |
| `--video` | `-v` | Video file(s), comma-separated (required) | - |
| `--audio` | `-a` | Audio file untuk replacement | - |
| `--mute-video` | - | Mute audio video original | false |
| `--duration` | `-d` | Durasi streaming dalam jam (0 = infinite) | 0 |
| `--bitrate` | `-b` | Video bitrate dalam kbps | 3000 |
| `--fps` | `-f` | Frame rate | 30 |
| `--config` | `-c` | Load config dari file JSON | - |
| `--help` | `-h` | Tampilkan help message | - |

### Stop Streaming

Tekan `CTRL+C` untuk stop streaming dengan graceful shutdown.

---

## 🖥️ VPS Deployment

### Setup Awal di VPS

```bash
# 1. SSH ke VPS
ssh user@your-vps-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install FFmpeg
sudo apt update
sudo apt install ffmpeg -y

# 4. Verifikasi
node --version
ffmpeg -version
```

### Clone Project (Pertama Kali)

```bash
# Clone repository (HANYA SEKALI saat pertama kali)
git clone https://github.com/YOUR_USERNAME/yt-live.git
cd yt-live

# Install dependencies
npm install
```

### Setup Konfigurasi

```bash
# Copy example config
cp stream.example.json stream.json

# Edit config dengan stream key dan video files Anda
nano stream.json
```

### Upload Video Files

Upload video files ke VPS menggunakan SCP:

```bash
# Dari komputer local
scp video.mp4 user@vps-ip:/path/to/yt-live/uploads/videos/
scp bgm.mp3 user@vps-ip:/path/to/yt-live/uploads/audio/
```

### Running in Background

#### Option 1: PM2 (Recommended)

PM2 adalah process manager yang akan menjaga stream tetap running bahkan setelah Anda logout dari SSH.

**Install PM2:**
```bash
sudo npm install -g pm2
```

**Start & Manage Stream:**
```bash
# Start streaming
npm run pm2:start

# Lihat status
npm run pm2:status

# Lihat logs real-time
npm run pm2:logs

# Stop streaming
npm run pm2:stop

# Restart streaming
npm run pm2:restart
```

**Auto-start on Boot:**
```bash
# Setup PM2 untuk auto-start saat VPS reboot
pm2 startup
pm2 save
```

**Monitoring:**
```bash
# Monitor resource usage
pm2 monit

# Show detailed info
pm2 show youtube-stream

# View logs
pm2 logs youtube-stream --lines 100
```

#### Option 2: systemd

Alternatif untuk PM2, menggunakan systemd (native Linux service).

**Setup Service:**
```bash
# Copy service file template
sudo cp youtube-stream.service /etc/systemd/system/

# Edit service file
sudo nano /etc/systemd/system/youtube-stream.service
```

Update path dan username di file:
- `YOUR_USERNAME` → username VPS Anda
- `/path/to/yt` → path lengkap ke folder project

**Manage Service:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start on boot
sudo systemctl enable youtube-stream

# Start service
sudo systemctl start youtube-stream

# Check status
sudo systemctl status youtube-stream

# View logs
sudo journalctl -u youtube-stream -f

# Stop service
sudo systemctl stop youtube-stream

# Restart service
sudo systemctl restart youtube-stream
```



### Monitoring Stream di VPS

**Dengan PM2:**
```bash
pm2 logs youtube-stream    # Real-time logs
pm2 monit                   # Monitor CPU/Memory
pm2 status                  # Status
```

**Dengan systemd:**
```bash
sudo journalctl -u youtube-stream -f         # Real-time logs
sudo journalctl -u youtube-stream -n 100     # Last 100 lines
sudo systemctl status youtube-stream         # Status
```

**Check FFmpeg Process:**
```bash
ps aux | grep ffmpeg        # Lihat FFmpeg process
sudo iftop                  # Monitor bandwidth
sudo nethogs                # Monitor bandwidth per process
```

---

## ⚙️ Configuration

### FFmpeg Settings

Aplikasi ini menggunakan setting FFmpeg yang dioptimasi untuk YouTube:

| Setting | Value |
|---------|-------|
| Video Codec | H.264 (libx264) |
| Video Bitrate | 3000k (default) |
| Resolution | Mengikuti video source |
| Frame Rate | 30 fps (default) |
| Audio Codec | AAC |
| Audio Bitrate | 128k |
| Sample Rate | 44100 Hz |

### Optimasi Bitrate

Jika bandwidth terbatas, sesuaikan bitrate:

| Quality | Bitrate | Upload Speed |
|---------|---------|--------------|
| 1080p | 3000k | ~5 Mbps |
| 720p | 1500k | ~3 Mbps |
| 480p | 1000k | ~2 Mbps |

**Via CLI:**
```bash
npm run cli -- --key "YOUR_KEY" --video "video.mp4" --bitrate 1500
```

**Via Config File:**
```json
{
  "bitrate": 1500
}
```

---

## 🔧 Troubleshooting

### Stream tidak muncul di YouTube

1. **Cek stream key** - Pastikan stream key Anda benar
2. **Aktifkan live streaming** - Pertama kali menggunakan YouTube Live, harus tunggu verifikasi 24 jam
3. **Cek koneksi internet** - Pastikan upload speed minimal 5 Mbps
4. **Lihat console log** - Cek error messages di terminal atau PM2 logs

### FFmpeg error: Command not found

FFmpeg belum terinstall. Install FFmpeg terlebih dahulu (lihat [Prerequisites](#-prerequisites)).

### Video tidak ter-encode dengan benar

1. Coba convert video ke format MP4 dengan H.264 terlebih dahulu
2. Gunakan tools seperti Handbrake atau ffmpeg command line
3. Pastikan video tidak corrupt

### Stream sering disconnect

1. Cek koneksi internet Anda
2. Auto-reconnect akan mencoba reconnect otomatis (max 10x)
3. Kurangi bitrate jika bandwidth terbatas

### Upload file gagal

1. Cek ukuran file (max 5GB per file)
2. Pastikan format file didukung
3. Cek disk space tersedia

---

## 🎯 Tips & Best Practices

### 24/7 Streaming

1. ✅ **Gunakan VPS/Server** - Jangan gunakan PC pribadi
2. ✅ **Stable connection** - Pastikan koneksi internet stabil
3. ✅ **Monitor regularly** - Cek stream status secara berkala
4. ✅ **Backup videos** - Simpan backup video files Anda
5. ✅ **Test terlebih dahulu** - Test dengan 1-2 jam dulu sebelum 24/7

### Playlist Management

- **Single video loop** - Upload 1 video saja
- **Multiple videos** - Upload 2+ videos, akan play berurutan lalu loop
- **Urutan** - Video diputar sesuai urutan upload

### Resource Usage

| Resource | Usage |
|----------|-------|
| RAM | ~200-500 MB (tergantung video quality) |
| CPU | ~20-40% (1 core, tergantung encoding) |
| Bandwidth | ~3-5 Mbps upload (untuk 1080p 30fps) |
| Disk | Sesuai ukuran video files |

### Keamanan

- ❌ **Jangan commit stream key** ke Git
- ✅ **File `stream.json` sudah di-gitignore**
- ❌ **Jangan share stream key** ke orang lain
- ✅ **Ganti stream key** secara berkala

---

## 🛠️ Development

### Project Structure

```
yt/
├── server.js              # Backend server (Express + FFmpeg)
├── cli.js                 # CLI mode entry point
├── package.json           # Dependencies & scripts
├── ecosystem.config.js    # PM2 configuration
├── youtube-stream.service # systemd service template
├── stream.example.json    # Example config file
├── public/
│   ├── index.html         # Frontend UI
│   ├── style.css          # Styling
│   └── app.js             # Frontend logic
└── uploads/               # Uploaded files (auto-created)
    ├── videos/
    └── audio/
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/video` | Upload video file |
| POST | `/api/upload/audio` | Upload audio file |
| GET | `/api/files` | Get uploaded files |
| DELETE | `/api/video/:filename` | Remove video |
| DELETE | `/api/audio` | Remove audio |
| POST | `/api/stream/start` | Start streaming |
| POST | `/api/stream/stop` | Stop streaming |
| GET | `/api/stream/status` | Get stream status |

### WebSocket Events

- `stream-update` - Stream status updates
- `stream-error` - Stream error notifications

---

## 📝 License

MIT License - Gunakan bebas untuk personal atau commercial projects.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 💡 Support

Jika ada masalah atau pertanyaan:
1. Cek section [Troubleshooting](#-troubleshooting) di atas
2. Lihat console logs untuk error details
3. Buat issue di repository

---

**Selamat streaming! 🎉**
