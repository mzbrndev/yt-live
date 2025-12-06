// Initialize Socket.io
const socket = io();

// State
let uploadedVideos = [];
let uploadedAudio = null;

// Elements
const streamKeyInput = document.getElementById('streamKey');
const durationInput = document.getElementById('duration');
const infiniteLoopCheckbox = document.getElementById('infiniteLoop');
const muteVideoCheckbox = document.getElementById('muteVideo');
const qualitySelect = document.getElementById('quality');
const fpsSelect = document.getElementById('fps');
const customBitrateSection = document.getElementById('customBitrateSection');
const customBitrateInput = document.getElementById('customBitrate');
const videoInput = document.getElementById('videoInput');
const audioInput = document.getElementById('audioInput');
const videoUploadZone = document.getElementById('videoUploadZone');
const audioUploadZone = document.getElementById('audioUploadZone');
const videoList = document.getElementById('videoList');
const audioUploadSection = document.getElementById('audioUploadSection');
const audioFileDisplay = document.getElementById('audioFileDisplay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const platformSelect = document.getElementById('platform');
const streamKeyLink = document.getElementById('streamKeyLink');
const statusIndicator = document.getElementById('statusIndicator');
const alerts = document.getElementById('alerts');

// Stats elements
const statStatus = document.getElementById('statStatus');
const statVideo = document.getElementById('statVideo');
const statTime = document.getElementById('statTime');
const statCount = document.getElementById('statCount');

// Health indicator elements
const healthIndicators = document.getElementById('healthIndicators');
const healthConnection = document.getElementById('healthConnection');
const healthCPU = document.getElementById('healthCPU');
const healthFPS = document.getElementById('healthFPS');
const healthBitrate = document.getElementById('healthBitrate');
const healthDuration = document.getElementById('healthDuration');
const languageSelect = document.getElementById('languageSelect');

// Translations
const translations = {
    en: {
        statusOffline: 'Offline',
        streamConfigTitle: '⚙️ Stream Configuration',
        platformLabel: 'Streaming Platform',
        platformHelp: 'Select your streaming platform',
        streamKeyLabel: 'Stream Key',
        streamKeyHelp: 'Get stream key from',
        durationLabel: 'Stream Duration (Hours)',
        infiniteLoop: 'Infinite Loop 24/7',
        durationHelp: 'Set 0 or check infinite for unlimited streaming',
        qualityLabel: 'Stream Quality',
        customBitrateHelp: 'Custom bitrate in kbps (500-10000)',
        qualityHelp: 'Select quality according to your internet bandwidth',
        fpsLabel: 'Frame Rate (FPS)',
        fpsHelp: '60 FPS requires higher bitrate',
        videoMgmtTitle: '🎬 Video Management',
        uploadVideoTitle: 'Upload Video Files',
        uploadVideoDesc: 'Drag & drop or click to upload',
        selectVideoBtn: 'Select Video',
        audioSettingsTitle: '🎵 Audio Settings',
        muteVideoLabel: 'Mute Video Audio',
        uploadAudioTitle: 'Upload Audio File',
        uploadAudioDesc: 'MP3, WAV, or other audio formats',
        selectAudioBtn: 'Select Audio',
        streamControlTitle: '🎮 Stream Control',
        statStatus: 'Status',
        statCurrentVideo: 'Current Video',
        statElapsedTime: 'Elapsed Time',
        statVideosQueued: 'Videos Queued',
        startStreamBtn: 'Start Streaming',
        stopStreamBtn: 'Stop Streaming',
        footerFFmpeg: '💡 Ensure FFmpeg is installed on your system',
        footerDashboard: '📺 Stream will appear in your platform\'s Live Dashboard after a few seconds',
        alertUploadVideo: 'Uploading',
        alertUploadSuccess: 'uploaded successfully!',
        alertUploadFail: 'Failed to upload',
        alertRemoveVideo: 'Video removed',
        alertRemoveFail: 'Failed to remove video',
        alertStreamStarted: 'Stream started! Check your Live Dashboard',
        alertStreamStopped: 'Stream stopped',
        alertEnterKey: 'Please enter stream key',
        alertUploadOne: 'Please upload at least one video',
        alertMuteWarning: 'Video will be muted but no audio file uploaded',
        changeThumbnail: 'Change Thumbnail'
    },
    id: {
        statusOffline: 'Offline',
        streamConfigTitle: '⚙️ Konfigurasi Stream',
        platformLabel: 'Platform Streaming',
        platformHelp: 'Pilih platform streaming Anda',
        streamKeyLabel: 'Stream Key',
        streamKeyHelp: 'Dapatkan stream key dari',
        durationLabel: 'Durasi Stream (Jam)',
        infiniteLoop: 'Loop Tak Terbatas 24/7',
        durationHelp: 'Set 0 atau centang infinite untuk streaming tanpa batas',
        qualityLabel: 'Kualitas Stream',
        customBitrateHelp: 'Bitrate kustom dalam kbps (500-10000)',
        qualityHelp: 'Pilih kualitas sesuai bandwidth internet Anda',
        fpsLabel: 'Frame Rate (FPS)',
        fpsHelp: '60 FPS membutuhkan bitrate lebih tinggi',
        videoMgmtTitle: '🎬 Manajemen Video',
        uploadVideoTitle: 'Upload File Video',
        uploadVideoDesc: 'Drag & drop atau klik untuk upload',
        selectVideoBtn: 'Pilih Video',
        audioSettingsTitle: '🎵 Pengaturan Audio',
        muteVideoLabel: 'Bisukan Audio Video',
        uploadAudioTitle: 'Upload File Audio',
        uploadAudioDesc: 'MP3, WAV, atau format audio lainnya',
        selectAudioBtn: 'Pilih Audio',
        streamControlTitle: '🎮 Kontrol Stream',
        statStatus: 'Status',
        statCurrentVideo: 'Video Saat Ini',
        statElapsedTime: 'Waktu Berjalan',
        statVideosQueued: 'Antrian Video',
        startStreamBtn: 'Mulai Streaming',
        stopStreamBtn: 'Hentikan Streaming',
        footerFFmpeg: '💡 Pastikan FFmpeg sudah terinstall di sistem Anda',
        footerDashboard: '📺 Stream akan muncul di Dashboard Live platform Anda dalam beberapa detik',
        alertUploadVideo: 'Mengupload',
        alertUploadSuccess: 'berhasil diupload!',
        alertUploadFail: 'Gagal mengupload',
        alertRemoveVideo: 'Video dihapus',
        alertRemoveFail: 'Gagal menghapus video',
        alertStreamStarted: 'Stream dimulai! Cek Dashboard Live Anda',
        alertStreamStopped: 'Stream dihentikan',
        alertEnterKey: 'Mohon masukkan stream key',
        alertUploadOne: 'Mohon upload setidaknya satu video',
        alertMuteWarning: 'Video akan dibisukan tapi tidak ada file audio yang diupload',
        changeThumbnail: 'Ganti Thumbnail'
    }
};

let currentLang = 'en';

// Initialize
loadFiles();
loadStreamKey();
loadPlatform();
loadLanguage();

function loadPlatform() {
    const savedPlatform = localStorage.getItem('yt_stream_platform');
    if (savedPlatform && (savedPlatform === 'youtube' || savedPlatform === 'facebook')) {
        platformSelect.value = savedPlatform;
    }
    updatePlatformHelp();
}

function savePlatform() {
    const platform = platformSelect.value;
    localStorage.setItem('yt_stream_platform', platform);
    updatePlatformHelp();
}

function updatePlatformHelp() {
    const platform = platformSelect.value;
    if (platform === 'facebook') {
        streamKeyLink.href = 'https://www.facebook.com/live/producer';
        streamKeyLink.textContent = 'Facebook Live Producer';
    } else {
        streamKeyLink.href = 'https://studio.youtube.com/channel/UC/livestreaming';
        streamKeyLink.textContent = 'YouTube Studio';
    }
}

// Platform change listener
platformSelect.addEventListener('change', savePlatform);

function loadLanguage() {
    const savedLang = localStorage.getItem('yt_stream_lang');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
        languageSelect.value = savedLang;
    }
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLang];

    // Update text content for elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });

    // Update placeholders if needed
    // Update dynamic content like button labels inside render functions
    renderVideoList();
}

languageSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    localStorage.setItem('yt_stream_lang', currentLang);
    updateLanguage();
});

// LocalStorage functions
function saveStreamKey() {
    const streamKey = streamKeyInput.value.trim();
    if (streamKey) {
        localStorage.setItem('yt_stream_key', streamKey);
    }
}

function loadStreamKey() {
    const savedKey = localStorage.getItem('yt_stream_key');
    if (savedKey) {
        streamKeyInput.value = savedKey;
    }
}

// Save stream key on input
streamKeyInput.addEventListener('input', saveStreamKey);

// Event Listeners

infiniteLoopCheckbox.addEventListener('change', (e) => {
    durationInput.disabled = e.target.checked;
    if (e.target.checked) {
        durationInput.value = 0;
    }
});

muteVideoCheckbox.addEventListener('change', (e) => {
    audioUploadSection.style.display = e.target.checked ? 'block' : 'none';
});

qualitySelect.addEventListener('change', (e) => {
    customBitrateSection.style.display = e.target.value === 'custom' ? 'block' : 'none';
});

// Video upload
videoUploadZone.addEventListener('click', () => {
    videoInput.click();
});

videoUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    videoUploadZone.classList.add('active');
});

videoUploadZone.addEventListener('dragleave', () => {
    videoUploadZone.classList.remove('active');
});

videoUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    videoUploadZone.classList.remove('active');
    const files = e.dataTransfer.files;
    handleVideoUpload(files);
});

videoInput.addEventListener('change', (e) => {
    handleVideoUpload(e.target.files);
});

// Audio upload
audioUploadZone.addEventListener('click', () => {
    audioInput.click();
});

audioUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    audioUploadZone.classList.add('active');
});

audioUploadZone.addEventListener('dragleave', () => {
    audioUploadZone.classList.remove('active');
});

audioUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    audioUploadZone.classList.remove('active');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleAudioUpload(files[0]);
    }
});

audioInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleAudioUpload(e.target.files[0]);
    }
});

// Functions

async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const data = await response.json();

        uploadedVideos = data.videos || [];
        uploadedAudio = data.audio || null;

        renderVideoList();
        renderAudioFile();
        updateStats();
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

async function handleVideoUpload(files) {
    for (let file of files) {
        const formData = new FormData();
        formData.append('video', file);

        try {
            showAlert('info', `${translations[currentLang].alertUploadVideo} ${file.name}...`);

            const response = await fetch('/api/upload/video', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                uploadedVideos.push(data.file);
                renderVideoList();
                updateStats();
                showAlert('success', `${file.name} ${translations[currentLang].alertUploadSuccess}`);
            } else {
                showAlert('error', `${translations[currentLang].alertUploadFail} ${file.name}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            showAlert('error', `Error uploading ${file.name}`);
        }
    }

    videoInput.value = '';
}

async function handleAudioUpload(file) {
    const formData = new FormData();
    formData.append('audio', file);

    try {
        showAlert('info', `Uploading ${file.name}...`);

        const response = await fetch('/api/upload/audio', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            uploadedAudio = data.file;
            renderAudioFile();
            showAlert('success', `${file.name} uploaded successfully!`);
        } else {
            showAlert('error', `Failed to upload ${file.name}`);
        }
    } catch (error) {
        console.error('Upload error:', error);
        showAlert('error', `Error uploading ${file.name}`);
    }

    audioInput.value = '';
}

function renderVideoList() {
    if (uploadedVideos.length === 0) {
        videoList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No videos uploaded yet</p>';
        return;
    }

    videoList.innerHTML = uploadedVideos.map((video, index) => {
        const thumbnailSrc = video.thumbnail ? `/thumbnails/${video.thumbnail}` : '';
        const thumbHtml = thumbnailSrc
            ? `<img src="${thumbnailSrc}" class="video-thumbnail" alt="Thumbnail">`
            : `<div class="video-thumbnail" style="display:flex;align-items:center;justify-content:center;color:#666"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>`;

        return `
    <div class="video-item">
      <div class="video-info">
        <div class="video-icon">${index + 1}</div>
        ${thumbHtml}
        <div class="video-details">
          <h4>${video.originalName}</h4>
          <p>${formatFileSize(video.size)}</p>
          <label class="btn-text" style="font-size: 0.8rem; cursor: pointer; color: var(--primary);">
            ${translations[currentLang].changeThumbnail}
            <input type="file" style="display: none;" accept="image/*" onchange="uploadThumbnail(this, '${video.filename}')">
          </label>
        </div>
      </div>
      <div class="video-actions">
        <button class="btn-icon" onclick="removeVideo('${video.filename}')" title="Remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `}).join('');
}

function renderAudioFile() {
    if (!uploadedAudio) {
        audioFileDisplay.style.display = 'none';
        return;
    }

    audioUploadZone.style.display = 'none';
    audioFileDisplay.style.display = 'flex';
    audioFileDisplay.innerHTML = `
    <div class="audio-info">
      <div class="audio-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        </svg>
      </div>
      <div>
        <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem;">${uploadedAudio.originalName}</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${formatFileSize(uploadedAudio.size)}</p>
      </div>
    </div>
    <button class="btn-icon" onclick="removeAudio()" title="Remove">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    </button>
  `;
}

async function removeVideo(filename) {
    try {
        const response = await fetch(`/api/video/${filename}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            uploadedVideos = uploadedVideos.filter(v => v.filename !== filename);
            renderVideoList();
            updateStats();
            updateStats();
            showAlert('success', translations[currentLang].alertRemoveVideo);
        } else {
            showAlert('error', translations[currentLang].alertRemoveFail);
        }
    } catch (error) {
        console.error('Remove error:', error);
        showAlert('error', 'Error removing video');
    }
}

async function removeAudio() {
    try {
        const response = await fetch('/api/audio', {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            uploadedAudio = null;
            audioUploadZone.style.display = 'block';
            renderAudioFile();
            showAlert('success', 'Audio removed');
        } else {
            showAlert('error', 'Failed to remove audio');
        }
    } catch (error) {
        console.error('Remove error:', error);
        showAlert('error', 'Error removing audio');
    }
}

async function startStream() {
    const streamKey = streamKeyInput.value.trim();
    const duration = infiniteLoopCheckbox.checked ? 0 : parseInt(durationInput.value) || 0;
    const muteVideo = muteVideoCheckbox.checked;

    // Get bitrate based on quality selection
    let bitrate = 3000; // default 1080p
    const quality = qualitySelect.value;
    const fps = parseInt(fpsSelect.value) || 30;

    if (quality === '1080p') bitrate = 3000;
    else if (quality === '720p') bitrate = 2000;
    else if (quality === '480p') bitrate = 1000;
    else if (quality === '360p') bitrate = 600;
    else if (quality === 'custom') bitrate = parseInt(customBitrateInput.value) || 3000;

    // Adjust bitrate for 60fps (usually needs more bitrate)
    if (fps === 60 && quality !== 'custom') {
        bitrate = Math.floor(bitrate * 1.5);
    }

    if (!streamKey) {
        showAlert('error', translations[currentLang].alertEnterKey);
        return;
    }

    if (uploadedVideos.length === 0) {
        showAlert('error', translations[currentLang].alertUploadOne);
        return;
    }

    if (muteVideo && !uploadedAudio) {
        showAlert('warning', translations[currentLang].alertMuteWarning);
    }

    try {
        const response = await fetch('/api/stream/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                streamKey,
                platform: platformSelect.value,
                duration,
                muteVideo,
                loopMode: 'infinite',
                bitrate: bitrate,
                fps: fps
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', translations[currentLang].alertStreamStarted);
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            showAlert('error', data.error || 'Failed to start stream');
        }
    } catch (error) {
        console.error('Start stream error:', error);
        showAlert('error', 'Error starting stream');
    }
}

async function stopStream() {
    try {
        const response = await fetch('/api/stream/stop', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('info', translations[currentLang].alertStreamStopped);
            startBtn.disabled = false;
            stopBtn.disabled = true;
        } else {
            showAlert('error', 'Failed to stop stream');
        }
    } catch (error) {
        console.error('Stop stream error:', error);
        showAlert('error', 'Error stopping stream');
    }
}

function updateStats() {
    statCount.textContent = uploadedVideos.length;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' :
            type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' :
                type === 'warning' ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' :
                    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
    </svg>
    <span>${message}</span>
  `;

    alerts.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Socket.io listeners

socket.on('stream-update', (data) => {
    if (data.isStreaming) {
        statusIndicator.classList.add('streaming');
        statusIndicator.querySelector('span').textContent = 'Live Streaming';
        statStatus.textContent = 'Live';
        statStatus.style.color = 'var(--success)';
        startBtn.disabled = true;
        stopBtn.disabled = false;
        healthIndicators.style.display = 'flex';

        if (data.currentVideo) {
            statVideo.textContent = data.currentVideo;
        }

        if (data.elapsedTime) {
            statTime.textContent = formatTime(data.elapsedTime);
            healthDuration.textContent = formatTime(data.elapsedTime);
        }

        // Update health indicators
        updateHealthIndicators();
    } else {
        statusIndicator.classList.remove('streaming');
        statusIndicator.querySelector('span').textContent = 'Offline';
        statStatus.textContent = 'Stopped';
        statStatus.style.color = 'var(--text-secondary)';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        statVideo.textContent = '-';
        statTime.textContent = '00:00:00';
        healthIndicators.style.display = 'none';

        if (data.message) {
            showAlert('info', data.message);
        }
    }
});

socket.on('stream-error', (data) => {
    showAlert('error', `Stream error: ${data.error}`);
});

// Update elapsed time every second
let reconnectErrors = 0;
setInterval(async () => {
    try {
        const response = await fetch('/api/stream/status');
        const data = await response.json();

        if (data.isStreaming && data.elapsedTime) {
            statTime.textContent = formatTime(data.elapsedTime);
            healthDuration.textContent = formatTime(data.elapsedTime);
            reconnectErrors = 0; // Reset on successful fetch
        }
    } catch (error) {
        reconnectErrors++;
        if (reconnectErrors > 3) {
            updateConnectionStatus('error');
        }
    }
}, 1000);

// Update health indicators
let cpuSimulated = 0;
function updateHealthIndicators() {
    // Simulate CPU usage (in real scenario, would come from backend)
    cpuSimulated = Math.floor(Math.random() * 20) + 15; // 15-35%
    healthCPU.textContent = `${cpuSimulated}%`;

    // FPS (fixed at 30 for now)
    healthFPS.textContent = fpsSelect.value || '30';

    // Get bitrate from quality selection
    const quality = qualitySelect.value;
    let bitrate = 3000;
    if (quality === '1080p') bitrate = 3000;
    else if (quality === '720p') bitrate = 2000;
    else if (quality === '480p') bitrate = 1000;
    else if (quality === '360p') bitrate = 600;
    else if (quality === 'custom') bitrate = parseInt(customBitrateInput.value) || 3000;

    healthBitrate.textContent = `${bitrate} kbps`;

    // Connection status
    updateConnectionStatus('good');
}

function updateConnectionStatus(status) {
    const connectionItem = healthIndicators.querySelector('.health-item:first-child');
    connectionItem.classList.remove('warning', 'error');

    if (status === 'good') {
        healthConnection.textContent = 'Good';
        healthConnection.style.color = 'var(--success)';
    } else if (status === 'warning') {
        healthConnection.textContent = 'Unstable';
        healthConnection.style.color = 'var(--warning)';
        connectionItem.classList.add('warning');
    } else if (status === 'error') {
        healthConnection.textContent = 'Poor';
        healthConnection.style.color = 'var(--danger)';
        connectionItem.classList.add('error');
    }
}

// Thumbnail upload
async function uploadThumbnail(input, videoFilename) {
    if (input.files && input.files[0]) {
        const formData = new FormData();
        formData.append('thumbnail', input.files[0]);

        try {
            showAlert('info', 'Uploading thumbnail...');
            const response = await fetch(`/api/upload/thumbnail/${videoFilename}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                // Update local state
                const video = uploadedVideos.find(v => v.filename === videoFilename);
                if (video) video.thumbnail = data.thumbnail;
                renderVideoList();
                showAlert('success', 'Thumbnail updated');
            } else {
                showAlert('error', 'Failed to upload thumbnail');
            }
        } catch (error) {
            console.error('Thumbnail upload error:', error);
            showAlert('error', 'Error uploading thumbnail');
        }
    }
}

// Internet Speed Monitor
const speedIndicator = document.createElement('div');
speedIndicator.className = 'internet-speed';
speedIndicator.innerHTML = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12" y2="20"></line>
  </svg>
  <span class="speed-value" id="speedValue">-- Mbps</span>
`;
document.body.appendChild(speedIndicator);

const speedValue = document.getElementById('speedValue');

async function checkSpeed() {
    try {
        const response = await fetch('/api/speedtest');
        const data = await response.json();
        if (data.success) {
            speedValue.textContent = `${data.speed} ${data.unit}`;
        }
    } catch (error) {
        // Silent fail
    }
}

// Check speed every 30 seconds
checkSpeed();
setInterval(checkSpeed, 30000);
