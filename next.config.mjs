/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ylhfltcmljebclbhdyuy.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'cdn2.iconfinder.com',
            }
        ]
    },
    typescript: {
        ignoreBuildErrors: true, // Ignore TypeScript errors during build
    },
    eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors during build
    },
};

export default nextConfig;
