/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api-proxy/:path*',
                destination: 'https://dash.fortibtech.com/:path*',
            },
        ];
    },
};

export default nextConfig;
