'use client';

import { useConfig } from '@/contexts/configContext';
import { Navbar } from '@/components/nav';
import { Footer } from '@/components/footer';

export function AppShell({ children }: { children: React.ReactNode }) {
    const { config, isLoading } = useConfig();
    if (isLoading || !config) return null;

    return (
        <>
            <Navbar appName={config.appName} navbarLinks={config.navbarLinks} />
            <main className='flex-1 w-full'>{children}</main>
            <Footer appName={config.appName} appDesc={config.appDesc} footerLinks={config.footerLinks} />
        </>
    );
}
