import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type AppInfo = {
    app_name: string;
    default_avatar_url: string;
    upload_limit_bytes: number;
};

export function getAppInfo(): AppInfo {
    return {
        app_name: process.env.NEXT_PUBLIC_APP_NAME || 'Wayclip',
        default_avatar_url: process.env.NEXT_PUBLIC_DEFAULT_AVATAR || '',
        upload_limit_bytes: Number(process.env.NEXT_PUBLIC_UPLOAD_LIMIT_BYTES) || 0,
    };
}

export type Tier = {
    name: string;
    max_storage_bytes: number;
    stripe_price_id: string | null;
    display_price: string;
    display_frequency: string;
    description: string;
    display_features: string[];
    is_popular: boolean;
};

export type ParsedPaymentInfo = {
    payments_enabled: boolean;
    active_tiers: Tier[];
};

export type AuthInfo = {
    discord_auth_enabled: boolean;
    github_auth_enabled: boolean;
    google_auth_enabled: boolean;
    email_auth_enabled: boolean;
};

export function getPaymentInfo(): ParsedPaymentInfo {
    const payments_enabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

    let active_tiers: Tier[] = [];
    try {
        if (process.env.NEXT_PUBLIC_ACTIVE_TIERS) {
            active_tiers = JSON.parse(process.env.NEXT_PUBLIC_ACTIVE_TIERS);
        }
    } catch (error) {
        console.error('Failed to parse NEXT_PUBLIC_ACTIVE_TIERS:', error);
    }

    return { payments_enabled, active_tiers };
}

export function getAuthInfo(): AuthInfo {
    return {
        discord_auth_enabled: process.env.NEXT_PUBLIC_DISCORD_AUTH_ENABLED === 'true',
        github_auth_enabled: process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === 'true',
        google_auth_enabled: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true',
        email_auth_enabled: process.env.NEXT_PUBLIC_EMAIL_AUTH_ENABLED === 'true',
    };
}
