import type { AppConfig, Tier } from '@/app/api/config/route';
export function getServerConfig(): AppConfig {
    let activeTiers: Tier[] = [];
    try {
        if (process.env.TIERS_JSON) {
            activeTiers = JSON.parse(process.env.TIERS_JSON);
        }
    } catch (error) {
        console.error('Failed to parse TIERS_JSON:', error);
        activeTiers = [];
    }

    let footerLinks = {};
    try {
        if (process.env.NEXT_PUBLIC_FOOTER_LINKS) {
            footerLinks = JSON.parse(process.env.NEXT_PUBLIC_FOOTER_LINKS);
        }
    } catch (error) {
        console.error('Failed to parse NEXT_PUBLIC_FOOTER_LINKS:', error);
        footerLinks = {};
    }

    let navbarLinks = [];
    try {
        if (process.env.NEXT_PUBLIC_NAVBAR_LINKS) {
            navbarLinks = JSON.parse(process.env.NEXT_PUBLIC_NAVBAR_LINKS);
        }
    } catch (error) {
        console.error('Failed to parse NEXT_PUBLIC_NAVBAR_LINKS:', error);
        navbarLinks = [];
    }

    return {
        apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'Wayclip',
        appDesc: process.env.NEXT_PUBLIC_APP_DESC || '',
        defaultAvatarUrl: process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL || '',
        uploadLimitBytes: Number(process.env.NEXT_PUBLIC_UPLOAD_LIMIT_BYTES) || 0,
        paymentsEnabled: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'TRUE',
        discordAuthEnabled: process.env.NEXT_PUBLIC_DISCORD_AUTH_ENABLED === 'TRUE',
        githubAuthEnabled: process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === 'TRUE',
        googleAuthEnabled: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'TRUE',
        emailAuthEnabled: process.env.NEXT_PUBLIC_EMAIL_AUTH_ENABLED === 'TRUE',
        activeTiers,
        footerLinks,
        navbarLinks,
    };
}
