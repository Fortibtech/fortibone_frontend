/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Proxy API requests to bypass CORS in development
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dash.fortibtech.com';
        return [
            {
                source: '/api-proxy/:path*',
                destination: `${apiUrl}/:path*`,
            },
        ];
    },

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: '*.cloudinary.com',
            },
        ],
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dash.fortibtech.com',
    },

    // Webpack configuration
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': require('path').resolve(__dirname, 'src'),
        };
        return config;
    },
};

module.exports = nextConfig;
