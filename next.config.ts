import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dash',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
