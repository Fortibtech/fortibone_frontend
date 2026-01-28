module.exports = {
    apps: [
        {
            name: 'komora-web',
            script: 'npm',
            args: 'start',
            cwd: './', // Current directory
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3018
            }
        }
    ]
};
