# 🎬 YouTube 24/7 Live Streaming Application

Aplikasi web untuk streaming video ke YouTube Live secara 24/7 dengan fitur loop otomatis, penggantian audio, dan kontrol durasi.

## ✨ Fitur Utama

- 🔄 **Loop 24/7** - Stream single atau multiple video secara berulang tanpa henti
- 🎵 **Audio Replacement** - Mute audio video dan ganti dengan file audio pilihan Anda
- ⏱️ **Duration Control** - Set durasi streaming (X jam) atau infinite loop 24/7
- 📊 **Real-time Monitoring** - Status streaming real-time dengan WebSocket
- 🔄 **Auto-reconnect** - Otomatis reconnect jika koneksi terputus
- 🎨 **Modern Web Interface** - GUI yang indah dan mudah digunakan
- 💻 **CLI Mode** - Command-line interface untuk VPS/server deployment
- 📱 **Responsive Design** - Bekerja di desktop, tablet, dan mobile


## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda sudah install:

1. **Node.js** (v14 atau lebih baru)
   ```bash
   node --version
   ```

2. **FFmpeg** (sangat penting!)
   - **Ubuntu/Debian:**
     ```bash
     sudo apt update
     sudo apt install ffmpeg
     ```
   - **macOS:**
     ```bash
     brew install ffmpeg
     ```
   - **Windows:**
     Download dari [ffmpeg.org](https://ffmpeg.org/download.html)

   Verifikasi instalasi:
   ```bash
   ffmpeg -version
   ```

## 🚀 Cara Install

1. Clone atau download repository ini

2. Install dependencies:
   ```bash
   npm install
   ```

3. Jalankan server:
   ```bash
   npm start
   ```

4. Buka browser dan akses:
   ```
   http://localhost:3000
   ```

## 📖 Cara Menggunakan

### 1. Dapatkan YouTube Stream Key

1. Buka [YouTube Studio](https://studio.youtube.com/)
2. Pilih menu **Live Streaming** atau **Go Live**
3. Pilih **Stream** (bukan Webcam)
4. Copy **Stream Key** Anda
5. **Penting:** Jangan share stream key ke siapa pun!

### 2. Upload Video

1. Klik atau drag & drop video files ke upload zone
2. Anda bisa upload multiple videos untuk playlist
3. Video akan di-loop secara berurutan

**Format video yang didukung:**
- MP4, AVI, MKV, MOV, FLV, WebM, dan lainnya

### 3. (Opsional) Ganti Audio

1. Centang **"Mute Video Audio"**
2. Upload file audio (MP3, WAV, dll)
3. Audio file akan di-loop mengikuti video

### 4. Konfigurasi Stream

1. Masukkan **YouTube Stream Key** Anda
2. Set durasi streaming:
   - **0 atau centang "Infinite Loop"** = streaming 24/7 tanpa batas
   - **Masukkan angka** = streaming X jam lalu otomatis stop

### 5. Mulai Streaming

1. Klik tombol **"Start Streaming"**
2. Tunggu beberapa detik
3. Buka [YouTube Live Dashboard](https://studio.youtube.com/channel/UC/livestreaming/manage)
4. Stream Anda akan muncul!

### 6. Monitor Status

- **Status Indicator** di header menunjukkan apakah stream sedang live
- **Stream Stats** menampilkan:
  - Status stream
  - Video yang sedang diputar
  - Waktu elapsed
  - Jumlah video dalam playlist

### 7. Stop Streaming

Klik tombol **"Stop Streaming"** kapan saja untuk menghentikan stream.

## 💻 CLI Mode (Command Line)

CLI mode memungkinkan Anda menjalankan streaming dari terminal tanpa perlu web interface. Sangat berguna untuk VPS/server deployment.

### Cara Menggunakan CLI

#### 1. Basic Usage

```bash
# Single video, infinite loop
npm run cli -- --key "YOUR_STREAM_KEY" --video "video.mp4"

# Multiple videos
npm run cli -- --key "YOUR_KEY" --video "video1.mp4,video2.mp4"

# Dengan audio replacement
npm run cli -- --key "YOUR_KEY" --video "video.mp4" --audio "bgm.mp3" --mute-video

# Stream selama 24 jam
npm run cli -- --key "YOUR_KEY" --video "video.mp4" --duration 24

# Custom bitrate dan FPS
npm run cli -- --key "YOUR_KEY" --video "video.mp4" --bitrate 1500 --fps 25
```

#### 2. Menggunakan Config File

Buat file konfigurasi JSON (misalnya `stream.json`):

```json
{
  "streamKey": "YOUR_STREAM_KEY",
  "videos": ["video1.mp4", "video2.mp4"],
  "audio": "bgm.mp3",
  "muteVideo": true,
  "duration": 0,
  "bitrate": 3000,
  "fps": 30
}
```

Lalu jalankan:

```bash
npm run cli -- --config stream.json
```

#### 3. CLI Options

```
--key, -k <key>        YouTube stream key (required)
--video, -v <files>    Video file(s), comma-separated (required)
--audio, -a <file>     Audio file untuk replacement (optional)
--mute-video           Mute audio video original
--duration, -d <hours> Durasi streaming dalam jam, 0 = infinite (default: 0)
--bitrate, -b <kbps>   Video bitrate dalam kbps (default: 3000)
--fps, -f <fps>        Frame rate (default: 30)
--config, -c <file>    Load config dari file JSON
--help, -h             Tampilkan help message
```

#### 4. Stop Streaming

Tekan `CTRL+C` untuk stop streaming dengan graceful shutdown.

## 🖥️ VPS Deployment

### Deploy ke VPS (Ubuntu/Debian)

#### 1. Setup Awal di VPS

```bash
# SSH ke VPS
ssh user@your-vps-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install FFmpeg
sudo apt update
sudo apt install ffmpeg -y

# Verifikasi
node --version
ffmpeg -version
```

#### 2. Clone Project

```bash
# Clone repository (HANYA SEKALI saat pertama kali)
git clone https://github.com/YOUR_USERNAME/yt-live.git
cd yt-live

# Install dependencies
npm install
```

#### 3. Setup Konfigurasi

```bash
# Copy example config
cp stream.example.json stream.json

# Edit config dengan stream key dan video files Anda
nano stream.json
```

#### 4. Upload Video Files

Upload video files ke VPS menggunakan SCP atau SFTP:

```bash
# Dari komputer local
scp video.mp4 user@vps-ip:/path/to/yt-live/uploads/videos/
scp bgm.mp3 user@vps-ip:/path/to/yt-live/uploads/audio/
```

### Running in Background dengan PM2 (Recommended)

PM2 adalah process manager yang akan menjaga stream tetap running bahkan setelah Anda logout dari SSH.

#### Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Atau install sebagai dependency
npm install
```

#### Start Stream dengan PM2

```bash
# Start streaming
npm run pm2:start

# Atau langsung dengan pm2
pm2 start ecosystem.config.js

# Lihat status
npm run pm2:status
# atau: pm2 status

# Lihat logs real-time
npm run pm2:logs
# atau: pm2 logs youtube-stream

# Stop streaming
npm run pm2:stop
# atau: pm2 stop youtube-stream

# Restart streaming
npm run pm2:restart
# atau: pm2 restart youtube-stream
```

#### Auto-start PM2 on Boot

```bash
# Setup PM2 untuk auto-start saat VPS reboot
pm2 startup

# Save current PM2 process list
pm2 save
```

#### PM2 Monitoring

```bash
# Monitor resource usage
pm2 monit

# Show detailed info
pm2 show youtube-stream

# View logs
pm2 logs youtube-stream --lines 100
```

### Running in Background dengan systemd

Alternatif untuk PM2, menggunakan systemd (native Linux service).

#### 1. Edit Service File

```bash
# Copy service file template
sudo cp youtube-stream.service /etc/systemd/system/

# Edit service file
sudo nano /etc/systemd/system/youtube-stream.service
```

Update path dan username di file:
- `YOUR_USERNAME` → username VPS Anda
- `/path/to/yt` → path lengkap ke folder project

#### 2. Enable dan Start Service

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

### Update Code di VPS

Setelah melakukan perubahan code di local dan push ke GitHub:

```bash
# SSH ke VPS
ssh user@vps-ip

# Masuk ke folder project
cd /path/to/yt-live

# Pull update terbaru
git pull origin main

# Install dependencies baru (jika ada)
npm install

# Restart streaming
# Jika pakai PM2:
pm2 restart youtube-stream

# Jika pakai systemd:
sudo systemctl restart youtube-stream
```

**PENTING:** **TIDAK PERLU** `git clone` lagi! Clone hanya dilakukan sekali saat pertama kali setup. Untuk update selanjutnya cukup `git pull`.

### Monitoring Stream di VPS

#### Dengan PM2

```bash
# Real-time logs
pm2 logs youtube-stream

# Monitor CPU/Memory
pm2 monit

# Status
pm2 status
```

#### Dengan systemd

```bash
# Real-time logs
sudo journalctl -u youtube-stream -f

# Last 100 lines
sudo journalctl -u youtube-stream -n 100

# Status
sudo systemctl status youtube-stream
```

#### Check FFmpeg Process

```bash
# Lihat FFmpeg process yang running
ps aux | grep ffmpeg

# Monitor bandwidth usage
sudo iftop
# atau
sudo nethogs
```



## ⚙️ Konfigurasi FFmpeg

Aplikasi ini menggunakan setting FFmpeg yang dioptimasi untuk YouTube:

```
Video Codec: H.264 (libx264)
Video Bitrate: 3000k (max)
Resolution: Mengikuti video source
Frame Rate: 30 fps
Audio Codec: AAC
Audio Bitrate: 128k
Sample Rate: 44100 Hz
```

## 🔧 Troubleshooting

### Stream tidak muncul di YouTube

1. **Cek stream key** - Pastikan stream key Anda benar
2. **Aktifkan live streaming** - Pertama kali menggunakan YouTube Live, harus tunggu verifikasi 24 jam
3. **Cek koneksi internet** - Pastikan upload speed minimal 5 Mbps
4. **Lihat console log** - Jalankan dengan `npm start` dan cek error messages

### FFmpeg error: Command not found

FFmpeg belum terinstall. Install FFmpeg terlebih dahulu (lihat Prerequisites di atas).

### Video tidak ter-encode dengan benar

1. Coba convert video ke format MP4 dengan H.264 terlebih dahulu
2. Gunakan tools seperti Handbrake atau ffmpeg command line
3. Pastikan video tidak corrupt

### Stream sering disconnect

1. Cek koneksi internet Anda
2. Auto-reconnect akan mencoba reconnect otomatis (max 10x)
3. Kurangi bitrate di `server.js` jika bandwidth terbatas

### Upload file gagal

1. Cek ukuran file (max 5GB per file)
2. Pastikan format file didukung
3. Cek disk space tersedia

## 🎯 Tips & Best Practices

### Optimasi Quality vs Bandwidth

Jika bandwidth terbatas, edit `server.js` line ~185:
```javascript
// Dari:
ffmpegArgs.push('-maxrate', '3000k');

// Jadi (untuk low bandwidth):
ffmpegArgs.push('-maxrate', '1500k');
```

### Multiple Quality Versions

Buat video dalam multiple resolusi dan pilih sesuai bandwidth:
- **1080p** = 3000k bitrate (butuh ~5 Mbps upload)
- **720p** = 1500k bitrate (butuh ~3 Mbps upload)
- **480p** = 1000k bitrate (butuh ~2 Mbps upload)

### 24/7 Streaming Tips

1. **Gunakan VPS/Server** - Jangan gunakan PC pribadi
2. **Stable connection** - Pastikan koneksi internet stabil
3. **Monitor regularly** - Cek stream status secara berkala
4. **Backup videos** - Simpan backup video files Anda
5. **Test terlebih dahulu** - Test dengan 1-2 jam dulu sebelum 24/7

### Playlist Management

- **Single video loop** - Upload 1 video saja
- **Multiple videos** - Upload 2+ videos, akan play berurutan lalu loop
- **Urutan** - Video diputar sesuai urutan upload (belum bisa reorder)

## 📊 Resource Usage

**RAM:** ~200-500 MB (tergantung video quality)  
**CPU:** ~20-40% (1 core, tergantung encoding settings)  
**Bandwidth:** ~3-5 Mbps upload (untuk 1080p 30fps)  
**Disk:** Sesuai ukuran video files

## 🔒 Keamanan

- **Jangan commit stream key** ke Git
- **Gunakan .env** untuk menyimpan sensitive data
- **Jangan share stream key** ke orang lain
- **Ganti stream key** secara berkala

## 🛠️ Development

### Project Structure

```
yt/
├── server.js           # Backend server (Express + FFmpeg)
├── package.json        # Dependencies
├── public/
│   ├── index.html      # Frontend UI
│   ├── style.css       # Styling
│   └── app.js          # Frontend logic
└── uploads/            # Uploaded files (auto-created)
    ├── videos/
    └── audio/
```

### API Endpoints

- `POST /api/upload/video` - Upload video file
- `POST /api/upload/audio` - Upload audio file
- `GET /api/files` - Get uploaded files
- `DELETE /api/video/:filename` - Remove video
- `DELETE /api/audio` - Remove audio
- `POST /api/stream/start` - Start streaming
- `POST /api/stream/stop` - Stop streaming
- `GET /api/stream/status` - Get stream status

### WebSocket Events

- `stream-update` - Stream status updates
- `stream-error` - Stream error notifications

## 📝 License

MIT License - Gunakan bebas untuk personal atau commercial projects.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 💡 Support

Jika ada masalah atau pertanyaan:
1. Cek section **Troubleshooting** di atas
2. Lihat console logs untuk error details
3. Buat issue di repository

---

**Selamat streaming! 🎉**
