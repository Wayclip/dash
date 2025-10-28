import { ThemeProvider } from '@/components/theme-provider';
import { Metadata } from 'next';
import { AppInfo, getAppInfo } from '@/lib/utils';
import { AuthProvider } from '@/contexts/authContext';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/nav';

const inter = Inter({
    subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
    let appInfo: AppInfo = {
        backend_url: '',
        frontend_url: '',
        app_name: 'MyApp',
        default_avatar_url: '',
        upload_limit_bytes: 0,
    };

    try {
        appInfo = await getAppInfo();
    } catch (e) {
        console.error('Failed to fetch app info for metadata', e);
    }

    return {
        title: appInfo.app_name,
        description: `Welcome to ${appInfo.app_name}`,
        openGraph: {
            title: appInfo.app_name,
            url: appInfo.frontend_url,
        },
        twitter: {
            card: 'summary_large_image',
            title: appInfo.app_name,
            description: `Welcome to ${appInfo.app_name}`,
        },
    };
}
export type LinkItem = {
    text: string;
    href: string;
    external?: boolean;
};

export type LinkCategories = {
    [key: string]: LinkItem[];
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const appInfo = await getAppInfo();
    const app_desc = process.env.NEXT_PUBLIC_APP_DESC;

    const footerLinks: LinkCategories = JSON.parse(process.env.NEXT_PUBLIC_FOOTER_LINKS || '{}');

    return (
        <html lang='en' className={inter.className} suppressHydrationWarning>
            <body className='flex flex-col min-h-screen'>
                <AuthProvider>
                    <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
                        <Navbar />
                        <main className='flex-1 w-full'>{children}</main>

                        <footer className='border-t py-12 px-4'>
                            <div className='container mx-auto max-w-6xl'>
                                <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
                                    <div className='md:col-span-2'>
                                        <div className='flex items-center space-x-2 mb-4'>
                                            <span className='font-bold text-xl'>{appInfo.app_name}</span>
                                        </div>
                                        <p className='text-muted-foreground mb-4 max-w-md'>{app_desc}</p>
                                    </div>
                                    {Object.entries(footerLinks).map(([category, links]) => (
                                        <div key={category}>
                                            <h4 className='font-semibold mb-4'>{category}</h4>
                                            <ul className='space-y-2 text-sm text-muted-foreground'>
                                                {links.map((link) => (
                                                    <li key={link.text}>
                                                        <Link
                                                            href={link.href}
                                                            target={link.external ? '_blank' : undefined}
                                                            rel={link.external ? 'noopener noreferrer' : undefined}
                                                            className='hover:text-foreground transition-colors'
                                                        >
                                                            {link.text}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                <div className='border-t pt-8 text-center'>
                                    <p className='text-sm text-muted-foreground'>
                                        &copy; {new Date().getFullYear()} {appInfo.app_name}. Open source software
                                        licensed under MIT.
                                    </p>
                                </div>
                            </div>
                        </footer>
                        <Toaster richColors theme='system' />
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
