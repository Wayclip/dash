import { NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/config';

export interface Tier {
    name: string;
    max_storage_bytes: number;
    stripe_price_id: string | null;
    display_price: string;
    display_frequency?: string;
    description: string;
    display_features: string[];
    is_popular?: boolean;
}

export interface AppConfig {
    apiUrl: string;
    appName: string;
    defaultAvatarUrl: string;
    uploadLimitBytes: number;
    paymentsEnabled: boolean;
    activeTiers: Tier[];
    discordAuthEnabled: boolean;
    githubAuthEnabled: boolean;
    googleAuthEnabled: boolean;
    emailAuthEnabled: boolean;
    footerLinks: Record<string, { text: string; href: string; external?: boolean }[]>;
    navbarLinks: { text: string; href: string }[];
}

export async function GET() {
    const config = getServerConfig();
    return NextResponse.json(config);
}
