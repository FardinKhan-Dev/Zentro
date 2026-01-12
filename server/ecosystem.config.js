export const apps = [
    {
        name: 'api',
        script: './server.js',
        instances: 1,
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'production',
        },
        error_file: './logs/api-error.log',
        out_file: './logs/api-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        max_memory_restart: '300M', // Restart if API uses more than 300MB
    },
    {
        name: 'worker',
        script: './worker.js',
        instances: 1,
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'production',
        },
        error_file: './logs/worker-error.log',
        out_file: './logs/worker-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        max_memory_restart: '200M', // Restart if worker uses more than 200MB
    },
];
