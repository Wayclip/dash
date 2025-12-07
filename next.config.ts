import type { NextConfig } from 'next';
import { version } from './package.json';

const nextConfig: NextConfig = {
    output: 'standalone',
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dash',
                permanent: true,
            },
        ];
    },
    env: {
        APP_VERSION: version,
    },
};

export default nextConfig;
