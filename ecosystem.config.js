module.exports = {
    apps: [
        {
            name: 'youtube-stream',
            script: './cli.js',
            args: '--config stream.json',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production'
            },
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_file: './logs/pm2-combined.log',
            time: true,
            merge_logs: true,
            // Restart strategy
            min_uptime: '10s',
            max_restarts: 10,
            restart_delay: 5000,
            // Graceful shutdown
            kill_timeout: 5000,
            wait_ready: false,
            listen_timeout: 3000
        }
    ]
};
