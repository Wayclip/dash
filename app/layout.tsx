import { ThemeProvider } from '@/components/theme-provider';
import { Metadata } from 'next';
import { AuthProvider } from '@/contexts/authContext';
import { ConfigProvider } from '@/contexts/configContext';
import { Toaster } from 'sonner';
import { Inter } from 'next/font/google';
import { AppShell } from '@/components/appShell';
import { getServerConfig } from '@/lib/config';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
});

export function generateMetadata(): Metadata {
    const config = getServerConfig();
    const appName = config?.appName || 'Wayclip';
    const description = config?.appDesc || `Welcome to ${appName}`;

    return {
        title: `${appName} | Dashboard`,
        description,
        openGraph: { title: `${appName} | Dashboard`, description },
        twitter: { card: 'summary_large_image', title: `${appName} | Dashboard`, description },
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' className={inter.className} suppressHydrationWarning>
            <body>
                <ConfigProvider>
                    <AuthProvider>
                        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
                            <AppShell>{children}</AppShell>
                            <Toaster richColors theme='system' />
                        </ThemeProvider>
                    </AuthProvider>
                </ConfigProvider>
            </body>
        </html>
    );
}
