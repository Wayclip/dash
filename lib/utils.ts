import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type AppInfo = {
    backend_url: string;
    frontend_url: string;
    app_name: string;
    default_avatar_url: string;
    upload_limit_bytes: number;
};

export async function getAppInfo(): Promise<AppInfo> {
    return {
        backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        frontend_url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3003',
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

type RawPaymentInfo = {
    payments_enabled: boolean;
    active_tiers: string;
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

export async function getPaymentInfo(): Promise<ParsedPaymentInfo> {
    const api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${api_url}/get-payment-info`);

    if (!res.ok) {
        throw new Error('Failed to fetch payment info');
    }

    const rawData: RawPaymentInfo = await res.json();

    try {
        const parsedTiers: Tier[] = JSON.parse(rawData.active_tiers);

        return {
            payments_enabled: rawData.payments_enabled,
            active_tiers: parsedTiers,
        };
    } catch (error) {
        console.error('Failed to parse active_tiers JSON:', error);
        throw new Error('Failed to parse active_tiers from payment info');
    }
}

export async function getAuthInfo(): Promise<AuthInfo> {
    const api_url = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${api_url}/get-auth-info`);
    if (!res.ok) {
        throw new Error('Failed to fetch auth info');
    }
    return res.json();
}
